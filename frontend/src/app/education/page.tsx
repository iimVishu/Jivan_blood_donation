"use client";

import { motion } from 'framer-motion';
import { Droplet, Heart, AlertCircle, Users, ArrowRight, Check, X } from 'lucide-react';
import Link from 'next/link';

const bloodTypes = [
  {
    type: 'A+',
    canDonateTo: ['A+', 'AB+'],
    canReceiveFrom: ['A+', 'A-', 'O+', 'O-'],
    population: '30%',
    color: 'bg-red-500',
  },
  {
    type: 'A-',
    canDonateTo: ['A+', 'A-', 'AB+', 'AB-'],
    canReceiveFrom: ['A-', 'O-'],
    population: '6%',
    color: 'bg-red-600',
    isRare: true,
  },
  {
    type: 'B+',
    canDonateTo: ['B+', 'AB+'],
    canReceiveFrom: ['B+', 'B-', 'O+', 'O-'],
    population: '26%',
    color: 'bg-blue-500',
  },
  {
    type: 'B-',
    canDonateTo: ['B+', 'B-', 'AB+', 'AB-'],
    canReceiveFrom: ['B-', 'O-'],
    population: '2%',
    color: 'bg-blue-600',
    isRare: true,
  },
  {
    type: 'AB+',
    canDonateTo: ['AB+'],
    canReceiveFrom: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    population: '4%',
    color: 'bg-purple-500',
    isUniversalRecipient: true,
  },
  {
    type: 'AB-',
    canDonateTo: ['AB+', 'AB-'],
    canReceiveFrom: ['A-', 'B-', 'AB-', 'O-'],
    population: '1%',
    color: 'bg-purple-600',
    isRare: true,
  },
  {
    type: 'O+',
    canDonateTo: ['A+', 'B+', 'AB+', 'O+'],
    canReceiveFrom: ['O+', 'O-'],
    population: '28%',
    color: 'bg-green-500',
  },
  {
    type: 'O-',
    canDonateTo: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    canReceiveFrom: ['O-'],
    population: '3%',
    color: 'bg-green-600',
    isUniversalDonor: true,
    isRare: true,
  },
];

const faqs = [
  {
    question: 'How often can I donate blood?',
    answer: 'You can donate whole blood every 56 days (about 3 months). Platelet donors can donate more frequently - up to 24 times per year.',
  },
  {
    question: 'Does blood donation hurt?',
    answer: 'You may feel a slight pinch when the needle is inserted, but most donors report minimal discomfort. The actual donation takes only 8-10 minutes.',
  },
  {
    question: 'How long does blood donation take?',
    answer: 'The entire process takes about 45-60 minutes, including registration, health screening, donation, and refreshments. The actual blood draw is only 8-10 minutes.',
  },
  {
    question: 'What should I eat before donating?',
    answer: 'Eat a healthy meal and drink plenty of water before donating. Avoid fatty foods. Good options include fruits, vegetables, whole grains, and lean proteins.',
  },
  {
    question: 'Can I donate if I have a tattoo?',
    answer: 'Yes, if the tattoo was done at a licensed facility with sterile needles, you can donate after 6 months. If you are unsure about the facility, wait 12 months.',
  },
  {
    question: 'What happens to my blood after donation?',
    answer: 'Your blood is tested for blood type and infectious diseases, then separated into components (red cells, plasma, platelets) that can help up to 3 patients.',
  },
];

const benefits = [
  {
    title: 'Free Health Check',
    description: 'Blood pressure, pulse, temperature, and hemoglobin levels are checked before each donation.',
    icon: Heart,
  },
  {
    title: 'Reduce Iron Overload',
    description: 'Regular donation helps maintain healthy iron levels and reduces the risk of hemochromatosis.',
    icon: Droplet,
  },
  {
    title: 'Burn Calories',
    description: 'Donating one pint of blood burns approximately 650 calories as your body works to replenish it.',
    icon: AlertCircle,
  },
  {
    title: 'Save Lives',
    description: 'One donation can save up to 3 lives. Blood is needed every 2 seconds for surgeries, accidents, and treatments.',
    icon: Users,
  },
];

export default function BloodEducationPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Blood Type Guide
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Understanding blood types is crucial for safe transfusions. Learn about compatibility, 
            donation benefits, and how you can help save lives.
          </p>
        </motion.div>

        {/* Blood Type Compatibility Chart */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-16"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Blood Type Compatibility
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {bloodTypes.map((blood, index) => (
              <motion.div
                key={blood.type}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
              >
                <div className={`${blood.color} p-6 text-white text-center relative`}>
                  <div className="text-4xl font-bold">{blood.type}</div>
                  <div className="text-sm opacity-80 mt-1">{blood.population} of population</div>
                  {blood.isRare && (
                    <span className="absolute top-2 right-2 bg-white/20 text-xs px-2 py-1 rounded-full">
                      Rare
                    </span>
                  )}
                  {blood.isUniversalDonor && (
                    <span className="absolute top-2 right-2 bg-white/20 text-xs px-2 py-1 rounded-full">
                      Universal Donor
                    </span>
                  )}
                  {blood.isUniversalRecipient && (
                    <span className="absolute top-2 right-2 bg-white/20 text-xs px-2 py-1 rounded-full">
                      Universal Recipient
                    </span>
                  )}
                </div>
                
                <div className="p-4">
                  <div className="mb-4">
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                      Can Donate To
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {blood.canDonateTo.map((t) => (
                        <span
                          key={t}
                          className="px-2 py-1 bg-green-100 text-green-700 rounded text-sm font-medium"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                      Can Receive From
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {blood.canReceiveFrom.map((t) => (
                        <span
                          key={t}
                          className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm font-medium"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Interactive Compatibility Checker */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mb-16 bg-white rounded-2xl shadow-lg p-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Quick Compatibility Check
          </h2>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="py-3 px-4 text-left font-semibold text-gray-700">Donor →</th>
                  {bloodTypes.map((b) => (
                    <th key={b.type} className="py-3 px-2 text-center font-semibold text-gray-700">
                      {b.type}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {bloodTypes.map((recipient) => (
                  <tr key={recipient.type} className="border-b border-gray-100">
                    <td className="py-3 px-4 font-semibold text-gray-700">
                      {recipient.type}
                    </td>
                    {bloodTypes.map((donor) => (
                      <td key={donor.type} className="py-3 px-2 text-center">
                        {recipient.canReceiveFrom.includes(donor.type) ? (
                          <Check className="w-5 h-5 text-green-500 mx-auto" />
                        ) : (
                          <X className="w-5 h-5 text-red-300 mx-auto" />
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-center text-gray-500 text-sm mt-4">
            ✓ indicates compatible transfusion (Donor → Recipient)
          </p>
        </motion.section>

        {/* Benefits Section */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mb-16"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Benefits of Donating Blood
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                className="bg-white rounded-xl p-6 shadow-lg text-center"
              >
                <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <benefit.icon className="w-7 h-7 text-red-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                <p className="text-gray-600 text-sm">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* FAQs */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mb-16"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Frequently Asked Questions
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + index * 0.1 }}
                className="bg-white rounded-xl p-6 shadow-lg"
              >
                <h3 className="font-semibold text-gray-900 mb-2">{faq.question}</h3>
                <p className="text-gray-600 text-sm">{faq.answer}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* CTA Section */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center bg-gradient-to-r from-red-600 to-red-700 rounded-2xl p-12 text-white"
        >
          <h2 className="text-3xl font-bold mb-4">Ready to Save Lives?</h2>
          <p className="text-xl text-red-100 mb-8 max-w-2xl mx-auto">
            Every blood donation can save up to 3 lives. Check your eligibility and schedule 
            a donation today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/donate">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-white text-red-600 rounded-full font-semibold text-lg hover:bg-gray-100 transition-colors inline-flex items-center gap-2"
              >
                Donate Blood
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </Link>
            <Link href="/eligibility">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-red-500 text-white rounded-full font-semibold text-lg hover:bg-red-400 transition-colors"
              >
                Check Eligibility
              </motion.button>
            </Link>
          </div>
        </motion.section>
      </div>
    </div>
  );
}
