"use client";

import { Mail, Phone, MapPin } from "lucide-react";
import { useState } from "react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Message sent successfully!");
        setFormData({ name: "", email: "", subject: "", message: "" });
      } else {
        alert(data.message || "Failed to send message");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-6xl md:text-8xl font-bold mb-8 tracking-tight text-gray-900">CONTACT<br/>US.</h1>
          <p className="mt-4 text-xl text-gray-600 font-light">We'd love to hear from you. Send us a message and we'll respond as soon as possible.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Contact Info */}
          <div className="bg-white border border-gray-200 p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 tracking-tight">Get in Touch</h2>
            
            <div className="space-y-8">
              <div className="flex items-start">
                <div className="bg-red-50 p-3 rounded-full">
                  <MapPin className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Our Location</h3>
                  <p className="text-gray-600 font-light">123 Health Street, Medical City, State 12345</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="bg-red-50 p-3 rounded-full">
                  <Phone className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Phone Number</h3>
                  <p className="text-gray-600 font-light">+91 98765 43210</p>
                  <p className="text-gray-500 text-sm font-light">Mon-Fri 9am-6pm</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="bg-red-50 p-3 rounded-full">
                  <Mail className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Email Address</h3>
                  <p className="text-gray-600 font-light">info@jeevan.in</p>
                  <p className="text-gray-500 text-sm font-light">We reply within 24 hours</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white border border-gray-200 p-8 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 uppercase tracking-wider mb-2">Name</label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  value={formData.name}
                  required
                  className="mt-1 block w-full bg-white border border-gray-300 text-gray-900 py-3 px-4 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors rounded-md"
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 uppercase tracking-wider mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={formData.email}
                  required
                  className="mt-1 block w-full bg-white border border-gray-300 text-gray-900 py-3 px-4 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors rounded-md"
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 uppercase tracking-wider mb-2">Subject</label>
                <input
                  type="text"
                  name="subject"
                  id="subject"
                  value={formData.subject}
                  required
                  className="mt-1 block w-full bg-white border border-gray-300 text-gray-900 py-3 px-4 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors rounded-md"
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 uppercase tracking-wider mb-2">Message</label>
                <textarea
                  name="message"
                  id="message"
                  rows={4}
                  value={formData.message}
                  required
                  className="mt-1 block w-full bg-white border border-gray-300 text-gray-900 py-3 px-4 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors rounded-md"
                  onChange={handleChange}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-4 px-4 border border-transparent text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none transition-colors uppercase tracking-wider rounded-md shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Sending..." : "Send Message"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
