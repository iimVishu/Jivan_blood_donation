'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, XCircle, MapPin, Phone, User, Clock, RefreshCw, Share2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ShareButtons from './ShareButtons';

interface Alert {
  _id: string;
  user?: {
    name: string;
    email: string;
    phone: string;
    bloodType: string;
  };
  location: {
    lat: number;
    lng: number;
    address?: string;
  };
  status: 'active' | 'resolved' | 'false_alarm';
  contactNumber?: string;
  createdAt: string;
}

export default function EmergencyAlertsList() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchAlerts = async () => {
    try {
      const res = await fetch('/api/sos');
      if (res.ok) {
        const data = await res.json();
        setAlerts(data);
      }
    } catch (error) {
      console.error('Failed to fetch alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
    // Poll for new alerts every 30 seconds
    const interval = setInterval(fetchAlerts, 30000);
    return () => clearInterval(interval);
  }, []);

  const updateStatus = async (id: string, status: 'resolved' | 'false_alarm') => {
    setUpdating(id);
    try {
      const res = await fetch(`/api/sos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        // Remove the alert from the list locally
        setAlerts(prev => prev.filter(a => a._id !== id));
      }
    } catch (error) {
      console.error('Failed to update status:', error);
    } finally {
      setUpdating(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (alerts.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center"
      >
        <div className="bg-green-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="h-8 w-8 text-green-500" />
        </div>
        <h3 className="text-lg font-medium text-gray-900">No Active Emergencies</h3>
        <p className="text-gray-500 mt-2">All clear! There are no active SOS alerts at the moment.</p>
        <button 
          onClick={fetchAlerts}
          className="mt-4 inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Status
        </button>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900 flex items-center">
          <AlertTriangle className="h-6 w-6 text-red-600 mr-2" />
          Active Emergency Alerts ({alerts.length})
        </h2>
        <button 
          onClick={fetchAlerts}
          className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
          title="Refresh"
        >
          <RefreshCw className="h-5 w-5" />
        </button>
      </div>

      <motion.div layout className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {alerts.map((alert) => (
            <motion.div 
              layout
              key={alert._id} 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
              className="bg-red-50 border border-red-200 rounded-xl p-5 shadow-sm"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-2">
                  <span className="flex h-3 w-3 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                  </span>
                  <span className="text-xs font-bold text-red-700 uppercase tracking-wider">Live SOS</span>
                </div>
                <span className="text-xs text-gray-500 flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  {new Date(alert.createdAt).toLocaleTimeString()}
                </span>
              </div>

              <div className="space-y-3 mb-6">
                {alert.user && (
                  <div className="flex items-start space-x-2">
                    <User className="h-4 w-4 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{alert.user.name}</p>
                      <p className="text-xs text-gray-500">Blood Type: <span className="font-bold text-red-600">{alert.user.bloodType}</span></p>
                    </div>
                  </div>
                )}

                <div className="flex items-start space-x-2">
                  <Phone className="h-4 w-4 text-gray-400 mt-0.5" />
                  <a href={`tel:${alert.contactNumber || alert.user?.phone}`} className="text-sm font-medium text-blue-600 hover:underline">
                    {alert.contactNumber || alert.user?.phone || 'No contact info'}
                  </a>
                </div>

                <div className="flex items-start space-x-2">
                  <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                  <div className="text-sm text-gray-600">
                    <p>Lat: {alert.location.lat.toFixed(6)}</p>
                    <p>Lng: {alert.location.lng.toFixed(6)}</p>
                    <a 
                      href={`https://www.google.com/maps/search/?api=1&query=${alert.location.lat},${alert.location.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:underline mt-1 inline-block"
                    >
                      View on Google Maps
                    </a>
                  </div>
                </div>
              </div>

              {/* Share Button */}
              <div className="mb-4">
                <ShareButtons 
                  title={`URGENT: ${alert.user?.bloodType || 'Blood'} needed!`}
                  text={`Emergency blood request for ${alert.user?.name || 'a patient'}. Blood type: ${alert.user?.bloodType || 'Unknown'}. Contact: ${alert.contactNumber || alert.user?.phone || 'N/A'}`}
                  compact
                />
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => updateStatus(alert._id, 'resolved')}
                  disabled={updating === alert._id}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center disabled:opacity-50"
                >
                  {updating === alert._id ? 'Updating...' : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Resolve
                    </>
                  )}
                </button>
                <button
                  onClick={() => updateStatus(alert._id, 'false_alarm')}
                  disabled={updating === alert._id}
                  className="flex-1 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center disabled:opacity-50"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  False Alarm
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
