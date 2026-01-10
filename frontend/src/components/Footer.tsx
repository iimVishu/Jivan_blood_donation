import Link from "next/link";
import { Droplet, Facebook, Twitter, Instagram, Linkedin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-white text-gray-900 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center mb-6">
              <Droplet className="h-6 w-6 text-red-600" />
              <span className="ml-3 text-lg font-bold tracking-tight">जीवन</span>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed">
              Connecting blood donors with recipients. <br/>Simple. Efficient. Vital.
            </p>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold mb-6 uppercase tracking-wider text-gray-900">Menu</h3>
            <ul className="space-y-4">
              <li><Link href="/about" className="text-gray-600 hover:text-red-600 text-sm transition-colors">About</Link></li>
              <li><Link href="/camps" className="text-gray-600 hover:text-red-600 text-sm transition-colors">Camps</Link></li>
              <li><Link href="/join" className="text-gray-600 hover:text-red-600 text-sm transition-colors">Join</Link></li>
              <li><Link href="/donate" className="text-gray-600 hover:text-red-600 text-sm transition-colors">Donate</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold mb-6 uppercase tracking-wider text-gray-900">Legal</h3>
            <ul className="space-y-4">
              <li><Link href="/faq" className="text-gray-600 hover:text-red-600 text-sm transition-colors">FAQ</Link></li>
              <li><Link href="/privacy" className="text-gray-600 hover:text-red-600 text-sm transition-colors">Privacy</Link></li>
              <li><Link href="/terms" className="text-gray-600 hover:text-red-600 text-sm transition-colors">Terms</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold mb-6 uppercase tracking-wider text-gray-900">Connect</h3>
            <ul className="space-y-4 text-gray-600 text-sm">
              <li>hello@jeevan.in</li>
              <li>+91 98765 43210</li>
            </ul>
            <div className="flex space-x-6 mt-8">
              <a href="#" className="text-gray-400 hover:text-red-600 transition-colors"><Facebook className="h-5 w-5" /></a>
              <a href="#" className="text-gray-400 hover:text-red-600 transition-colors"><Twitter className="h-5 w-5" /></a>
              <a href="#" className="text-gray-400 hover:text-red-600 transition-colors"><Instagram className="h-5 w-5" /></a>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-200 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center text-gray-500 text-xs uppercase tracking-wider">
          <p>&copy; {new Date().getFullYear()} जीवन.</p>
          <p className="mt-4 md:mt-0">Designed for Humanity</p>
        </div>
      </div>
    </footer>
  );
}
