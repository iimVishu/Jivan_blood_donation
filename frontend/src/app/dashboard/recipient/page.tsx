"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

interface Request {
  _id: string;
  patientName: string;
  bloodGroup: string;
  units: number;
  hospitalName: string;
  status: string;
  urgency: string;
  createdAt: string;
}

export default function RecipientDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/login");
      return;
    }
    if (session.user.role !== "recipient") {
      router.push("/dashboard");
      return;
    }

    fetchRequests();
  }, [session, status, router]);

  const fetchRequests = async () => {
    try {
      const res = await fetch(`/api/requests?userId=${session?.user.id}`);
      if (res.ok) {
        const data = await res.json();
        setRequests(data);
      }
    } catch (error) {
      console.error("Error fetching requests:", error);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="md:flex md:items-center md:justify-between mb-8"
        >
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              Recipient Dashboard
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Manage your blood requests and track their status.
            </p>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4">
            <Link href="/request">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                New Request
              </motion.button>
            </Link>
          </div>
        </motion.div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-8">
          {[
            { label: "Total Requests", value: requests.length, color: "text-gray-900" },
            { label: "Pending", value: requests.filter((r) => r.status === "pending").length, color: "text-yellow-600" },
            { label: "Fulfilled", value: requests.filter((r) => r.status === "fulfilled").length, color: "text-green-600" }
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white overflow-hidden shadow rounded-lg"
            >
              <div className="px-4 py-5 sm:p-6">
                <dt className="text-sm font-medium text-gray-500 truncate">{stat.label}</dt>
                <dd className={`mt-1 text-3xl font-semibold ${stat.color}`}>{stat.value}</dd>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Requests List */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white shadow overflow-hidden sm:rounded-md"
        >
          <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Your Requests</h3>
          </div>
          <ul role="list" className="divide-y divide-gray-200">
            {requests.length === 0 ? (
              <li className="px-4 py-4 sm:px-6 text-center text-gray-500">
                No requests found. Create a new request to get started.
              </li>
            ) : (
              requests.map((request, index) => (
                <motion.li 
                  key={request._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 + 0.4 }}
                >
                  <div className="px-4 py-4 sm:px-6 hover:bg-gray-50 transition-colors duration-150">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <p className="text-sm font-medium text-red-600 truncate">
                          {request.patientName} ({request.bloodGroup})
                        </p>
                        <p className="text-sm text-gray-500">
                          {request.hospitalName} • {request.units} Units
                        </p>
                      </div>
                      <div className="flex flex-col items-end">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            request.status === "fulfilled"
                              ? "bg-green-100 text-green-800"
                              : request.status === "rejected"
                              ? "bg-red-100 text-red-800"
                              : request.status === "approved"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        </span>
                        <p className="mt-1 text-xs text-gray-500">
                          {new Date(request.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.li>
              ))
            )}
          </ul>
        </motion.div>
      </div>
    </div>
  );
}
