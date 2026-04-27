"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface BloodBank {
  _id: string;
  name: string;
  address: {
    city: string;
    state: string;
  };
}

export default function DonatePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [bloodBanks, setBloodBanks] = useState<BloodBank[]>([]);
  const [banksLoading, setBanksLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    date: "",
    time: "",
    bloodBank: "",
    weight: "",
    lastDonation: "",
    conditions: "",
  });

  useEffect(() => {
    const fetchBloodBanks = async () => {
      try {
        const res = await fetch("/api/bloodbanks");
        if (res.ok) {
          let data = await res.json();
          
          // Auto-seed if empty (for demo purposes)
          if (Array.isArray(data) && data.length === 0) {
            console.log("No blood banks found, attempting to seed...");
            try {
              const seedRes = await fetch("/api/seed");
              if (seedRes.ok) {
                 // Fetch again after seeding
                 const res2 = await fetch("/api/bloodbanks");
                 if (res2.ok) {
                   data = await res2.json();
                 }
              }
            } catch (seedError) {
              console.error("Auto-seed failed", seedError);
            }
          }
          
          setBloodBanks(data);
        } else {
            console.error("Failed to fetch blood banks: Status", res.status);
            setFetchError(`Failed to load blood banks (Status: ${res.status})`);
        }
      } catch (error) {
        console.error("Failed to fetch blood banks", error);
        setFetchError("Unable to load blood banks. Connection failed.");
      } finally {
        setBanksLoading(false);
      }
    };
    fetchBloodBanks();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) {
      router.push("/login?callbackUrl=/donate");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: formData.date,
          time: formData.time,
          bloodBank: formData.bloodBank,
          notes: `Weight: ${formData.weight}, Last Donation: ${formData.lastDonation}, Conditions: ${formData.conditions}`,
        }),
      });

      if (res.ok) {
        alert("Appointment booked successfully!");
        router.push("/dashboard/donor");
      } else {
        const error = await res.json();
        alert(error.message || "Failed to book appointment");
      }
    } catch (error) {
      console.error("Error booking appointment:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-6xl md:text-8xl font-bold mb-8 tracking-tight text-gray-900">DONATE<br/>BLOOD.</h1>
          <p className="mt-4 text-xl text-gray-600 font-light">Check your eligibility and book an appointment.</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-12">
          <button
            onClick={() => setStep(1)}
            className="px-8 py-4 bg-white border-2 border-gray-900 text-gray-900 font-bold uppercase tracking-wider hover:bg-gray-50 transition-colors w-full sm:w-auto rounded-md shadow-sm"
          >
            Check Eligibility
          </button>
          <button
            onClick={() => setStep(2)}
            className="px-8 py-4 bg-red-600 text-white font-bold uppercase tracking-wider hover:bg-red-700 transition-colors w-full sm:w-auto rounded-md shadow-sm"
          >
            Book Appointment
          </button>
        </div>

        {/* Modal Overlay */}
        {(step === 1 || step === 2) && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
              <div 
                className="fixed inset-0 transition-opacity bg-gray-900 bg-opacity-75" 
                onClick={() => setStep(0)}
              ></div>

              <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

              <div className="relative z-10 inline-block w-full max-w-2xl px-4 pt-5 pb-4 overflow-hidden text-left align-bottom transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:align-middle sm:p-6">
                <button
                  onClick={() => setStep(0)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-500 focus:outline-none"
                >
                  <span className="sr-only">Close</span>
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                {step === 1 && (
                  <div className="bg-white">
                    <div className="px-6 py-6 border-b border-gray-200">
                      <h3 className="text-xl leading-6 font-bold text-gray-900 uppercase tracking-wider">Eligibility Checklist</h3>
                      <p className="mt-2 text-sm text-gray-500 font-light">Please ensure you meet these criteria before donating.</p>
                    </div>
                    <div className="px-6 py-6">
                      <dl className="divide-y divide-gray-200">
                        <div className="py-4 grid grid-cols-3 gap-4">
                          <dt className="text-sm font-medium text-gray-500 uppercase tracking-wider">Age</dt>
                          <dd className="text-sm text-gray-900 col-span-2 font-medium">18 - 65 years old</dd>
                        </div>
                        <div className="py-4 grid grid-cols-3 gap-4">
                          <dt className="text-sm font-medium text-gray-500 uppercase tracking-wider">Weight</dt>
                          <dd className="text-sm text-gray-900 col-span-2 font-medium">At least 50 kg (110 lbs)</dd>
                        </div>
                        <div className="py-4 grid grid-cols-3 gap-4">
                          <dt className="text-sm font-medium text-gray-500 uppercase tracking-wider">Health</dt>
                          <dd className="text-sm text-gray-900 col-span-2 font-medium">Good general health, no cold or flu</dd>
                        </div>
                        <div className="py-4 grid grid-cols-3 gap-4">
                          <dt className="text-sm font-medium text-gray-500 uppercase tracking-wider">Last Donation</dt>
                          <dd className="text-sm text-gray-900 col-span-2 font-medium">At least 3 months ago (for men) or 4 months (for women)</dd>
                        </div>
                      </dl>
                      <div className="mt-8 flex justify-end">
                        <button
                          onClick={() => setStep(2)}
                          className="px-6 py-3 bg-red-600 text-white font-medium uppercase tracking-wider hover:bg-red-700 transition-colors rounded-md"
                        >
                          I am Eligible - Book Now
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="bg-white">
                    <div className="px-6 py-6 border-b border-gray-200 mb-6">
                      <h3 className="text-xl leading-6 font-bold text-gray-900 uppercase tracking-wider">Book Appointment</h3>
                      <p className="mt-2 text-sm text-gray-500 font-light">Schedule your life-saving blood donation.</p>
                    </div>
                    <form onSubmit={handleSubmit} className="px-6 space-y-6">
                      <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                        <div className="sm:col-span-3">
                          <label htmlFor="date" className="block text-sm font-medium text-gray-700 uppercase tracking-wider mb-2">
                            Preferred Date
                          </label>
                          <div className="mt-1">
                            <input
                              type="date"
                              name="date"
                              id="date"
                              required
                              className="block w-full bg-white border border-gray-300 text-gray-900 py-3 px-4 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors sm:text-sm rounded-md"
                              onChange={handleChange}
                            />
                          </div>
                        </div>

                        <div className="sm:col-span-3">
                          <label htmlFor="time" className="block text-sm font-medium text-gray-700 uppercase tracking-wider mb-2">
                            Preferred Time
                          </label>
                          <div className="mt-1">
                            <select
                              id="time"
                              name="time"
                              required
                              className="block w-full bg-white border border-gray-300 text-gray-900 py-3 px-4 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors sm:text-sm rounded-md"
                              onChange={handleChange}
                            >
                              <option value="">Select Time</option>
                              <option>Morning (9AM - 12PM)</option>
                              <option>Afternoon (12PM - 4PM)</option>
                              <option>Evening (4PM - 8PM)</option>
                            </select>
                          </div>
                        </div>

                        <div className="sm:col-span-6">
                          <label htmlFor="bloodBank" className="block text-sm font-medium text-gray-700 uppercase tracking-wider mb-2">
                            Select Blood Bank
                          </label>
                          <div className="mt-1">
                            <select
                              id="bloodBank"
                              name="bloodBank"
                              required
                              className="block w-full bg-white border border-gray-300 text-gray-900 py-3 px-4 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors sm:text-sm rounded-md"
                              onChange={handleChange}
                              value={formData.bloodBank}
                            >
                              <option value="">Select a location</option>
                      {fetchError ? (
                        <option disabled>Error loading locations</option>
                      ) : banksLoading ? (
                        <option disabled>Loading locations...</option>
                      ) : bloodBanks.length === 0 ? (
                        <option disabled>No donation centers available</option>
                      ) : (
                        bloodBanks.map((bank) => (
                          <option key={bank._id} value={bank._id}>
                            {bank.name} {bank.address?.city ? `- ${bank.address.city}` : ''}
                          </option>
                        ))
                      )}
                    </select>
                    {banksLoading && <p className="mt-1 text-xs text-blue-500">Fetching nearby centers...</p>}
                    {fetchError && (
                        <p className="mt-1 text-xs text-red-600 font-medium">
                            {fetchError}. <button type="button" onClick={() => window.location.reload()} className="underline ml-1">Reload Page</button>
                        </p>
                    )}
                    {!banksLoading && bloodBanks.length === 0 && (
                      <p className="mt-1 text-xs text-red-500">
                        No blood banks found. Please try refreshing or contact support. 
                        <button type="button" onClick={() => window.location.reload()} className="ml-1 underline">Refresh</button>
                      </p>
                    )}
                  </div>
                </div>

                <div className="sm:col-span-6">
                  <label htmlFor="conditions" className="block text-sm font-medium text-gray-700 uppercase tracking-wider mb-2">
                    Any Medical Conditions?
                  </label>
                  <div className="mt-1">
                    <textarea
                      id="conditions"
                      name="conditions"
                      rows={3}
                      className="block w-full bg-white border border-gray-300 text-gray-900 py-3 px-4 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors sm:text-sm placeholder-gray-400 rounded-md"
                      placeholder="Please list any recent illnesses, medications, or surgeries."
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-6 border-t border-gray-200 mt-6">
                <button
                  type="button"
                  onClick={() => setStep(0)}
                  className="w-full sm:w-auto px-6 py-3 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto inline-flex justify-center py-3 px-8 border border-transparent shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none transition-colors uppercase tracking-wider rounded-md disabled:opacity-50"
                >
                  {loading ? "Booking..." : "Book Appointment"}
                </button>
              </div>
            </form>
          </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
