"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<'register' | 'otp'>('register');
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "donor",
    bloodGroup: "",
    phone: "",
    address: "",
  });
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        setStep('otp');
      } else {
        setError(data.message || "Registration failed");
      }
    } catch (error) {
      setError("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/register/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, otp }),
      });

      const data = await res.json();

      if (res.ok) {
        const result = await signIn("credentials", {
          redirect: false,
          email: formData.email,
          password: formData.password,
        });

        if (result?.error) {
          router.push("/login?verified=true");
        } else {
          if (formData.role === 'admin') router.push("/dashboard/admin");
          else if (formData.role === 'hospital') router.push("/dashboard/hospital");
          else router.push("/dashboard");
        }
      } else {
        setError(data.message || "Verification failed");
      }
    } catch (error) {
      setError("An error occurred during verification");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg"
      >
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {step === 'register' ? 'Create your account' : 'Verify your email'}
          </h2>
          {step === 'otp' && (
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-2 text-center text-sm text-gray-600"
            >
              We sent a code to {formData.email}
            </motion.p>
          )}
        </div>

        <AnimatePresence mode="wait">
          {step === 'register' ? (
            <motion.form 
              key="register-form"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="mt-8 space-y-6" 
              onSubmit={handleRegister}
            >
              <div className="rounded-md shadow-sm -space-y-px">
                <div>
                  <input
                    name="name"
                    type="text"
                    required
                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-red-500 focus:border-red-500 focus:z-10 sm:text-sm transition-colors duration-200"
                    placeholder="Full Name"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <input
                    name="email"
                    type="email"
                    required
                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-red-500 focus:border-red-500 focus:z-10 sm:text-sm transition-colors duration-200"
                    placeholder="Email address"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <input
                    name="phone"
                    type="tel"
                    required
                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-red-500 focus:border-red-500 focus:z-10 sm:text-sm transition-colors duration-200"
                    placeholder="Phone Number"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <input
                    name="address"
                    type="text"
                    required
                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-red-500 focus:border-red-500 focus:z-10 sm:text-sm transition-colors duration-200"
                    placeholder="Address"
                    value={formData.address}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <input
                    name="password"
                    type="password"
                    required
                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-red-500 focus:border-red-500 focus:z-10 sm:text-sm transition-colors duration-200"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <select
                    name="role"
                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-red-500 focus:border-red-500 focus:z-10 sm:text-sm transition-colors duration-200"
                    onChange={handleChange}
                    value={formData.role}
                  >
                    <option value="donor">Donor</option>
                    <option value="recipient">Recipient</option>
                    <option value="hospital">Hospital</option>
                  </select>
                </div>
                {formData.role === 'donor' && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                  >
                    <select
                      name="bloodGroup"
                      className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-red-500 focus:border-red-500 focus:z-10 sm:text-sm transition-colors duration-200"
                      onChange={handleChange}
                      value={formData.bloodGroup}
                      required
                    >
                      <option value="">Select Blood Group</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                    </select>
                  </motion.div>
                )}
              </div>

              {error && (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-red-500 text-sm text-center bg-red-50 p-2 rounded"
                >
                  {error}
                </motion.div>
              )}

              <div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 transition-colors duration-200"
                >
                  {loading ? "Sending OTP..." : "Register"}
                </motion.button>
              </div>

              <div className="text-sm text-center">
                <Link href="/login" className="font-medium text-red-600 hover:text-red-500 transition-colors duration-200">
                  Already have an account? Sign in
                </Link>
              </div>
            </motion.form>
          ) : (
            <motion.form 
              key="otp-form"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="mt-8 space-y-6" 
              onSubmit={handleVerify}
            >
              <div className="rounded-md shadow-sm -space-y-px">
                <div>
                  <input
                    name="otp"
                    type="text"
                    required
                    className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-red-500 focus:border-red-500 focus:z-10 sm:text-sm text-center tracking-widest text-2xl transition-colors duration-200"
                    placeholder="Enter OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    maxLength={6}
                  />
                </div>
              </div>

              {error && (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-red-500 text-sm text-center bg-red-50 p-2 rounded"
                >
                  {error}
                </motion.div>
              )}

              <div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 transition-colors duration-200"
                >
                  {loading ? "Verifying..." : "Verify Email"}
                </motion.button>
              </div>

              <div className="text-sm text-center">
                <button
                  type="button"
                  onClick={() => setStep('register')}
                  className="font-medium text-gray-600 hover:text-gray-500 transition-colors duration-200"
                >
                  Back to Registration
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
