'use client';

import { useState } from 'react';
import { AlertTriangle, Loader2, Phone, MapPin, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function EmergencySOS() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSOS = async () => {
    setIsLoading(true);
    setStatus('idle');

    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      setIsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const response = await fetch('/api/sos', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              location: {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
              },
            }),
          });

          if (response.ok) {
            setStatus('success');
            setTimeout(() => {
              setIsOpen(false);
              setStatus('idle');
            }, 3000);
          } else {
            setStatus('error');
          }
        } catch (error) {
          console.error('Error sending SOS:', error);
          setStatus('error');
        } finally {
          setIsLoading(false);
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        alert('Unable to retrieve your location. Please enable location services.');
        setIsLoading(false);
      }
    );
  };

  return (
    <>
      {/* Floating Action Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-6 z-50 bg-red-600 text-white p-4 rounded-full shadow-lg focus:outline-none focus:ring-4 focus:ring-red-300"
        title="Emergency SOS"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        animate={{ 
          boxShadow: ["0px 0px 0px rgba(220, 38, 38, 0)", "0px 0px 20px rgba(220, 38, 38, 0.6)", "0px 0px 0px rgba(220, 38, 38, 0)"],
        }}
        transition={{ 
          boxShadow: {
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }
        }}
      >
        <AlertTriangle className="h-8 w-8" />
      </motion.button>

      {/* Modal Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
            >
              
              {/* Header */}
              <div className="bg-red-600 p-6 text-center relative">
                <button 
                  onClick={() => setIsOpen(false)}
                  className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
                <motion.div 
                  animate={{ rotate: [0, -10, 10, -10, 10, 0] }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                >
                  <AlertTriangle className="h-10 w-10 text-white" />
                </motion.div>
                <h2 className="text-2xl font-bold text-white">Emergency SOS</h2>
                <p className="text-red-100 mt-2">
                  This will alert nearby blood banks and hospitals of your emergency.
                </p>
              </div>

              {/* Body */}
              <div className="p-6">
                <AnimatePresence mode="wait">
                  {status === 'success' ? (
                    <motion.div 
                      key="success"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="text-center py-4"
                    >
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Phone className="h-8 w-8 text-green-600" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900">Alert Sent!</h3>
                      <p className="text-gray-600 mt-2">Help is on the way. Keep your phone nearby.</p>
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="form"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="space-y-6"
                    >
                      <div className="bg-red-50 border border-red-100 rounded-lg p-4 flex items-start gap-3">
                        <MapPin className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                        <p className="text-sm text-red-800">
                          Your current location will be shared with emergency responders.
                        </p>
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleSOS}
                        disabled={isLoading}
                        className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-6 rounded-xl shadow-md transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-lg"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="h-6 w-6 animate-spin" />
                            Sending Alert...
                          </>
                        ) : (
                          <>
                            <AlertTriangle className="h-6 w-6" />
                            TRIGGER SOS NOW
                          </>
                        )}
                      </motion.button>
                      
                      <p className="text-xs text-center text-gray-500">
                        Only use this in case of a genuine medical emergency.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
