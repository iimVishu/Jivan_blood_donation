"use client";

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Send, CheckCircle, Loader2 } from 'lucide-react';

type FormData = {
  name: string;
  email: string;
  phone: string;
  address: string;
  reason: string;
};

export default function JoinPage() {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    setError("");
    
    try {
      const res = await fetch("/api/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        setIsSuccess(true);
        reset();
      } else {
        setError("Something went wrong. Please try again.");
      }
    } catch (err) {
      setError("Failed to submit application.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 pt-24 px-4 sm:px-6 lg:px-8 pb-12">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
        
        {/* Left Column: Content */}
        <div>
          <h1 className="text-6xl md:text-8xl font-bold mb-8 tracking-tight text-gray-900">JOIN<br/>US.</h1>
          <p className="text-xl text-gray-600 mb-8 font-light max-w-lg">
            Become a volunteer and help us in our mission to make India blood sufficient. Your time and effort can save lives.
          </p>
          
          <div className="space-y-6 text-gray-600">
            <div className="flex items-start">
              <div className="flex-shrink-0 h-6 w-6 rounded-full bg-red-100 flex items-center justify-center mt-1">
                <span className="text-red-600 font-bold text-xs">1</span>
              </div>
              <p className="ml-4">Organize blood donation camps in your locality.</p>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 h-6 w-6 rounded-full bg-red-100 flex items-center justify-center mt-1">
                <span className="text-red-600 font-bold text-xs">2</span>
              </div>
              <p className="ml-4">Spread awareness about the importance of blood donation.</p>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 h-6 w-6 rounded-full bg-red-100 flex items-center justify-center mt-1">
                <span className="text-red-600 font-bold text-xs">3</span>
              </div>
              <p className="ml-4">Coordinate with donors and hospitals during emergencies.</p>
            </div>
          </div>
        </div>

        {/* Right Column: Form */}
        <div className="bg-gray-50 p-8 rounded-2xl border border-gray-100 shadow-sm">
          {isSuccess ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-12">
              <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Application Sent!</h3>
              <p className="text-gray-600">
                Thank you for your interest. We will review your application and get back to you soon.
              </p>
              <button 
                onClick={() => setIsSuccess(false)}
                className="mt-8 text-red-600 font-medium hover:text-red-700"
              >
                Send another application
              </button>
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Volunteer Registration</h2>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    {...register("name", { required: true })}
                    type="text"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all"
                    placeholder="John Doe"
                  />
                  {errors.name && <span className="text-red-500 text-xs mt-1">Name is required</span>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      {...register("email", { required: true, pattern: /^\S+@\S+$/i })}
                      type="email"
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all"
                      placeholder="john@example.com"
                    />
                    {errors.email && <span className="text-red-500 text-xs mt-1">Valid email is required</span>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input
                      {...register("phone", { required: true })}
                      type="tel"
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all"
                      placeholder="+91 98765 43210"
                    />
                    {errors.phone && <span className="text-red-500 text-xs mt-1">Phone is required</span>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <input
                    {...register("address", { required: true })}
                    type="text"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all"
                    placeholder="City, State"
                  />
                  {errors.address && <span className="text-red-500 text-xs mt-1">Address is required</span>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Why do you want to join?</label>
                  <textarea
                    {...register("reason", { required: true })}
                    rows={4}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all resize-none"
                    placeholder="Tell us about your motivation..."
                  ></textarea>
                  {errors.reason && <span className="text-red-500 text-xs mt-1">Please provide a reason</span>}
                </div>

                {error && <div className="text-red-500 text-sm">{error}</div>}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="animate-spin h-5 w-5 mr-2" />
                      Sending...
                    </>
                  ) : (
                    <>
                      Submit Application
                      <Send className="h-5 w-5 ml-2" />
                    </>
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
