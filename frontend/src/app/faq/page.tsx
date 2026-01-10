"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

const faqs = [
  {
    question: "Who can donate blood?",
    answer: "Generally, anyone between 18 and 65 years old, weighing at least 50kg, and in good health can donate blood. There are specific criteria regarding medical history, travel, and medications."
  },
  {
    question: "How often can I donate?",
    answer: "Men can donate whole blood every 3 months, while women can donate every 4 months. Platelet donation can be done more frequently."
  },
  {
    question: "Does it hurt?",
    answer: "You may feel a slight pinch when the needle is inserted, but the donation process itself is painless. Most donors report feeling comfortable throughout."
  },
  {
    question: "How long does it take?",
    answer: "The actual donation takes about 10-15 minutes. However, the entire process, including registration, screening, and post-donation refreshment, takes about 45-60 minutes."
  },
  {
    question: "What should I do before donating?",
    answer: "Drink plenty of water, eat a healthy meal (avoid fatty foods), and get a good night's sleep before your donation."
  },
  {
    question: "Is it safe to donate blood?",
    answer: "Yes, it is completely safe. We use sterile, disposable needles and equipment for every donor. There is no risk of contracting any disease."
  }
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900">Frequently Asked Questions</h1>
          <p className="mt-4 text-gray-600">Find answers to common questions about blood donation.</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm overflow-hidden">
              <button
                className="w-full px-6 py-4 text-left flex justify-between items-center focus:outline-none"
                onClick={() => toggleFAQ(index)}
              >
                <span className="font-medium text-gray-900">{faq.question}</span>
                {openIndex === index ? (
                  <ChevronUp className="h-5 w-5 text-gray-500" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-500" />
                )}
              </button>
              {openIndex === index && (
                <div className="px-6 pb-4 text-gray-600 text-sm border-t border-gray-100 pt-4">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
