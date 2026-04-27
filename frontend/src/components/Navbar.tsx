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

  const role = session?.user?.role;

  // Define nav links based on role
  const getNavLinks = (): { name: string; href: string; isSpecial?: boolean }[] => {
    const baseLinks = [
      { name: 'Home', href: '/' },
      { name: 'About', href: '/about' },
      { name: 'Camps', href: '/camps' },
      { name: 'Leaderboard', href: '/leaderboard' },
      { name: 'Learn', href: '/education' },
    ];

    if (!session) {
      return [
        ...baseLinks,
        { name: 'Donate Blood', href: '/donate' },
        { name: 'Join', href: '/join' },
        { name: 'Support Us', href: '/donate-money', isSpecial: true },
        { name: 'Contact', href: '/contact' },
      ];
    }

    if (role === 'admin') {
      return [
        { name: 'Home', href: '/' },
        // Admins mostly need dashboard, but we can give them some basic links
      ];
    }

    if (role === 'hospital' || role === 'recipient') {
      return [
        ...baseLinks,
        { name: 'Request Blood', href: '/request' },
        { name: 'Support Us', href: '/donate-money', isSpecial: true },
        { name: 'Contact', href: '/contact' },
      ];
    }

    if (role === 'donor') {
      return [
        ...baseLinks,
        { name: 'Donate Blood', href: '/donate' },
        { name: 'Check Eligibility', href: '/eligibility' },
        { name: 'Support Us', href: '/donate-money', isSpecial: true },
        { name: 'Contact', href: '/contact' },
      ];
    }

    return baseLinks;
  };

  const navLinks = getNavLinks();

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
            {navLinks.map((link) => (
              <Link 
                key={link.name}
                href={link.href} 
                className={`text-sm transition-colors ${link.isSpecial ? 'font-medium text-red-600 hover:text-red-700' : 'text-gray-600 hover:text-black'}`}
              >
                {link.name}
              </Link>
            ))}
            
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
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`block text-lg py-2 ${link.isSpecial ? 'font-medium text-red-600' : 'text-black'}`}
                >
                  {link.name}
                </Link>
              ))}

              {session ? (
                <>
                  <Link 
                    href={getDashboardLink()}
                    onClick={() => setIsOpen(false)}
                    className="block text-lg text-black py-2 font-medium"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      signOut();
                    }}
                    className="w-full text-left block text-lg text-gray-500 py-2"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <div className="pt-4 mt-4 border-t border-gray-100 flex flex-col space-y-3">
                  <Link href="/login" onClick={() => setIsOpen(false)} className="block text-lg text-black">Login</Link>
                  <Link href="/register" onClick={() => setIsOpen(false)} className="block text-lg text-black font-medium">Register</Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
