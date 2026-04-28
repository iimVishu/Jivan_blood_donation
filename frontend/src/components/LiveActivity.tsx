"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const locations = [
  { x: 24, y: 62, city: "SASARAM" },
  { x: 37, y: 58, city: "BIKRAMGANJ" },
  { x: 46, y: 50, city: "ARA" },
  { x: 62, y: 42, city: "PATNA" },
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
      
      {/* Stylized Bihar Map */}
      <div className="relative w-[300px] h-[350px] opacity-100">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <motion.path
            d="M12,56 L20,46 L32,39 L46,36 L59,35 L71,31 L82,34 L88,43 L86,52 L77,57 L66,60 L56,65 L44,70 L34,74 L24,74 L15,67 L12,56 Z"
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="0.5"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, ease: "easeInOut" }}
          />
          {/* Simplified Bihar region fill */}
           <motion.path
            d="M17,55 L24,47 L35,42 L47,39 L58,38 L69,35 L79,37 L83,44 L81,51 L73,56 L63,59 L53,63 L42,67 L33,70 L25,70 L19,64 L17,55 Z"
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
          <span>Bihar Activity</span>
        </div>
      </div>
    </div>
  );
}
