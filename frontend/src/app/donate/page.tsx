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
  const [step, setStep] = useState(1);
  const [bloodBanks, setBloodBanks] = useState<BloodBank[]>([]);
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
              await fetch("/api/seed");
              const res2 = await fetch("/api/bloodbanks");
              if (res2.ok) {
                data = await res2.json();
              }
            } catch (seedError) {
              console.error("Auto-seed failed", seedError);
            }
          }
          
          setBloodBanks(data);
        }
      } catch (error) {
        console.error("Failed to fetch blood banks", error);
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

        <div className="bg-white border border-gray-200 mb-8 shadow-sm rounded-lg overflow-hidden">
          <div className="px-6 py-6 border-b border-gray-200 bg-gray-50">
            <h3 className="text-lg leading-6 font-semibold text-gray-900 uppercase tracking-wider">Eligibility Checklist</h3>
            <p className="mt-2 max-w-2xl text-sm text-gray-500 font-light">Please ensure you meet these criteria before donating.</p>
          </div>
          <div className="px-6 py-6">
            <dl className="divide-y divide-gray-200">
              <div className="py-4 grid grid-cols-3 gap-4">
                <dt className="text-sm font-medium text-gray-500 uppercase tracking-wider">Age</dt>
                <dd className="text-sm text-gray-900 col-span-2 font-light">18 - 65 years old</dd>
              </div>
              <div className="py-4 grid grid-cols-3 gap-4">
                <dt className="text-sm font-medium text-gray-500 uppercase tracking-wider">Weight</dt>
                <dd className="text-sm text-gray-900 col-span-2 font-light">At least 50 kg (110 lbs)</dd>
              </div>
              <div className="py-4 grid grid-cols-3 gap-4">
                <dt className="text-sm font-medium text-gray-500 uppercase tracking-wider">Health</dt>
                <dd className="text-sm text-gray-900 col-span-2 font-light">Good general health, no cold or flu</dd>
              </div>
              <div className="py-4 grid grid-cols-3 gap-4">
                <dt className="text-sm font-medium text-gray-500 uppercase tracking-wider">Last Donation</dt>
                <dd className="text-sm text-gray-900 col-span-2 font-light">At least 3 months ago (for men) or 4 months (for women)</dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="bg-white border border-gray-200 shadow-sm rounded-lg overflow-hidden">
          <div className="px-6 py-6">
            <h3 className="text-lg leading-6 font-semibold text-gray-900 mb-6 uppercase tracking-wider">Book Appointment</h3>
            <form onSubmit={handleSubmit} className="space-y-6">
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
                      {bloodBanks.map((bank) => (
                        <option key={bank._id} value={bank._id}>
                          {bank.name} - {bank.address?.city}, {bank.address?.state}
                        </option>
                      ))}
                    </select>
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

              <div className="flex justify-end pt-4">
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
        </div>
      </div>
    </div>
  );
}
