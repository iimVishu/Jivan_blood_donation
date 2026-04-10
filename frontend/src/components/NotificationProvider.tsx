"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Info, AlertTriangle, AlertCircle, X } from "lucide-react";
import { useSession } from "next-auth/react";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  role?: string; // Optional target role
  timestamp: Date;
}

interface SocketContextType {
  socket: Socket | null;
  notifications: Notification[];
  dismissNotification: (id: string) => void;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  notifications: [],
  dismissNotification: () => {},
});

export const useSocket = () => useContext(SocketContext);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { data: session } = useSession();

  useEffect(() => {
    // Connect to external NodeJS Socket server
    const backendUrl = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000";
    const newSocket = io(backendUrl, {
      reconnectionAttempts: 5,
      reconnectionDelay: 3000,
    });
    setSocket(newSocket);

    // Listen for real-time broadcasts
    newSocket.on("new_notification", (data: any) => {
      // Filter by role if specified
      if (data.role && session?.user?.role !== data.role && data.role !== "all") {
        return;
      }
      
      const newNotif: Notification = {
        id: Math.random().toString(36).substr(2, 9),
        title: data.title || "New Alert",
        message: data.message,
        type: data.type || "info",
        timestamp: data.timestamp ? new Date(data.timestamp) : new Date(),
      };
      
      setNotifications((prev) => [newNotif, ...prev].slice(0, 5)); // Keep last 5

      // Auto dismiss after 6 seconds
      setTimeout(() => {
        dismissNotification(newNotif.id);
      }, 6000);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [session?.user?.role]);

  const dismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const getIcon = (type: string) => {
    switch(type) {
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'error': return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'success': return <Bell className="h-5 w-5 text-green-500" />;
      default: return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  return (
    <SocketContext.Provider value={{ socket, notifications, dismissNotification }}>
      {children}
      
      {/* Toast Notification Container Overlay */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {notifications.map((notif) => (
            <motion.div
              key={notif.id}
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.9 }}
              className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 min-w-[300px] max-w-sm pointer-events-auto flex items-start gap-4"
            >
              <div className="flex-shrink-0 mt-0.5">
                {getIcon(notif.type)}
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-gray-900">{notif.title}</h4>
                <p className="text-sm text-gray-600 mt-1">{notif.message}</p>
              </div>
              <button 
                onClick={() => dismissNotification(notif.id)}
                className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Dismiss"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </SocketContext.Provider>
  );
}