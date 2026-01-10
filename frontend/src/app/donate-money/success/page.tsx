"use client";

import Link from "next/link";
import { CheckCircle, Home } from "lucide-react";
import { useEffect } from "react";
import confetti from "canvas-confetti";

export default function DonationSuccessPage() {
  useEffect(() => {
    confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
    });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-100 mb-6">
          <CheckCircle className="h-10 w-10 text-green-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Thank You!</h2>
        <p className="text-gray-600 mb-8">
          Your donation has been successfully processed. Your generosity helps us save lives.
        </p>
        
        <div className="space-y-4">
            <Link
            href="/"
            className="w-full flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-md text-white bg-black hover:bg-gray-800 md:text-lg transition-all"
            >
            <Home className="mr-2 h-5 w-5" />
            Return Home
            </Link>
            <Link
            href="/donate-money"
            className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 md:text-lg transition-all"
            >
            Donate Again
            </Link>
        </div>
      </div>
    </div>
  );
}
