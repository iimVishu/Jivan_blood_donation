"use client";

import React, { useState } from "react";
import Script from "next/script";
import { Heart } from "lucide-react";
import { useRouter } from "next/navigation";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function DonateMoneyPage() {
  const [amount, setAmount] = useState<number>(500); // Default 500 INR
  const [isCustomAmount, setIsCustomAmount] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handlePayment = async () => {
    if (amount < 50) {
      alert("Minimum donation amount is ₹50");
      return;
    }

    if (!email || !email.includes("@")) {
      alert("Please enter a valid email address");
      return;
    }

    setLoading(true);

    try {
      // 1. Create Order
      const res = await fetch("/api/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create order");
      }

      // Handle Mock Mode
      if (data.isMock) {
        console.log("Processing Mock Payment...");
        
        // Send Thank You Email
        await fetch("/api/donate-money/success", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            amount,
            paymentId: data.orderId
          }),
        });

        setTimeout(() => {
          router.push("/donate-money/success");
        }, 1500); // Simulate 1.5s delay
        return;
      }

      // 2. Initialize Razorpay
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: data.amount,
        currency: data.currency,
        name: "Jeevan Blood Donation",
        description: "Donation for a cause",
        order_id: data.orderId,
        handler: async function (response: any) {
          // Handle success
          console.log("Payment Successful", response);
          
          // Send Thank You Email
          await fetch("/api/donate-money/success", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email,
              amount,
              paymentId: response.razorpay_payment_id
            }),
          });

          router.push("/donate-money/success");
        },
        prefill: {
          email: email,
        },
        theme: {
          color: "#DC2626", // Red-600
        },
      };

      const rzp1 = new window.Razorpay(options);
      rzp1.open();
    } catch (error: any) {
      console.error("Payment Error:", error);
      alert(error.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-3 bg-red-100 rounded-full mb-4">
            <Heart className="h-8 w-8 text-red-600" fill="currentColor" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Support Our Cause</h1>
          <p className="text-xl text-gray-600">
            Your financial contribution helps us organize more camps and save more lives.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-8">
            <div className="space-y-8">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Select Amount
                </label>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  {[100, 500, 1000, 2000, 5000].map((val) => (
                    <button
                      key={val}
                      onClick={() => {
                        setAmount(val);
                        setIsCustomAmount(false);
                      }}
                      className={`py-3 px-4 rounded-lg border-2 font-medium transition-all ${
                        amount === val && !isCustomAmount
                          ? "border-red-600 bg-red-50 text-red-700"
                          : "border-gray-200 hover:border-gray-300 text-gray-600"
                      }`}
                    >
                      ₹{val}
                    </button>
                  ))}
                  <button
                    onClick={() => setIsCustomAmount(true)}
                    className={`py-3 px-4 rounded-lg border-2 font-medium transition-all ${
                      isCustomAmount
                        ? "border-red-600 bg-red-50 text-red-700"
                        : "border-gray-200 hover:border-gray-300 text-gray-600"
                    }`}
                  >
                    Custom
                  </button>
                </div>

                  {isCustomAmount && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Enter Amount (₹)
                    </label>
                    <input
                      type="number"
                      min="50"
                      value={amount}
                      onChange={(e) => setAmount(Number(e.target.value))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
                    />
                  </div>
                )}

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email for receipt"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
                    suppressHydrationWarning
                  />
                </div>
              </div>

              <button
                onClick={handlePayment}
                disabled={loading}
                className="w-full bg-black text-white py-4 rounded-xl font-bold text-lg hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Processing..." : `Proceed to Pay ₹${amount}`}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>Secure payment processing by Razorpay. All donations are tax-deductible.</p>
        </div>
      </div>
    </div>
  );
}
