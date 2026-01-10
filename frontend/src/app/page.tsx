"use client";

import Link from "next/link";
import { Heart, Users, Clock, MapPin, ShieldCheck, Activity, Phone, Calendar, ArrowRight, Zap, Globe, Database, AlertTriangle } from "lucide-react";
import BloodGravity from "@/components/BloodGravity";
import ChatBot from "@/components/ChatBot";
import LiveActivity from "@/components/LiveActivity";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState, useEffect } from "react";

export default function Home() {
  const targetRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start end", "end start"]
  });

  const [activeDisaster, setActiveDisaster] = useState<any>(null);

  useEffect(() => {
    const fetchDisaster = async () => {
      try {
        const res = await fetch("/api/disaster");
        if (res.ok) {
          const data = await res.json();
          setActiveDisaster(data.activeAlert);
        }
      } catch (error) {
        console.error("Error fetching disaster status:", error);
      }
    };
    fetchDisaster();
  }, []);

  const opacity = useTransform(scrollYProgress, [0, 0.5], [0, 1]);
  const y = useTransform(scrollYProgress, [0, 0.5], [100, 0]);

  return (
    <div className="flex flex-col min-h-screen font-sans bg-white text-black selection:bg-black selection:text-white">
      {activeDisaster && (
        <motion.div 
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          className="fixed top-0 left-0 right-0 z-50 bg-red-600 text-white p-4 shadow-xl"
        >
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-full animate-pulse">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold uppercase tracking-wider">Emergency Alert: {activeDisaster.title}</h3>
                <p className="text-red-100">{activeDisaster.description}</p>
                <div className="flex gap-2 mt-2 text-sm font-medium">
                  <span className="bg-white/20 px-2 py-1 rounded flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {activeDisaster.location}
                  </span>
                  <span className="bg-white/20 px-2 py-1 rounded">
                    Radius: {activeDisaster.radius}km
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col items-end gap-2">
              <div className="text-sm font-medium mb-1">Urgent Need:</div>
              <div className="flex gap-2">
                {activeDisaster.requiredBloodGroups.map((bg: string) => (
                  <span key={bg} className="bg-white text-red-600 px-3 py-1 rounded-full font-bold text-sm">
                    {bg}
                  </span>
                ))}
              </div>
              <Link href="/donate">
                <button className="mt-2 bg-white text-red-600 px-6 py-2 rounded-full font-bold hover:bg-gray-100 transition-colors">
                  Respond Now
                </button>
              </Link>
            </div>
          </div>
        </motion.div>
      )}

      <ChatBot />
      
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Minimal Gravity Background - Lower opacity for aesthetic feel */}
        <div className="absolute inset-0 z-0 opacity-60">
          <BloodGravity />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="max-w-4xl mx-auto"
          >
            <motion.h1 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-6xl md:text-9xl font-bold mb-8 tracking-tighter text-black leading-[0.9]"
            >
              जीवन
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-xl md:text-2xl mb-12 text-gray-500 font-light tracking-wide max-w-2xl mx-auto"
            >
              The bridge between life and hope. <br/>
              India's most trusted blood donation network.
            </motion.p>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-6 justify-center"
            >
              <Link href="/donate">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-10 py-4 bg-black text-white rounded-full font-medium text-lg hover:bg-gray-800 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  Donate Now
                </motion.button>
              </Link>
              <Link href="/camps">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-10 py-4 bg-white border border-gray-200 text-black rounded-full font-medium text-lg hover:border-black transition-all duration-300"
                >
                  Organize Camp
                </motion.button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Minimal Stats Section */}
      <section className="py-32 bg-white" ref={targetRef}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-24 items-start">
            <motion.div 
              style={{ opacity, y }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl md:text-6xl font-bold text-black mb-12 tracking-tight leading-none">
                Real-time<br/>Impact.
              </h2>
              <p className="text-xl text-gray-500 font-light leading-relaxed mb-12">
                We believe in transparency and efficiency. Our network connects donors to recipients instantly, reducing wastage and saving time when it matters most.
              </p>
              
              <div className="space-y-12">
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                  className="border-b border-gray-100 pb-8"
                >
                  <div className="text-6xl font-light text-black mb-2">2.1M</div>
                  <div className="text-sm text-gray-400 uppercase tracking-widest">Units Shortage</div>
                </motion.div>
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 }}
                  className="border-b border-gray-100 pb-8"
                >
                  <div className="text-6xl font-light text-black mb-2">13M</div>
                  <div className="text-sm text-gray-400 uppercase tracking-widest">Annual Supply</div>
                </motion.div>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative pt-12"
            >
              <LiveActivity />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Grid - Minimal */}
      <section className="py-32 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-24">
            <h2 className="text-3xl font-medium text-black mb-4">System Modules</h2>
            <div className="h-px w-24 bg-black"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { icon: Users, title: "Smart Camps", desc: "Optimized locations based on data." },
              { icon: Activity, title: "Health Pass", desc: "Track vitals and history digitally." },
              { icon: Phone, title: "Emergency Link", desc: "Direct line for critical needs." }
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.2 }}
                whileHover={{ y: -10 }}
                className="group"
              >
                <div className="w-12 h-12 bg-white border border-gray-200 rounded-full flex items-center justify-center mb-8 group-hover:border-black transition-colors duration-300">
                  <feature.icon className="h-5 w-5 text-black" />
                </div>
                <h3 className="text-xl font-medium text-black mb-4">{feature.title}</h3>
                <p className="text-gray-500 font-light leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Impact - Clean Typography */}
      <section className="py-32 bg-white text-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 text-center">
            {[
              { value: "28K", label: "Units Collected" },
              { value: "276K", label: "Lives Saved" },
              { value: "222", label: "Camps Deployed" }
            ].map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.2, type: "spring" }}
              >
                <div className="text-7xl font-bold mb-4">{stat.value}</div>
                <div className="text-gray-400 text-sm uppercase tracking-widest">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial - Minimal */}
      <section className="py-32 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <span className="text-6xl text-gray-300 font-serif">"</span>
          </motion.div>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-2xl md:text-3xl text-black font-light leading-relaxed mb-12"
          >
            We needed blood immediately in India. जीवन's network bridged the gap across cities. An absolute marvel of human coordination.
          </motion.p>
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="flex flex-col items-center"
          >
            <div className="font-medium text-black">Vishal</div>
            <div className="text-sm text-gray-500 mt-1">India • Verified Request</div>
          </motion.div>
        </div>
      </section>

      {/* CTA - Minimal */}
      <section className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold text-black mb-8 tracking-tight"
          >
            Join the movement.
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-xl text-gray-500 mb-12 font-light"
          >
            Your contribution matters more than you know.
          </motion.p>
          <Link href="/register">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center px-12 py-5 bg-black text-white rounded-full font-medium text-lg hover:bg-gray-800 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Register Now <ArrowRight className="ml-3 h-5 w-5" />
            </motion.button>
          </Link>
        </div>
      </section>
    </div>
  );
}



