"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const locations = [
  { x: 30, y: 40, city: "Delhi" },
  { x: 25, y: 55, city: "Mumbai" },
  { x: 45, y: 60, city: "Bangalore" },
  { x: 50, y: 50, city: "Hyderabad" },
  { x: 60, y: 45, city: "Kolkata" },
  { x: 35, y: 30, city: "Chandigarh" },
  { x: 40, y: 70, city: "Chennai" },
];

export default function LiveActivity() {
  const [activePing, setActivePing] = useState<number | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * locations.length);
      setActivePing(randomIndex);
      setTimeout(() => setActivePing(null), 2000);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-[400px] bg-white border border-gray-200 flex items-center justify-center overflow-hidden rounded-2xl shadow-sm">
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03]"></div>
      
      {/* Stylized Map Placeholder */}
      <div className="relative w-[300px] h-[350px] opacity-100">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <motion.path
            d="M30,10 Q50,0 70,10 T90,30 T70,80 T50,95 T30,80 T10,30 T30,10"
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="0.5"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, ease: "easeInOut" }}
          />
          {/* Abstract India Shape Approximation for visual effect */}
           <motion.path
            d="M30,20 L40,15 L60,15 L70,25 L65,40 L75,45 L70,60 L50,85 L30,60 L20,40 L30,20"
            fill="#f9fafb"
            stroke="#e5e7eb"
            strokeWidth="0.5"
            initial={{ pathLength: 0, fillOpacity: 0 }}
            animate={{ pathLength: 1, fillOpacity: 1 }}
            transition={{ duration: 2.5, ease: "easeInOut", delay: 0.5 }}
          />
        </svg>

        {locations.map((loc, index) => (
          <div
            key={index}
            className="absolute"
            style={{ left: `${loc.x}%`, top: `${loc.y}%` }}
          >
            <div className="relative">
              <div className="w-1.5 h-1.5 bg-gray-300 rounded-full"></div>
              {activePing === index && (
                <>
                  <motion.div
                    initial={{ scale: 1, opacity: 1 }}
                    animate={{ scale: 3, opacity: 0 }}
                    transition={{ duration: 1.5 }}
                    className="absolute -top-0.5 -left-0.5 w-2.5 h-2.5 bg-red-500 rounded-full opacity-20"
                  ></motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: -15 }}
                    exit={{ opacity: 0 }}
                    className="absolute left-3 -top-4 bg-white border border-gray-200 text-gray-900 text-[10px] px-2 py-1 shadow-sm whitespace-nowrap z-10 tracking-wide uppercase font-semibold"
                  >
                    {loc.city}
                  </motion.div>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="absolute bottom-6 left-6 text-[10px] text-gray-500 font-mono tracking-widest uppercase">
        <div className="flex items-center space-x-2">
          <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span>
          <span>Network Activity</span>
        </div>
      </div>
    </div>
  );
}
