"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function RequestPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    patientName: "",
    bloodGroup: "",
    units: 1,
    hospital: "",
    contactPerson: "",
    contactNumber: "",
    urgency: "normal",
    dateNeeded: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) {
      alert("Please login to submit a request");
      router.push("/login");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientName: formData.patientName,
          bloodGroup: formData.bloodGroup,
          units: formData.units,
          hospitalName: formData.hospital,
          contactNumber: formData.contactNumber,
          urgency: formData.urgency,
          // Add other fields if needed by the model or future features
        }),
      });

      if (res.ok) {
        alert("Blood request submitted successfully! We will contact you shortly.");
        router.push("/dashboard");
      } else {
        const data = await res.json();
        alert(data.message || "Failed to submit request");
      }
    } catch (error) {
      console.error("Error submitting request:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900">Request Blood</h1>
          <p className="mt-4 text-gray-600">Submit a request for blood units. In case of emergency, please call our helpline directly.</p>
          <div className="mt-4">
             <a href="tel:1234567890" className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-red-600 hover:bg-red-700">
               Emergency Helpline: 123-456-7890
             </a>
          </div>
        </div>

        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-3">
                  <label htmlFor="patientName" className="block text-sm font-medium text-gray-700">
                    Patient Name
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="patientName"
                      id="patientName"
                      required
                      className="shadow-sm focus:ring-red-500 focus:border-red-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="bloodGroup" className="block text-sm font-medium text-gray-700">
                    Blood Group Required
                  </label>
                  <div className="mt-1">
                    <select
                      id="bloodGroup"
                      name="bloodGroup"
                      required
                      className="shadow-sm focus:ring-red-500 focus:border-red-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                      onChange={handleChange}
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
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="units" className="block text-sm font-medium text-gray-700">
                    Units Required
                  </label>
                  <div className="mt-1">
                    <input
                      type="number"
                      name="units"
                      id="units"
                      min="1"
                      required
                      className="shadow-sm focus:ring-red-500 focus:border-red-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                      onChange={handleChange}
                      value={formData.units}
                    />
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="urgency" className="block text-sm font-medium text-gray-700">
                    Urgency
                  </label>
                  <div className="mt-1">
                    <select
                      id="urgency"
                      name="urgency"
                      required
                      className="shadow-sm focus:ring-red-500 focus:border-red-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                      onChange={handleChange}
                    >
                      <option value="normal">Normal</option>
                      <option value="urgent">Urgent</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                </div>

                <div className="sm:col-span-6">
                  <label htmlFor="hospital" className="block text-sm font-medium text-gray-700">
                    Hospital Name & Address
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="hospital"
                      id="hospital"
                      required
                      className="shadow-sm focus:ring-red-500 focus:border-red-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="contactPerson" className="block text-sm font-medium text-gray-700">
                    Contact Person Name
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="contactPerson"
                      id="contactPerson"
                      required
                      className="shadow-sm focus:ring-red-500 focus:border-red-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="contactNumber" className="block text-sm font-medium text-gray-700">
                    Contact Number
                  </label>
                  <div className="mt-1">
                    <input
                      type="tel"
                      name="contactNumber"
                      id="contactNumber"
                      required
                      className="shadow-sm focus:ring-red-500 focus:border-red-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                >
                  {isSubmitting ? "Submitting..." : "Submit Request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
