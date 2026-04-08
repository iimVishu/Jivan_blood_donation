"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Users, Droplet, Activity, AlertCircle, Plus, MapPin, Calendar, Check, X, Trash2, AlertTriangle, Siren, Megaphone, MessageSquare, Star, Download } from "lucide-react";
import { useState, useEffect } from "react";
import EmergencyAlertsList from "@/components/EmergencyAlertsList";
import LocationPicker from "@/components/LocationPicker";
import { motion, AnimatePresence } from "framer-motion";

const exportToCSV = (data: any[], filename: string) => {
  if (!data || data.length === 0) {
    alert("No data to export");
    return;
  }

  // Extract headers
  const sample = data[0];
  const headers = Object.keys(sample).filter(key => 
    typeof sample[key] !== 'object' || sample[key] === null
  );

  const csvRows = [
    headers.join(","),
    ...data.map(row => 
      headers.map(header => {
        let val = row[header];
        if (val === null || val === undefined) val = "";
        
        // Format dates correctly for Excel
        if (typeof val === 'string' && (header.toLowerCase().includes('date') || header === 'createdAt' || header === 'updatedAt')) {
          const date = new Date(val);
          if (!isNaN(date.getTime())) {
            val = date.toLocaleString(); 
          }
        }

        // Wrap in quotes to handle commas
        return `"${String(val).replace(/"/g, '""')}"`;
      }).join(",")
    )
  ];

  const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.setAttribute("hidden", "");
  a.setAttribute("href", url);
  a.setAttribute("download", `${filename}.csv`);
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState<any>(null);
  const [bloodBanks, setBloodBanks] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [camps, setCamps] = useState<any[]>([]);
  const [volunteers, setVolunteers] = useState<any[]>([]);
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [appointmentTab, setAppointmentTab] = useState<'pending' | 'upcoming' | 'completed'>('pending');
  const [requestTab, setRequestTab] = useState<'pending' | 'approved' | 'fulfilled' | 'rejected'>('pending');
  const [campTab, setCampTab] = useState<'pending' | 'approved' | 'rejected' | 'completed'>('pending');
  const [volunteerTab, setVolunteerTab] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [userRoleTab, setUserRoleTab] = useState<'all' | 'admin' | 'donor' | 'recipient' | 'hospital'>('all');
  const [dataRange, setDataRange] = useState<'30d' | 'all'>('30d');

  const filteredAppointments = appointments.filter((apt) => {
    if (appointmentTab === 'pending') return apt.status === 'pending';
    if (appointmentTab === 'upcoming') return apt.status === 'confirmed';
    if (appointmentTab === 'completed') return apt.status === 'completed';
    return false;
  }).sort((a, b) => {
    if (appointmentTab === 'completed') {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    }
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });

  const filteredRequests = requests.filter(r => r.status === requestTab).sort((a, b) => new Date(b.createdAt || Date.now()).getTime() - new Date(a.createdAt || Date.now()).getTime());
  const filteredCamps = camps.filter(c => c.status === campTab).sort((a, b) => new Date(b.createdAt || Date.now()).getTime() - new Date(a.createdAt || Date.now()).getTime());
  const filteredVolunteers = volunteers.filter(v => v.status === volunteerTab).sort((a, b) => new Date(b.createdAt || Date.now()).getTime() - new Date(a.createdAt || Date.now()).getTime());
  const filteredUsers = users
    .filter((user) => userRoleTab === 'all' || user.role === userRoleTab)
    .sort((a, b) => {
      // Keep newest registrations first for easier admin review.
      return new Date(b.createdAt || Date.now()).getTime() - new Date(a.createdAt || Date.now()).getTime();
    });

  // Disaster Mode State
  const [showDisasterModal, setShowDisasterModal] = useState(false);
  const [activeDisaster, setActiveDisaster] = useState<any>(null);
  const [disasterData, setDisasterData] = useState({
    title: "",
    description: "",
    location: "",
    radius: 10,
    requiredBloodGroups: [] as string[]
  });

  // Link Hospital User State
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedBankIds, setSelectedBankIds] = useState<string[]>([]);

  // Form state for new blood bank
  const [showAddBank, setShowAddBank] = useState(false);
  const [newBank, setNewBank] = useState({
    name: "",
    email: "",
    phone: "",
    address: { street: "", city: "", state: "", zip: "" },
    location: { type: "Point", coordinates: [0, 0] }
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      if (session?.user?.role !== "admin") {
        router.push("/dashboard");
      } else {
        fetchStats();
        fetchDisasterStatus();
      }
    }
  }, [status, session, router]);

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role === "admin") {
      if (activeTab === "bloodbanks") fetchBloodBanks();
      if (activeTab === "appointments") fetchAppointments();
      if (activeTab === "users") fetchUsers();
      if (activeTab === "requests") fetchRequests();
      if (activeTab === "camps") fetchCamps();
      if (activeTab === "volunteers") fetchVolunteers();
      if (activeTab === "feedback") fetchFeedbacks();
      if (activeTab === "audit logs") fetchAuditLogs();
    }
  }, [activeTab, status, session, dataRange]);

  const fetchDisasterStatus = async () => {
    try {
      const res = await fetch("/api/disaster");
      if (res.ok) {
        const data = await res.json();
        setActiveDisaster(data.activeAlert || null);
      }
    } catch (error) {
      console.error("Error fetching disaster status:", error);
    }
  };

  const handleDisasterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/disaster", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          ...disasterData
        }),
      });
      
      if (res.ok) {
        const data = await res.json();
        setActiveDisaster(data.alert);
        setShowDisasterModal(false);
        // Reset form
        setDisasterData({
          title: "",
          description: "",
          location: "",
          radius: 10,
          requiredBloodGroups: []
        });
        alert("Disaster Mode Activated! Broadcast sent to all users.");
      }
    } catch (error) {
      console.error("Error activating disaster mode:", error);
    }
  };

  const handleResolveDisaster = async () => {
    if (!confirm("Are you sure you want to resolve this emergency? This will notify all users.")) return;
    
    try {
      const res = await fetch("/api/disaster", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "resolve" }),
      });
      
      if (res.ok) {
        setActiveDisaster(null);
        alert("Emergency Resolved.");
      }
    } catch (error) {
      console.error("Error resolving disaster:", error);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/admin/stats");
      if (res.ok) setStats(await res.json());
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBloodBanks = async () => {
    const res = await fetch("/api/bloodbanks");
    if (res.ok) setBloodBanks(await res.json());
  };

  const getRangeQuery = () => (dataRange === '30d' ? 'days=30' : 'range=all');

  const fetchAppointments = async () => {
    const res = await fetch(`/api/appointments?${getRangeQuery()}`);
    if (res.ok) setAppointments(await res.json());
  };

  const fetchUsers = async () => {
    const res = await fetch("/api/admin/users");
    if (res.ok) setUsers(await res.json());
  };

  const fetchRequests = async () => {
    const res = await fetch(`/api/requests?${getRangeQuery()}`);
    if (res.ok) setRequests(await res.json());
  };

  const fetchCamps = async () => {
    const res = await fetch(`/api/camps?${getRangeQuery()}`);
    if (res.ok) setCamps(await res.json());
  };

  const fetchVolunteers = async () => {
    const res = await fetch(`/api/admin/volunteers?${getRangeQuery()}`);
    if (res.ok) setVolunteers(await res.json());
  };

  const fetchFeedbacks = async () => {
    const res = await fetch(`/api/feedback?all=true&${getRangeQuery()}`);
    if (res.ok) setFeedbacks(await res.json());
  };

  const fetchAuditLogs = async () => {
    const res = await fetch(`/api/admin/audit-logs?${getRangeQuery()}`);
    if (res.ok) setAuditLogs(await res.json());
  };

  const handleAddBank = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/bloodbanks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newBank),
      });
      if (res.ok) {
        setShowAddBank(false);
        fetchBloodBanks();
        alert("Blood Bank added successfully");
      } else {
        alert("Failed to add Blood Bank");
      }
    } catch (error) {
      console.error("Error adding bank:", error);
    }
  };

  const handleDeleteBank = async (id: string) => {
    if (!confirm("Are you sure you want to delete this blood bank?")) return;
    try {
      const res = await fetch(`/api/bloodbanks/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchBloodBanks();
      } else {
        alert("Failed to delete blood bank");
      }
    } catch (error) {
      console.error("Error deleting bank:", error);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchUsers();
      } else {
        const data = await res.json();
        alert(data.message || "Failed to delete user");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const updateAppointmentStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        fetchAppointments();
      }
    } catch (error) {
      console.error("Error updating appointment:", error);
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
        fetchAppointments();
      }
    } catch (error) {
      console.error("Error updating tracking status:", error);
    }
  };

  const updateRequestStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/requests/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        fetchRequests();
      }
    } catch (error) {
      console.error("Error updating request:", error);
    }
  };

  const updateCampStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/admin/camps/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        fetchCamps();
      }
    } catch (error) {
      console.error("Error updating camp:", error);
    }
  };

  const updateVolunteerStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/admin/volunteers/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        fetchVolunteers();
      }
    } catch (error) {
      console.error("Error updating volunteer:", error);
    }
  };

  const deleteVolunteer = async (id: string) => {
    if (!confirm("Are you sure you want to delete this application?")) return;
    try {
      const res = await fetch(`/api/admin/volunteers/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchVolunteers();
      }
    } catch (error) {
      console.error("Error deleting volunteer:", error);
    }
  };

  const handleLinkUserToBank = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || selectedBankIds.length === 0) return;

    try {
      const res = await fetch(`/api/admin/users/${selectedUser._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          hospitalIds: selectedBankIds,
          // For backward compatibility, set the first one as primary
          hospitalId: selectedBankIds[0] 
        }),
      });

      if (res.ok) {
        alert("User linked to Blood Bank(s) successfully");
        setShowLinkModal(false);
        setSelectedUser(null);
        setSelectedBankIds([]);
        fetchUsers();
      } else {
        alert("Failed to link user");
      }
    } catch (error) {
      console.error("Error linking user:", error);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading dashboard...</div>;
  if (status === "unauthenticated") return null;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 space-y-6"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600">Welcome back, {session?.user?.name}</p>
            </div>
            
            {/* Disaster Mode Toggle */}
            <div className="flex items-center gap-4">
              {activeDisaster ? (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleResolveDisaster}
                  className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-full font-bold shadow-lg animate-pulse"
                >
                  <Check className="w-5 h-5" />
                  Resolve Emergency
                </motion.button>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowDisasterModal(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-full font-bold shadow-lg hover:bg-red-700 transition-colors"
                >
                  <Siren className="w-5 h-5" />
                  Activate Disaster Mode
                </motion.button>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-4 overflow-x-auto">
            {["overview", "emergencies", "bloodbanks", "appointments", "requests", "camps", "users", "volunteers", "feedback", "audit logs"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`relative px-4 py-2 rounded-md text-sm font-medium capitalize transition-colors whitespace-nowrap ${
                  activeTab === tab
                    ? "text-white"
                    : "bg-white text-gray-700 hover:bg-gray-100"
                }`}
              >
                {activeTab === tab && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-red-600 rounded-md"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10 flex items-center">
                  {tab === 'emergencies' ? (
                    <>
                      <AlertTriangle className="h-4 w-4 mr-1" />
                      SOS
                    </>
                  ) : tab === 'feedback' ? (
                    <>
                      <MessageSquare className="h-4 w-4 mr-1" />
                      Feedback
                    </>
                  ) : tab}
                </span>
              </button>
            ))}
          </div>

          {[
            "appointments",
            "requests",
            "camps",
            "volunteers",
            "feedback",
            "audit logs"
          ].includes(activeTab) && (
            <div className="flex items-center justify-between bg-white border border-gray-200 rounded-lg p-3">
              <p className="text-sm text-gray-600">
                Showing <span className="font-semibold">{dataRange === '30d' ? 'last 30 days' : 'all available data'}</span>
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setDataRange('30d')}
                  className={`px-3 py-1.5 rounded text-sm font-medium ${
                    dataRange === '30d'
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Last 30 days
                </button>
                <button
                  onClick={() => setDataRange('all')}
                  className={`px-3 py-1.5 rounded text-sm font-medium ${
                    dataRange === 'all'
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Fetch all from DB
                </button>
              </div>
            </div>
          )}
        </motion.div>

        <AnimatePresence mode="wait">
          {activeTab === "overview" && stats && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
            >
              {[
                { title: "Total Donors", icon: Users, value: stats.totalDonors, color: "text-blue-500" },
                { title: "Blood Banks", icon: MapPin, value: stats.totalBloodBanks, color: "text-red-500" },
                { title: "Appointments", icon: Calendar, value: stats.totalAppointments, sub: `${stats.pendingAppointments} pending`, color: "text-orange-500" },
                { title: "Requests", icon: Activity, value: stats.totalRequests, color: "text-yellow-500" }
              ].map((stat, index) => (
                <motion.div 
                  key={stat.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                  className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-gray-500 text-sm font-medium">{stat.title}</h3>
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                  <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
                  {stat.sub && <p className="text-sm text-gray-500 mt-2">{stat.sub}</p>}
                </motion.div>
              ))}
            </motion.div>
          )}

          {activeTab === "emergencies" && (
            <motion.div
              key="emergencies"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <EmergencyAlertsList />
            </motion.div>
          )}

          {activeTab === "bloodbanks" && (
            <motion.div
              key="bloodbanks"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
            >
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900">Blood Banks Management</h2>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowAddBank(!showAddBank)}
                  className="flex items-center px-3 py-2 bg-red-600 text-white rounded-md text-sm hover:bg-red-700"
                >
                  <Plus className="h-4 w-4 mr-2" /> Add New
                </motion.button>
              </div>
              
              <AnimatePresence>
                {showAddBank && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-6 bg-gray-50 border-b border-gray-100">
                      <form onSubmit={handleAddBank} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                          placeholder="Name"
                          className="p-2 border rounded"
                          value={newBank.name}
                          onChange={(e) => setNewBank({...newBank, name: e.target.value})}
                          required
                        />
                        <input
                          placeholder="Email"
                          className="p-2 border rounded"
                          value={newBank.email}
                          onChange={(e) => setNewBank({...newBank, email: e.target.value})}
                          required
                        />
                        <input
                          placeholder="Phone"
                          className="p-2 border rounded"
                          value={newBank.phone}
                          onChange={(e) => setNewBank({...newBank, phone: e.target.value})}
                          required
                        />
                        <input
                          placeholder="City"
                          className="p-2 border rounded"
                          value={newBank.address.city}
                          onChange={(e) => setNewBank({...newBank, address: {...newBank.address, city: e.target.value}})}
                          required
                        />
                        <input
                          placeholder="State"
                          className="p-2 border rounded"
                          value={newBank.address.state}
                          onChange={(e) => setNewBank({...newBank, address: {...newBank.address, state: e.target.value}})}
                          required
                        />
                        <div className="md:col-span-2">
                          <LocationPicker 
                            onLocationChange={(lat, lng) => {
                              setNewBank({
                                ...newBank, 
                                location: { type: 'Point', coordinates: [lng, lat] }
                              });
                            }}
                            initialLat={newBank.location.coordinates[1] || 28.7041}
                            initialLng={newBank.location.coordinates[0] || 77.1025}
                          />
                        </div>
                        <div className="md:col-span-2 flex justify-end space-x-2">
                          <button type="button" onClick={() => setShowAddBank(false)} className="px-4 py-2 text-gray-600">Cancel</button>
                          <button type="submit" className="px-4 py-2 bg-red-600 text-white rounded">Save</button>
                        </div>
                      </form>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {bloodBanks.map((bank) => (
                      <tr key={bank._id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{bank.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{bank.address?.city}, {bank.address?.state}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{bank.phone}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            bank.status === 'Active' ? 'bg-green-100 text-green-800' : 
                            bank.status === 'Inactive' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {bank.status || 'Active'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button onClick={() => handleDeleteBank(bank._id)} className="text-red-600 hover:text-red-900"><Trash2 className="h-5 w-5" /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {activeTab === "appointments" && (
            <motion.div
              key="appointments"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
            >
              <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
                <div className="flex items-center space-x-4">
                  <h2 className="text-lg font-semibold text-gray-900 px-2">Donation Appointments</h2>
                  <button 
                    onClick={() => exportToCSV(appointments, 'appointments')}
                    className="flex items-center space-x-1 text-sm text-gray-600 hover:text-red-600 transition-colors"
                  >
                    <Download className="h-4 w-4" />
                    <span>Export</span>
                  </button>
                </div>
                <div className="flex space-x-2 bg-gray-50 p-1 rounded-lg">
                  {(['pending', 'upcoming', 'completed'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setAppointmentTab(tab)}
                      className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                        appointmentTab === tab
                          ? 'bg-white text-gray-900 shadow border-gray-200'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Donor</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Blood Bank</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tracking</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredAppointments.map((apt) => (
                      <tr key={apt._id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {apt.donor?.name || "Unknown"}
                          <div className="text-xs text-gray-500">{apt.donor?.bloodGroup}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{apt.bloodBank?.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(apt.date).toLocaleDateString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${apt.status === 'confirmed' ? 'bg-green-100 text-green-800' : 
                              apt.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
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
                              <button onClick={() => updateAppointmentStatus(apt._id, 'confirmed')} className="text-green-600 hover:text-green-900"><Check className="h-5 w-5" /></button>
                              <button onClick={() => updateAppointmentStatus(apt._id, 'cancelled')} className="text-red-600 hover:text-red-900"><X className="h-5 w-5" /></button>
                            </>
                          )}
                          {apt.status === 'confirmed' && (
                            <button onClick={() => updateAppointmentStatus(apt._id, 'completed')} className="text-blue-600 hover:text-blue-900">Complete</button>
                          )}
                        </td>
                      </tr>
                    ))}
                    {filteredAppointments.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                          No {appointmentTab} appointments found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {activeTab === "requests" && (
            <motion.div
              key="requests"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
            >
              <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
                <div className="flex items-center space-x-4">
                  <h2 className="text-lg font-semibold text-gray-900 px-2">Blood Requests</h2>
                  <button 
                    onClick={() => exportToCSV(requests, 'blood_requests')}
                    className="flex items-center space-x-1 text-sm text-gray-600 hover:text-red-600 transition-colors"
                  >
                    <Download className="h-4 w-4" />
                    <span>Export</span>
                  </button>
                </div>
                <div className="flex space-x-2 bg-gray-50 p-1 rounded-lg">
                  {(['pending', 'approved', 'fulfilled', 'rejected'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setRequestTab(tab)}
                      className={`px-4 py-2 text-sm font-medium rounded-md transition-colors capitalize ${
                        requestTab === tab
                          ? 'bg-white text-gray-900 shadow border-gray-200'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Blood Group</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Units</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hospital</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredRequests.map((req) => (
                      <tr key={req._id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{req.patientName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{req.bloodGroup}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{req.units}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{req.hospitalName}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${req.status === 'approved' ? 'bg-green-100 text-green-800' : 
                              req.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                              req.status === 'rejected' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'}`}>
                            {req.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          {req.status === 'pending' && (
                            <>
                              <button onClick={() => updateRequestStatus(req._id, 'approved')} className="text-green-600 hover:text-green-900"><Check className="h-5 w-5" /></button>
                              <button onClick={() => updateRequestStatus(req._id, 'rejected')} className="text-red-600 hover:text-red-900"><X className="h-5 w-5" /></button>
                            </>
                          )}
                          {req.status === 'approved' && (
                            <button onClick={() => updateRequestStatus(req._id, 'fulfilled')} className="text-blue-600 hover:text-blue-900">Mark Fulfilled</button>
                          )}
                        </td>
                      </tr>
                    ))}
                    {filteredRequests.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                          No {requestTab} requests found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {activeTab === "camps" && (
              <motion.div
                key="camps"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
              >
                <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
                  <div className="flex items-center space-x-4">
                    <h2 className="text-lg font-semibold text-gray-900 px-2">Camp Requests</h2>
                    <button 
                      onClick={() => exportToCSV(camps, 'blood_camps')}
                      className="flex items-center space-x-1 text-sm text-gray-600 hover:text-red-600 transition-colors"
                    >
                      <Download className="h-4 w-4" />
                      <span>Export</span>
                    </button>
                  </div>
                  <div className="flex space-x-2 bg-gray-50 p-1 rounded-lg overflow-x-auto">
                    {(['pending', 'approved', 'rejected', 'completed'] as const).map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setCampTab(tab)}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors capitalize ${
                          campTab === tab
                            ? 'bg-white text-gray-900 shadow border-gray-200'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Organizer</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Venue</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expected</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredCamps.map((camp) => (
                        <tr key={camp._id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{camp.organizerName}</div>
                            <div className="text-sm text-gray-500">{camp.organizationName}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{camp.phone}</div>
                            <div className="text-sm text-gray-500">{camp.email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{new Date(camp.proposedDate).toLocaleDateString()}</div>
                            <div className="text-sm text-gray-500">{camp.city}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {camp.expectedDonors}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                              ${camp.status === 'approved' ? 'bg-green-100 text-green-800' : 
                                camp.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                                camp.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-gray-800'}`}>
                              {camp.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                            {camp.status === 'pending' && (
                              <>
                                <button onClick={() => updateCampStatus(camp._id, 'approved')} className="text-green-600 hover:text-green-900"><Check className="h-5 w-5" /></button>
                                <button onClick={() => updateCampStatus(camp._id, 'rejected')} className="text-red-600 hover:text-red-900"><X className="h-5 w-5" /></button>
                              </>
                            )}
                            {camp.status === 'approved' && (
                              <button onClick={() => updateCampStatus(camp._id, 'completed')} className="text-blue-600 hover:text-blue-900">Mark Completed</button>
                            )}
                          </td>
                        </tr>
                      ))}
                      {filteredCamps.length === 0 && (
                        <tr>
                          <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                            No {campTab} camps found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

          {activeTab === "users" && (
              <motion.div
                key="users"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
              >
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-gray-900">Registered Users</h2>
                <button 
                  onClick={() => exportToCSV(users, 'users')}
                  className="flex items-center space-x-1 text-sm text-gray-600 hover:text-red-600 transition-colors"
                >
                  <Download className="h-4 w-4" />
                  <span>Export</span>
                </button>
              </div>

                <div className="px-6 py-4 border-b border-gray-100">
                  <div className="flex gap-2 bg-gray-50 p-1 rounded-lg overflow-x-auto w-max max-w-full">
                    {(['all', 'admin', 'donor', 'recipient', 'hospital'] as const).map((role) => (
                      <button
                        key={role}
                        onClick={() => setUserRoleTab(role)}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors capitalize whitespace-nowrap ${
                          userRoleTab === role
                            ? 'bg-white text-gray-900 shadow border-gray-200'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        {role}
                        <span className="ml-2 text-xs text-gray-400">
                          ({role === 'all' ? users.length : users.filter((u) => u.role === role).length})
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              
              <AnimatePresence>
                {showLinkModal && (
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
                      className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full"
                    >
                      <h3 className="text-lg font-bold mb-4">Link {selectedUser?.name} to Blood Banks</h3>
                      <form onSubmit={handleLinkUserToBank}>
                        <div className="mb-4 max-h-60 overflow-y-auto">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Select Blood Banks</label>
                          <div className="space-y-2">
                            {bloodBanks.map(bank => (
                              <label key={bank._id} className="flex items-center space-x-2 p-2 border rounded hover:bg-gray-50 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={selectedBankIds.includes(bank._id)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedBankIds([...selectedBankIds, bank._id]);
                                    } else {
                                      setSelectedBankIds(selectedBankIds.filter(id => id !== bank._id));
                                    }
                                  }}
                                  className="rounded text-red-600 focus:ring-red-500"
                                />
                                <span className="text-sm text-gray-700">{bank.name} ({bank.address?.city})</span>
                              </label>
                            ))}
                          </div>
                        </div>
                        <div className="flex justify-end space-x-2 pt-4 border-t">
                          <button
                            type="button"
                            onClick={() => setShowLinkModal(false)}
                            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                            disabled={selectedBankIds.length === 0}
                          >
                            Link Banks ({selectedBankIds.length})
                          </button>
                        </div>
                      </form>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Blood Group</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredUsers.map((user) => (
                      <tr key={user._id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {user.name}
                          <div className="text-xs text-gray-500">{user._id}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                          {user.role}
                          {(user.hospitalIds?.length > 0 || user.hospitalId) && (
                            <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                              Linked ({user.hospitalIds?.length || 1})
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.bloodGroup || "-"}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          {user.role === 'hospital' && (
                            <button 
                              onClick={() => {
                                setSelectedUser(user);
                                // Initialize with existing linked banks
                                const existingIds = user.hospitalIds || (user.hospitalId ? [user.hospitalId] : []);
                                setSelectedBankIds(existingIds);
                                setShowLinkModal(true);
                                // Ensure blood banks are loaded
                                if (bloodBanks.length === 0) fetchBloodBanks();
                              }}
                              className="text-blue-600 hover:text-blue-900"
                              title="Link to Blood Bank"
                            >
                              <MapPin className="h-5 w-5" />
                            </button>
                          )}
                          {user.role !== 'admin' && (
                            <button onClick={() => handleDeleteUser(user._id)} className="text-red-600 hover:text-red-900"><Trash2 className="h-5 w-5" /></button>
                          )}
                        </td>
                      </tr>
                    ))}
                    {filteredUsers.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                          No users found for role: <span className="capitalize">{userRoleTab}</span>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {activeTab === "volunteers" && (
            <motion.div
              key="volunteers"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
            >
              <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
                <div className="flex items-center space-x-4">
                  <h2 className="text-lg font-semibold text-gray-900 px-2">Volunteer Applications</h2>
                  <button 
                    onClick={() => exportToCSV(volunteers, 'volunteers')}
                    className="flex items-center space-x-1 text-sm text-gray-600 hover:text-red-600 transition-colors"
                  >
                    <Download className="h-4 w-4" />
                    <span>Export</span>
                  </button>
                </div>
                <div className="flex space-x-2 bg-gray-50 p-1 rounded-lg">
                  {(['pending', 'approved', 'rejected'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setVolunteerTab(tab)}
                      className={`px-4 py-2 text-sm font-medium rounded-md transition-colors capitalize ${
                        volunteerTab === tab
                          ? 'bg-white text-gray-900 shadow border-gray-200'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredVolunteers.map((vol) => (
                      <tr key={vol._id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {vol.name}
                          <div className="text-xs text-gray-500">{new Date(vol.createdAt).toLocaleDateString()}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div>{vol.email}</div>
                          <div className="text-xs">{vol.phone}</div>
                          <div className="text-xs">{vol.address}</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate" title={vol.reason}>
                          {vol.reason}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${vol.status === 'approved' ? 'bg-green-100 text-green-800' : 
                              vol.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                              vol.status === 'rejected' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'}`}>
                            {vol.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          {vol.status === 'pending' && (
                            <>
                              <button onClick={() => updateVolunteerStatus(vol._id, 'approved')} className="text-green-600 hover:text-green-900" title="Approve"><Check className="h-5 w-5" /></button>
                              <button onClick={() => updateVolunteerStatus(vol._id, 'rejected')} className="text-red-600 hover:text-red-900" title="Reject"><X className="h-5 w-5" /></button>
                            </>
                          )}
                          <button onClick={() => deleteVolunteer(vol._id)} className="text-gray-600 hover:text-gray-900" title="Delete"><Trash2 className="h-5 w-5" /></button>
                        </td>
                      </tr>
                    ))}
                    {filteredVolunteers.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                          No {volunteerTab} applications found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {activeTab === "feedback" && (
            <motion.div
              key="feedback"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Feedback Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Total Feedback</p>
                      <p className="text-2xl font-bold text-gray-900">{feedbacks.length}</p>
                    </div>
                    <MessageSquare className="h-8 w-8 text-blue-500" />
                  </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Avg Rating</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {feedbacks.length > 0 
                          ? (feedbacks.reduce((sum: number, f: any) => sum + f.rating, 0) / feedbacks.length).toFixed(1)
                          : '0'}/5
                      </p>
                    </div>
                    <Star className="h-8 w-8 text-yellow-500" />
                  </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Would Recommend</p>
                      <p className="text-2xl font-bold text-green-600">
                        {feedbacks.length > 0 
                          ? Math.round((feedbacks.filter((f: any) => f.wouldRecommend).length / feedbacks.length) * 100)
                          : 0}%
                      </p>
                    </div>
                    <Check className="h-8 w-8 text-green-500" />
                  </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Excellent Reviews</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {feedbacks.filter((f: any) => f.experience === 'excellent').length}
                      </p>
                    </div>
                    <Activity className="h-8 w-8 text-purple-500" />
                  </div>
                </div>
              </div>

              {/* Feedback List */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-red-500" />
                    Donor Feedback
                  </h2>
                </div>
                <div className="divide-y divide-gray-100">
                  {feedbacks.map((feedback: any) => (
                    <div key={feedback._id} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                              <span className="text-red-600 font-bold">
                                {feedback.donor?.name?.charAt(0) || 'D'}
                              </span>
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">{feedback.donor?.name || 'Anonymous'}</p>
                              <p className="text-sm text-gray-500">{feedback.donor?.email}</p>
                            </div>
                          </div>
                          
                          <div className="ml-13 space-y-2">
                            <div className="flex items-center gap-4 flex-wrap">
                              <div className="flex items-center">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className={`h-5 w-5 ${star <= feedback.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                                  />
                                ))}
                                <span className="ml-2 text-sm text-gray-600">({feedback.rating}/5)</span>
                              </div>
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                                feedback.experience === 'excellent' ? 'bg-green-100 text-green-800' :
                                feedback.experience === 'good' ? 'bg-lime-100 text-lime-800' :
                                feedback.experience === 'average' ? 'bg-yellow-100 text-yellow-800' :
                                feedback.experience === 'poor' ? 'bg-orange-100 text-orange-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {feedback.experience}
                              </span>
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                feedback.wouldRecommend ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {feedback.wouldRecommend ? '👍 Recommends' : '👎 Doesn\'t Recommend'}
                              </span>
                            </div>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                              <div className="bg-gray-50 p-2 rounded">
                                <span className="text-gray-500">Staff: </span>
                                <span className="font-medium">{feedback.staffBehavior}/5</span>
                              </div>
                              <div className="bg-gray-50 p-2 rounded">
                                <span className="text-gray-500">Cleanliness: </span>
                                <span className="font-medium">{feedback.cleanliness}/5</span>
                              </div>
                              <div className="bg-gray-50 p-2 rounded">
                                <span className="text-gray-500">Wait Time: </span>
                                <span className="font-medium capitalize">{feedback.waitTime?.replace('-', ' ')}</span>
                              </div>
                              <div className="bg-gray-50 p-2 rounded">
                                <span className="text-gray-500">Blood Bank: </span>
                                <span className="font-medium">{feedback.appointment?.bloodBank?.name || 'N/A'}</span>
                              </div>
                            </div>

                            {feedback.comments && (
                              <div className="bg-blue-50 p-3 rounded-lg">
                                <p className="text-sm text-gray-600"><strong>Comments:</strong> {feedback.comments}</p>
                              </div>
                            )}
                            
                            {feedback.suggestions && (
                              <div className="bg-yellow-50 p-3 rounded-lg">
                                <p className="text-sm text-gray-600"><strong>Suggestions:</strong> {feedback.suggestions}</p>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="text-right text-sm text-gray-500">
                          <p>{new Date(feedback.createdAt).toLocaleDateString('en-IN', { 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric' 
                          })}</p>
                          <p className="text-xs">{new Date(feedback.createdAt).toLocaleTimeString('en-IN', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {feedbacks.length === 0 && (
                    <div className="p-12 text-center text-gray-500">
                      <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No feedback received yet</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "audit logs" && (
            <motion.div
              key="audit logs"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
            >
              <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between">
                <div className="flex items-center space-x-4">
                  <h2 className="text-lg font-semibold text-gray-900 px-2 flex items-center">
                    <Activity className="h-5 w-5 mr-2 text-blue-600" />
                    Security & Audit Logs
                  </h2>
                  <button 
                    onClick={() => exportToCSV(auditLogs, 'audit_logs')}
                    className="flex items-center space-x-1 text-sm text-gray-600 hover:text-red-600 transition-colors"
                  >
                    <Download className="h-4 w-4" />
                    <span>Export</span>
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entity</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Performed By</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Changes</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IP Address</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200 text-sm">
                    {auditLogs.map((log) => (
                      <tr key={log._id || log.timestamp} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                          {new Date(log.timestamp).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                            {log.action}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                          {log.entityType}
                          <div className="text-xs text-gray-400 truncate max-w-[120px]" title={log.entityId}>
                            {log.entityId}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {log.performedBy ? (
                            <div>
                              <div className="text-gray-900">{log.performedBy.name}</div>
                              <div className="text-gray-500 text-xs uppercase">{log.performedByRole}</div>
                            </div>
                          ) : (
                            <span className="text-gray-400">System</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-wrap text-xs text-gray-500 max-w-xs">
                          {log.action === 'STATUS_CHANGED' && log.newState?.status && (
                            <div className="flex items-center space-x-2">
                              <span className="text-red-500 line-through">{log.previousState?.status || 'none'}</span>
                              <span>→</span>
                              <span className="text-green-600 font-medium">{log.newState?.status}</span>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-400 font-mono text-xs text-right">
                          {log.ipAddress || 'unknown'}
                        </td>
                      </tr>
                    ))}
                    {auditLogs.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                          No audit logs found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* Disaster Mode Modal */}
      {showDisasterModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden"
          >
            <div className="bg-red-600 p-6 text-white">
              <div className="flex items-center gap-3 mb-2">
                <Siren className="w-8 h-8 animate-pulse" />
                <h2 className="text-2xl font-bold">Activate Disaster Mode</h2>
              </div>
              <p className="text-red-100">This will trigger a system-wide alert to all users.</p>
            </div>
            
            <form onSubmit={handleDisasterSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Event Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Train Accident at Central Station"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  value={disasterData.title}
                  onChange={(e) => setDisasterData({...disasterData, title: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description & Instructions</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Describe the situation and what donors should do..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  value={disasterData.description}
                  onChange={(e) => setDisasterData({...disasterData, description: e.target.value})}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input
                    type="text"
                    required
                    placeholder="City or Area"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    value={disasterData.location}
                    onChange={(e) => setDisasterData({...disasterData, location: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Radius (km)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    value={disasterData.radius}
                    onChange={(e) => setDisasterData({...disasterData, radius: parseInt(e.target.value)})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Required Blood Groups</label>
                <div className="flex flex-wrap gap-2">
                  {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(bg => (
                    <button
                      key={bg}
                      type="button"
                      onClick={() => {
                        const current = disasterData.requiredBloodGroups;
                        const updated = current.includes(bg)
                          ? current.filter(g => g !== bg)
                          : [...current, bg];
                        setDisasterData({...disasterData, requiredBloodGroups: updated});
                      }}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                        disasterData.requiredBloodGroups.includes(bg)
                          ? "bg-red-600 text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {bg}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowDisasterModal(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 shadow-lg flex items-center gap-2"
                >
                  <Megaphone className="w-4 h-4" />
                  Broadcast Alert
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
