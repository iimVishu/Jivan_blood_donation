"use client";

import React, { useState } from 'react';
import { Calendar, MapPin, Users, Building, User, Mail, Phone, MessageSquare, CheckCircle } from 'lucide-react';

export default function CampsPage() {
  const [formData, setFormData] = useState({
    organizerName: '',
    organizationName: '',
    email: '',
    phone: '',
    expectedDonors: '',
    proposedDate: '',
    venue: '',
    city: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/camps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        setIsSuccess(true);
        setFormData({
            organizerName: '',
            organizationName: '',
            email: '',
            phone: '',
            expectedDonors: '',
            proposedDate: '',
            venue: '',
            city: '',
            message: ''
        });
      } else {
        alert('Failed to submit request. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-100 mb-6">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Request Received!</h2>
          <p className="text-gray-600 mb-8">
            Thank you for your interest in organizing a blood donation camp. Our team will review your request and contact you shortly.
          </p>
          <button
            onClick={() => setIsSuccess(false)}
            className="w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors"
          >
            Submit Another Request
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Organize a Blood Donation Camp</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Partner with us to save lives. Host a camp at your office, college, or residential society.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-red-600 px-8 py-6">
            <h2 className="text-2xl font-bold text-white">Camp Request Form</h2>
            <p className="text-red-100 mt-1">Fill in the details below to get started</p>
          </div>
          
          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {/* Organizer Details */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <User className="h-5 w-5 mr-2 text-red-600" />
                Organizer Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Organizer Name</label>
                  <input
                    type="text"
                    name="organizerName"
                    required
                    value={formData.organizerName}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Organization Name</label>
                  <input
                    type="text"
                    name="organizationName"
                    required
                    value={formData.organizationName}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
                    placeholder="Company / College / Society"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
                    placeholder="john@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Building className="h-5 w-5 mr-2 text-red-600" />
                Camp Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expected Donors</label>
                  <input
                    type="number"
                    name="expectedDonors"
                    required
                    min="1"
                    value={formData.expectedDonors}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
                    placeholder="e.g. 50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Proposed Date</label>
                  <input
                    type="date"
                    name="proposedDate"
                    required
                    value={formData.proposedDate}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Venue Address</label>
                  <input
                    type="text"
                    name="venue"
                    required
                    value={formData.venue}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
                    placeholder="Full address of the camp location"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input
                    type="text"
                    name="city"
                    required
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
                    placeholder="City"
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-8">
              <label className="block text-sm font-medium text-gray-700 mb-1">Additional Message (Optional)</label>
              <textarea
                name="message"
                rows={4}
                value={formData.message}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
                placeholder="Any specific requirements or questions..."
              />
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-red-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-red-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Submitting Request...' : 'Submit Camp Request'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
