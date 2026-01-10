"use client";

import { useSession } from "next-auth/react";
import { Plus, Droplet, Users, Calendar, Check, X, Clock, Activity } from "lucide-react";
import InventoryChart from "@/components/InventoryChart";
import { useState, useEffect } from "react";
import EmergencyAlertsList from "@/components/EmergencyAlertsList";
import { motion, AnimatePresence } from "framer-motion";

export default function HospitalDashboard() {
  const { data: session } = useSession();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Multi-bank support
  const [linkedBanks, setLinkedBanks] = useState<any[]>([]);
  const [selectedBankId, setSelectedBankId] = useState<string | null>(null);
  
  const [bankStatus, setBankStatus] = useState<string>('Active');
  const [showStockModal, setShowStockModal] = useState(false);
  const [editingStock, setEditingStock] = useState<any>({});
  
  // Health Stats Modal
  const [showHealthModal, setShowHealthModal] = useState(false);
  const [selectedAptId, setSelectedAptId] = useState<string | null>(null);
  const [healthStats, setHealthStats] = useState({
    bloodPressure: '',
    hemoglobin: '',
    weight: '',
    pulse: '',
    temperature: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Get Profile to find Hospital IDs
        const profileRes = await fetch("/api/profile");
        if (!profileRes.ok) return;
        const profile = await profileRes.json();

        // Determine linked banks
        const ids = profile.hospitalIds && profile.hospitalIds.length > 0 
          ? profile.hospitalIds 
          : (profile.hospitalId ? [profile.hospitalId] : []);

        if (ids.length > 0) {
          // Fetch details for all linked banks
          const bankPromises = ids.map((id: string) => 
            fetch(`/api/bloodbanks/${id}`).then(res => res.ok ? res.json() : null)
          );
          
          const banks = (await Promise.all(bankPromises)).filter(b => b !== null);
          setLinkedBanks(banks);

          if (banks.length > 0) {
            // Default to first bank or previously selected
            const initialBankId = banks[0]._id;
            setSelectedBankId(initialBankId);
            
            // Set initial data from first bank
            setInventory(banks[0].stock);
            setEditingStock(banks[0].stock);
            setBankStatus(banks[0].status || 'Active');
          }
        }

        // 3. Get Appointments
        const aptRes = await fetch("/api/appointments");
        if (aptRes.ok) {
          setAppointments(await aptRes.json());
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchData();
    }
  }, [session]);

  // Effect to update view when selected bank changes
  useEffect(() => {
    if (selectedBankId && linkedBanks.length > 0) {
      const bank = linkedBanks.find(b => b._id === selectedBankId);
      if (bank) {
        setInventory(bank.stock);
        setEditingStock(bank.stock);
        setBankStatus(bank.status || 'Active');
      }
    }
  }, [selectedBankId, linkedBanks]);

  const handleStockUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBankId) return;

    try {
      const res = await fetch(`/api/bloodbanks/${selectedBankId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock: editingStock })
      });

      if (res.ok) {
        setInventory(editingStock);
        // Update local state for linkedBanks to reflect changes immediately
        setLinkedBanks(prev => prev.map(b => 
          b._id === selectedBankId ? { ...b, stock: editingStock } : b
        ));
        setShowStockModal(false);
        alert("Stock updated successfully");
      } else {
        alert("Failed to update stock");
      }
    } catch (error) {
      console.error("Error updating stock:", error);
      alert("An error occurred");
    }
  };

  const handleHealthStatsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAptId) return;

    try {
      const res = await fetch(`/api/appointments/${selectedAptId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          status: 'completed',
          healthStats 
        }),
      });
      
      if (res.ok) {
        // Refresh appointments
        const aptRes = await fetch("/api/appointments");
        if (aptRes.ok) setAppointments(await aptRes.json());
        
        // Refresh inventory
        if (selectedBankId) {
           const bankRes = await fetch(`/api/bloodbanks/${selectedBankId}`);
           if (bankRes.ok) {
             const bank = await bankRes.json();
             setInventory(bank.stock);
             setLinkedBanks(prev => prev.map(b => 
               b._id === selectedBankId ? { ...b, stock: bank.stock } : b
             ));
           }
        }
        setShowHealthModal(false);
        setHealthStats({ bloodPressure: '', hemoglobin: '', weight: '', pulse: '', temperature: '' });
        alert("Donation completed and health stats recorded!");
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    if (status === 'completed') {
      setSelectedAptId(id);
      // Pre-fill existing stats if available
      const apt = appointments.find(a => a._id === id);
      if (apt && apt.healthStats) {
        setHealthStats(apt.healthStats);
      } else {
        setHealthStats({ bloodPressure: '', hemoglobin: '', weight: '', pulse: '', temperature: '' });
      }
      setShowHealthModal(true);
      return;
    }

    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      
      if (res.ok) {
        // Refresh appointments
        const aptRes = await fetch("/api/appointments");
        if (aptRes.ok) setAppointments(await aptRes.json());
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const updateTrackingStatus = async (id: string, trackingStatus: string) => {
    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trackingStatus }),
      });
      
      if (res.ok) {
        // Refresh appointments
        const aptRes = await fetch("/api/appointments");
        if (aptRes.ok) setAppointments(await aptRes.json());
      }
    } catch (error) {
      console.error("Error updating tracking status:", error);
    }
  };

  const updateBankStatus = async (newStatus: string) => {
    if (!selectedBankId) return;
    try {
      const res = await fetch(`/api/bloodbanks/${selectedBankId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        setBankStatus(newStatus);
        // Update local state
        setLinkedBanks(prev => prev.map(b => 
          b._id === selectedBankId ? { ...b, status: newStatus } : b
        ));
      }
    } catch (error) {
      console.error("Error updating bank status", error);
    }
  };

  const pendingAppointments = appointments.filter(a => a.status === 'pending');
  const confirmedAppointments = appointments.filter(a => a.status === 'confirmed');
  const totalStock = (inventory ? Object.values(inventory).reduce((a: number, b: any) => a + (Number(b) || 0), 0) : 0) as number;

  if (loading) return <div className="p-8 text-center">Loading dashboard...</div>;

  if (!selectedBankId) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center max-w-md"
        >
          <Activity className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">No Blood Bank Linked</h2>
          <p className="text-gray-600 mb-6">
            Your account is not currently linked to any blood bank. Please contact an administrator to link your account to a blood bank facility.
          </p>
          <div className="text-sm text-gray-500">
            Account ID: {session?.user?.id}
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex justify-between items-center mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Hospital Dashboard</h1>
            <p className="text-gray-600">Manage blood stock and donations</p>
            {linkedBanks.length > 1 && (
              <div className="mt-2">
                <select
                  value={selectedBankId || ""}
                  onChange={(e) => setSelectedBankId(e.target.value)}
                  className="p-2 border rounded-md text-sm font-medium text-gray-700 bg-white shadow-sm focus:ring-2 focus:ring-red-500 outline-none"
                >
                  {linkedBanks.map(bank => (
                    <option key={bank._id} value={bank._id}>
                      {bank.name} ({bank.address?.city})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowStockModal(true)}
            className="bg-red-600 text-white px-4 py-2 rounded-md flex items-center hover:bg-red-700"
          >
            <Plus className="h-5 w-5 mr-2" />
            Update Stock
          </motion.button>
        </motion.div>

        {/* Emergency Alerts Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <EmergencyAlertsList />
        </motion.div>

        {/* Stock Update Modal */}
        <AnimatePresence>
          {showStockModal && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            >
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full"
              >
                <h2 className="text-xl font-bold mb-4">Update Blood Stock</h2>
                <form onSubmit={handleStockUpdate} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    {Object.keys(editingStock || {}).map((group) => (
                      <div key={group}>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{group}</label>
                        <input
                          type="number"
                          min="0"
                          value={editingStock[group]}
                          onChange={(e) => setEditingStock({
                            ...editingStock,
                            [group]: parseInt(e.target.value) || 0
                          })}
                          className="w-full p-2 border border-gray-300 rounded-md"
                        />
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-end space-x-2 mt-6">
                    <button
                      type="button"
                      onClick={() => setShowStockModal(false)}
                      className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Health Stats Modal */}
        <AnimatePresence>
          {showHealthModal && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            >
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full"
              >
                <h2 className="text-xl font-bold mb-4">Record Donor Health Stats</h2>
                <form onSubmit={handleHealthStatsSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Blood Pressure (e.g. 120/80)</label>
                    <input
                      type="text"
                      required
                      value={healthStats.bloodPressure}
                      onChange={(e) => setHealthStats({...healthStats, bloodPressure: e.target.value})}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="120/80"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Hemoglobin (g/dL)</label>
                      <input
                        type="text"
                        required
                        value={healthStats.hemoglobin}
                        onChange={(e) => setHealthStats({...healthStats, hemoglobin: e.target.value})}
                        className="w-full p-2 border border-gray-300 rounded-md"
                        placeholder="14.5"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
                      <input
                        type="text"
                        required
                        value={healthStats.weight}
                        onChange={(e) => setHealthStats({...healthStats, weight: e.target.value})}
                        className="w-full p-2 border border-gray-300 rounded-md"
                        placeholder="70"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Pulse (bpm)</label>
                      <input
                        type="text"
                        required
                        value={healthStats.pulse}
                        onChange={(e) => setHealthStats({...healthStats, pulse: e.target.value})}
                        className="w-full p-2 border border-gray-300 rounded-md"
                        placeholder="72"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Temp (°C)</label>
                      <input
                        type="text"
                        required
                        value={healthStats.temperature}
                        onChange={(e) => setHealthStats({...healthStats, temperature: e.target.value})}
                        className="w-full p-2 border border-gray-300 rounded-md"
                        placeholder="37"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2 mt-6">
                    <button
                      type="button"
                      onClick={() => setShowHealthModal(false)}
                      className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Save Health Stats
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-500 text-sm font-medium">Bank Status</h3>
              <Activity className={`h-5 w-5 ${bankStatus === 'Active' ? 'text-green-500' : 'text-red-500'}`} />
            </div>
            <select 
              value={bankStatus} 
              onChange={(e) => updateBankStatus(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md text-sm font-medium text-gray-900 focus:ring-2 focus:ring-red-500 outline-none"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Out of Stock">Out of Stock</option>
            </select>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-500 text-sm font-medium">Total Stock</h3>
              <Droplet className="h-5 w-5 text-red-500" />
            </div>
            <div className="text-3xl font-bold text-gray-900">{totalStock} <span className="text-sm font-normal text-gray-500">units</span></div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-500 text-sm font-medium">Pending Requests</h3>
              <Users className="h-5 w-5 text-blue-500" />
            </div>
            <div className="text-3xl font-bold text-gray-900">{pendingAppointments.length}</div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-500 text-sm font-medium">Confirmed Appointments</h3>
              <Calendar className="h-5 w-5 text-green-500" />
            </div>
            <div className="text-3xl font-bold text-gray-900">{confirmedAppointments.length}</div>
          </motion.div>
        </div>

        {/* Appointments Management */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8"
        >
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">Donation Appointments</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Donor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Blood Group</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tracking</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {appointments.map((apt) => (
                  <tr key={apt._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{apt.donor?.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{apt.donor?.bloodGroup}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(apt.date).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${apt.status === 'confirmed' ? 'bg-green-100 text-green-800' : 
                          apt.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                          apt.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'}`}>
                        {apt.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {apt.status === 'completed' ? (
                        <select
                          value={apt.trackingStatus || 'collected'}
                          onChange={(e) => updateTrackingStatus(apt._id, e.target.value)}
                          className="text-xs border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
                        >
                          <option value="collected">Collected</option>
                          <option value="testing">In Lab</option>
                          <option value="processing">Processing</option>
                          <option value="ready">Ready</option>
                          <option value="transfused">Transfused</option>
                        </select>
                      ) : (
                        <span className="text-xs text-gray-400">--</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      {apt.status === 'pending' && (
                        <>
                          <button onClick={() => updateStatus(apt._id, 'confirmed')} className="text-green-600 hover:text-green-900" title="Confirm">
                            <Check className="h-5 w-5" />
                          </button>
                          <button onClick={() => updateStatus(apt._id, 'cancelled')} className="text-red-600 hover:text-red-900" title="Cancel">
                            <X className="h-5 w-5" />
                          </button>
                        </>
                      )}
                      {apt.status === 'confirmed' && (
                        <button onClick={() => updateStatus(apt._id, 'completed')} className="text-blue-600 hover:text-blue-900 flex items-center">
                          <Droplet className="h-4 w-4 mr-1" /> Complete Donation
                        </button>
                      )}
                      {apt.status === 'completed' && (
                        <button onClick={() => updateStatus(apt._id, 'completed')} className="text-gray-600 hover:text-gray-900 flex items-center">
                          <Activity className="h-4 w-4 mr-1" /> Edit Vitals
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {appointments.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">No appointments found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Inventory Table */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8"
        >
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">Blood Inventory</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Blood Group</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Units Available</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {inventory && Object.entries(inventory).map(([group, count]: [string, any]) => (
                  <tr key={group}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{group}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{count}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${count > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {count > 0 ? 'Available' : 'Out of Stock'}
                      </span>
                    </td>
                  </tr>
                ))}
                {!inventory && (
                   <tr>
                    <td colSpan={3} className="px-6 py-4 text-center text-gray-500">No inventory data available. Ensure you are linked to a blood bank.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
