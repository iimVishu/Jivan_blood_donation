"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Star, MessageSquare, Clock, Users, Sparkles, CheckCircle } from "lucide-react";

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointmentId: string;
  bloodBankName: string;
  donationDate: string;
  onSubmitSuccess: () => void;
}

export default function FeedbackModal({ 
  isOpen, 
  onClose, 
  appointmentId, 
  bloodBankName, 
  donationDate,
  onSubmitSuccess 
}: FeedbackModalProps) {
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    rating: 0,
    experience: "",
    staffBehavior: 0,
    cleanliness: 0,
    waitTime: "",
    wouldRecommend: null as boolean | null,
    comments: "",
    suggestions: ""
  });

  const handleStarClick = (field: 'rating' | 'staffBehavior' | 'cleanliness', value: number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setError("");
    
    // Validate
    if (!formData.rating || !formData.experience || !formData.staffBehavior || 
        !formData.cleanliness || !formData.waitTime || formData.wouldRecommend === null) {
      setError("Please complete all required fields");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appointmentId,
          ...formData
        })
      });

      if (res.ok) {
        setSubmitted(true);
        setTimeout(() => {
          onSubmitSuccess();
          onClose();
        }, 2000);
      } else {
        const data = await res.json();
        setError(data.error || "Failed to submit feedback");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (field: 'rating' | 'staffBehavior' | 'cleanliness', label: string) => (
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div className="flex space-x-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <motion.button
            key={star}
            type="button"
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleStarClick(field, star)}
            className="focus:outline-none"
          >
            <Star
              className={`h-8 w-8 transition-colors ${
                star <= formData[field]
                  ? "text-yellow-400 fill-yellow-400"
                  : "text-gray-300"
              }`}
            />
          </motion.button>
        ))}
      </div>
    </div>
  );

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-red-500 to-red-600 p-6 rounded-t-2xl">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-bold text-white">Donation Feedback</h2>
                <p className="text-red-100 text-sm mt-1">
                  {bloodBankName} • {new Date(donationDate).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-white/80 hover:text-white transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="flex mt-4 space-x-2">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`h-1 flex-1 rounded-full ${
                    s <= step ? "bg-white" : "bg-white/30"
                  }`}
                />
              ))}
            </div>
          </div>

          {submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-8 text-center"
            >
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Thank You!</h3>
              <p className="text-gray-600">Your feedback helps us improve our services.</p>
            </motion.div>
          ) : (
            <div className="p-6">
              {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {step === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Sparkles className="h-5 w-5 text-red-500 mr-2" />
                    Overall Experience
                  </h3>

                  {renderStars('rating', 'How would you rate your overall experience? *')}

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      How was your experience? *
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { value: 'excellent', label: 'Excellent 😊', color: 'green' },
                        { value: 'good', label: 'Good 🙂', color: 'blue' },
                        { value: 'average', label: 'Average 😐', color: 'yellow' },
                        { value: 'poor', label: 'Poor 😞', color: 'red' }
                      ].map((option) => (
                        <motion.button
                          key={option.value}
                          type="button"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setFormData(prev => ({ ...prev, experience: option.value }))}
                          className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                            formData.experience === option.value
                              ? "border-red-500 bg-red-50 text-red-700"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          {option.label}
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setStep(2)}
                    disabled={!formData.rating || !formData.experience}
                    className="w-full py-3 bg-red-600 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </motion.button>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Users className="h-5 w-5 text-red-500 mr-2" />
                    Staff & Facility
                  </h3>

                  {renderStars('staffBehavior', 'How was the staff behavior? *')}
                  {renderStars('cleanliness', 'How was the cleanliness? *')}

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <Clock className="h-4 w-4 mr-2" />
                      How long did you wait? *
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { value: 'less_than_15', label: '< 15 mins' },
                        { value: '15_to_30', label: '15-30 mins' },
                        { value: '30_to_60', label: '30-60 mins' },
                        { value: 'more_than_60', label: '> 60 mins' }
                      ].map((option) => (
                        <motion.button
                          key={option.value}
                          type="button"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setFormData(prev => ({ ...prev, waitTime: option.value }))}
                          className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                            formData.waitTime === option.value
                              ? "border-red-500 bg-red-50 text-red-700"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          {option.label}
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setStep(1)}
                      className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium"
                    >
                      Back
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setStep(3)}
                      disabled={!formData.staffBehavior || !formData.cleanliness || !formData.waitTime}
                      className="flex-1 py-3 bg-red-600 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <MessageSquare className="h-5 w-5 text-red-500 mr-2" />
                    Additional Feedback
                  </h3>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Would you recommend this blood bank to others? *
                    </label>
                    <div className="flex space-x-3">
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setFormData(prev => ({ ...prev, wouldRecommend: true }))}
                        className={`flex-1 p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                          formData.wouldRecommend === true
                            ? "border-green-500 bg-green-50 text-green-700"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        👍 Yes, definitely!
                      </motion.button>
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setFormData(prev => ({ ...prev, wouldRecommend: false }))}
                        className={`flex-1 p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                          formData.wouldRecommend === false
                            ? "border-red-500 bg-red-50 text-red-700"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        👎 Not really
                      </motion.button>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Any comments about your experience?
                    </label>
                    <textarea
                      value={formData.comments}
                      onChange={(e) => setFormData(prev => ({ ...prev, comments: e.target.value }))}
                      rows={3}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                      placeholder="Share your experience..."
                    />
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Any suggestions for improvement?
                    </label>
                    <textarea
                      value={formData.suggestions}
                      onChange={(e) => setFormData(prev => ({ ...prev, suggestions: e.target.value }))}
                      rows={2}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                      placeholder="Help us improve..."
                    />
                  </div>

                  <div className="flex space-x-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setStep(2)}
                      className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium"
                    >
                      Back
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleSubmit}
                      disabled={formData.wouldRecommend === null || submitting}
                      className="flex-1 py-3 bg-red-600 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitting ? "Submitting..." : "Submit Feedback"}
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
