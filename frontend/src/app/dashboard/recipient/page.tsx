"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

interface Request {
  _id: string;
  patientName: string;
  bloodGroup: string;
  units: number;
  hospitalName: string;
  status: string;
  urgency: string;
  createdAt: string;
}

export default function RecipientDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isFulfillModalOpen, setIsFulfillModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [donorName, setDonorName] = useState("");
  const [donorEmail, setDonorEmail] = useState("");
  const [fulfilling, setFulfilling] = useState(false);
  const [fulfillError, setFulfillError] = useState("");

  const handleOpenFulfillModal = (request: Request) => {
    setSelectedRequest(request);
    setIsFulfillModalOpen(true);
    setDonorName("");
    setDonorEmail("");
    setFulfillError("");
  };

  const handleFulfillRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest) return;
    setFulfilling(true);
    setFulfillError("");

    try {
      const res = await fetch(`/api/requests/${selectedRequest._id}/fulfill`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ donorName, donorEmail }),
      });

      if (res.ok) {
        setIsFulfillModalOpen(false);
        fetchRequests(); // refresh the list
      } else {
        const errorData = await res.json();
        setFulfillError(errorData.error || "Failed to mark fulfilled");
      }
    } catch (error) {
      console.error("Error fulfilling request:", error);
      setFulfillError("Something went wrong");
    } finally {
      setFulfilling(false);
    }
  };

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/login");
      return;
    }
    if (session.user.role !== "recipient") {
      router.push("/dashboard");
      return;
    }

    fetchRequests();
  }, [session, status, router]);

  const fetchRequests = async () => {
    try {
      const res = await fetch(`/api/requests?userId=${session?.user.id}`);
      if (res.ok) {
        const data = await res.json();
        setRequests(data);
      }
    } catch (error) {
      console.error("Error fetching requests:", error);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="md:flex md:items-center md:justify-between mb-8"
        >
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              Recipient Dashboard
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Manage your blood requests and track their status.
            </p>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4">
            <Link href="/request">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                New Request
              </motion.button>
            </Link>
          </div>
        </motion.div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-8">
          {[
            { label: "Total Requests", value: requests.length, color: "text-gray-900" },
            { label: "Pending", value: requests.filter((r) => r.status === "pending").length, color: "text-yellow-600" },
            { label: "Fulfilled", value: requests.filter((r) => r.status === "fulfilled").length, color: "text-green-600" }
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white overflow-hidden shadow rounded-lg"
            >
              <div className="px-4 py-5 sm:p-6">
                <dt className="text-sm font-medium text-gray-500 truncate">{stat.label}</dt>
                <dd className={`mt-1 text-3xl font-semibold ${stat.color}`}>{stat.value}</dd>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Requests List */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white shadow overflow-hidden sm:rounded-md"
        >
          <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Your Requests</h3>
          </div>
          <ul role="list" className="divide-y divide-gray-200">
            {requests.length === 0 ? (
              <li className="px-4 py-4 sm:px-6 text-center text-gray-500">
                No requests found. Create a new request to get started.
              </li>
            ) : (
              requests.map((request, index) => (
                <motion.li 
                  key={request._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 + 0.4 }}
                >
                  <div className="px-4 py-4 sm:px-6 hover:bg-gray-50 transition-colors duration-150">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <p className="text-sm font-medium text-red-600 truncate">
                          {request.patientName} ({request.bloodGroup})
                        </p>
                        <p className="text-sm text-gray-500">
                          {request.hospitalName} • {request.units} Units
                        </p>
                      </div>
                      <div className="flex flex-col items-end">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            request.status === "fulfilled"
                              ? "bg-green-100 text-green-800"
                              : request.status === "rejected"
                              ? "bg-red-100 text-red-800"
                              : request.status === "approved"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        </span>
                        
                        {(request.status === "approved" || request.status === "pending") && (
                          <button
                            onClick={() => handleOpenFulfillModal(request)}
                            className="mt-2 text-xs font-medium text-white bg-green-600 hover:bg-green-700 px-3 py-1 rounded transition-colors"
                          >
                            Mark Fulfilled & Certify Donor
                          </button>
                        )}
                        
                        <p className="mt-1 text-xs text-gray-500">
                          {new Date(request.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.li>
              ))
            )}
          </ul>
        </motion.div>
      </div>

      {/* Fulfill Request Modal */}
      {isFulfillModalOpen && selectedRequest && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
            <div className="fixed inset-0 bg-gray-900 bg-opacity-50 transition-opacity" onClick={() => setIsFulfillModalOpen(false)}></div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative z-10 inline-block px-4 pt-5 pb-4 overflow-hidden text-left align-bottom transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6"
            >
              <div>
                <div className="flex items-center justify-center w-12 h-12 mx-auto bg-green-100 rounded-full">
                  <span className="text-2xl text-green-600">🏆</span>
                </div>
                <div className="mt-3 text-center sm:mt-5">
                  <h3 className="text-lg font-medium leading-6 text-gray-900 leading-tight">
                    Fulfill Request & Reward Donor
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Did someone donate blood for <span className="font-bold">{selectedRequest.patientName}</span>?  
                      Enter the heroic donor's details below to mark the request as fulfilled and instantly email them a Certificate of Appreciation.
                    </p>
                  </div>
                </div>
              </div>

              {fulfillError && (
                <div className="mt-4 p-3 text-sm text-red-600 bg-red-50 rounded bg-opacity-50">
                  {fulfillError}
                </div>
              )}

              <form className="mt-5 sm:mt-6" onSubmit={handleFulfillRequest}>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="donorName" className="block text-sm font-medium text-gray-700 text-left">
                      Donor's Full Name
                    </label>
                    <input
                      type="text"
                      id="donorName"
                      required
                      value={donorName}
                      onChange={(e) => setDonorName(e.target.value)}
                      className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm"
                      placeholder="e.g., Jane Doe"
                    />
                  </div>
                  <div>
                    <label htmlFor="donorEmail" className="block text-sm font-medium text-gray-700 text-left">
                      Donor's Email Address
                    </label>
                    <input
                      type="email"
                      id="donorEmail"
                      required
                      value={donorEmail}
                      onChange={(e) => setDonorEmail(e.target.value)}
                      className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm"
                      placeholder="e.g., hero@example.com"
                    />
                  </div>
                </div>
                
                <div className="mt-8 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsFulfillModalOpen(false)}
                    disabled={fulfilling}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={fulfilling || !donorName.trim() || !donorEmail.trim()}
                    className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md shadow-sm hover:bg-green-700 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {fulfilling ? "Processing & Sending..." : "Send Certificate & Fulfill"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </div>
      )}
    </div>
  );
}
