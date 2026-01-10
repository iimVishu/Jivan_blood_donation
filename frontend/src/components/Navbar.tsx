"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import { Menu, X, Droplet } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  const getDashboardLink = () => {
    if (!session?.user?.role) return '/dashboard';
    switch (session.user.role) {
      case 'admin': return '/dashboard/admin';
      case 'hospital': return '/dashboard/hospital';
      case 'recipient': return '/dashboard/recipient';
      case 'donor': return '/dashboard/donor';
      default: return '/dashboard';
    }
  };

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center group">
              <Droplet className="h-6 w-6 text-red-600 group-hover:scale-110 transition-transform duration-300" />
              <span className="ml-3 text-lg font-medium text-black tracking-tight group-hover:text-gray-600 transition-colors">जीवन</span>
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-sm text-gray-600 hover:text-black transition-colors">Home</Link>
            <Link href="/about" className="text-sm text-gray-600 hover:text-black transition-colors">About</Link>
            <Link href="/camps" className="text-sm text-gray-600 hover:text-black transition-colors">Camps</Link>
            <Link href="/leaderboard" className="text-sm text-gray-600 hover:text-black transition-colors">Leaderboard</Link>
            <Link href="/education" className="text-sm text-gray-600 hover:text-black transition-colors">Learn</Link>
            
            {/* Donor specific links */}
            {session?.user.role === 'donor' && (
              <>
                <Link href="/donate" className="text-sm text-gray-600 hover:text-black transition-colors">Donate Blood</Link>
                <Link href="/eligibility" className="text-sm text-gray-600 hover:text-black transition-colors">Check Eligibility</Link>
              </>
            )}

            {/* Recipient specific links */}
            {session?.user.role === 'recipient' && (
              <Link href="/request" className="text-sm text-gray-600 hover:text-black transition-colors">Request Blood</Link>
            )}

            {/* Hospital specific links */}
            {session?.user.role === 'hospital' && (
              <Link href="/request" className="text-sm text-gray-600 hover:text-black transition-colors">Request Blood</Link>
            )}

            {/* Public links (only when not logged in) */}
            {!session && (
              <>
                <Link href="/donate" className="text-sm text-gray-600 hover:text-black transition-colors">Donate Blood</Link>
                <Link href="/join" className="text-sm text-gray-600 hover:text-black transition-colors">Join</Link>
              </>
            )}

            {/* Support Us - hide for admin */}
            {session?.user.role !== 'admin' && (
              <Link href="/donate-money" className="text-sm font-medium text-red-600 hover:text-red-700 transition-colors">Support Us</Link>
            )}

            {/* Contact - hide for admin */}
            {session?.user.role !== 'admin' && (
              <Link href="/contact" className="text-sm text-gray-600 hover:text-black transition-colors">Contact</Link>
            )}
            
            {session ? (
              <div className="relative ml-4 pl-4 border-l border-gray-200">
                <div className="flex items-center space-x-4">
                  <Link 
                    href={getDashboardLink()}
                    className="text-sm text-black font-medium hover:text-gray-600 transition-colors"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={() => signOut()}
                    className="text-sm text-gray-500 hover:text-black transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-4 ml-4 pl-4 border-l border-gray-200">
                <Link href="/login" className="text-sm text-black font-medium hover:text-gray-600 transition-colors">Login</Link>
                <Link href="/register" className="px-5 py-2 bg-black text-white text-sm rounded-full hover:bg-gray-800 transition-all">Register</Link>
              </div>
            )}
          </div>

          <div className="flex items-center md:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-black hover:bg-gray-100 focus:outline-none"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="md:hidden bg-white border-b border-gray-100 overflow-hidden"
          >
            <div className="px-4 pt-2 pb-6 space-y-2">
              <Link href="/" className="block text-lg text-black py-2">Home</Link>
              <Link href="/about" className="block text-lg text-black py-2">About</Link>
              <Link href="/camps" className="block text-lg text-black py-2">Camps</Link>
              <Link href="/leaderboard" className="block text-lg text-black py-2">Leaderboard</Link>
              <Link href="/education" className="block text-lg text-black py-2">Learn</Link>
              
              {/* Donor specific links */}
              {session?.user.role === 'donor' && (
                <>
                  <Link href="/donate" className="block text-lg text-black py-2">Donate Blood</Link>
                  <Link href="/eligibility" className="block text-lg text-black py-2">Check Eligibility</Link>
                </>
              )}

              {/* Recipient specific links */}
              {session?.user.role === 'recipient' && (
                <Link href="/request" className="block text-lg text-black py-2">Request Blood</Link>
              )}

              {/* Hospital specific links */}
              {session?.user.role === 'hospital' && (
                <Link href="/request" className="block text-lg text-black py-2">Request Blood</Link>
              )}

              {/* Public links */}
              {!session && (
                <>
                  <Link href="/donate" className="block text-lg text-black py-2">Donate Blood</Link>
                  <Link href="/join" className="block text-lg text-black py-2">Join</Link>
                </>
              )}

              {/* Support Us - hide for admin */}
              {session?.user.role !== 'admin' && (
                <Link href="/donate-money" className="block text-lg text-red-600 font-medium py-2">Support Us</Link>
              )}

              {/* Contact - hide for admin */}
              {session?.user.role !== 'admin' && (
                <Link href="/contact" className="block text-lg text-black py-2">Contact</Link>
              )}
              
              {session ? (
                <>
                  <Link 
                    href={getDashboardLink()}
                    className="block text-lg text-black py-2 font-medium"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={() => signOut()}
                    className="w-full text-left block text-lg text-gray-500 py-2"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <div className="pt-4 mt-4 border-t border-gray-100 flex flex-col space-y-3">
                  <Link href="/login" className="block text-lg text-black">Login</Link>
                  <Link href="/register" className="block text-lg text-black font-medium">Register</Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
