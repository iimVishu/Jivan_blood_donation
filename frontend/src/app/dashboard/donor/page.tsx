"use client";

import { useSession } from "next-auth/react";
import { Calendar, Clock, Droplet, History, Award, Download, Activity, Sparkles, CheckCircle, Bell, Trophy, MessageSquare } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import Certificate from "@/components/Certificate";
import DigitalDonorCard from "@/components/DigitalDonorCard";
import BloodJourneyTracker from "@/components/BloodJourneyTracker";
import BadgesDisplay from "@/components/BadgesDisplay";
import DonationReminders from "@/components/DonationReminders";
import FeedbackModal from "@/components/FeedbackModal";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

interface Appointment {
  _id: string;
  date: string;
  status: string;
  trackingStatus?: 'collected' | 'testing' | 'processing' | 'ready' | 'transfused';
  feedbackSubmitted?: boolean;
  bloodBank: {
    name: string;
    address: {
      city: string;
      state: string;
    };
  };
  healthStats?: {
    bloodPressure: string;
    hemoglobin: string;
    weight: string;
    pulse: string;
    temperature: string;
  };
}

export default function DonorDashboard() {
  const { data: session } = useSession();
  const certificateRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [certificateDate, setCertificateDate] = useState("");
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'health' | 'card' | 'badges' | 'reminders'>('overview');
  const [insights, setInsights] = useState<Record<string, string>>({});
  const [loadingInsight, setLoadingInsight] = useState<string | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [feedbackModal, setFeedbackModal] = useState<{
    isOpen: boolean;
    appointmentId: string;
    bloodBankName: string;
    donationDate: string;
  }>({ isOpen: false, appointmentId: '', bloodBankName: '', donationDate: '' });
  const [pendingFeedbackAppointment, setPendingFeedbackAppointment] = useState<Appointment | null>(null);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const res = await fetch("/api/appointments");
        if (res.ok) {
          const data = await res.json();
          setAppointments(data);
          
          // Check for completed donations without feedback
          const needsFeedback = data.find(
            (apt: Appointment) => apt.status === 'completed' && !apt.feedbackSubmitted
          );
          if (needsFeedback) {
            setPendingFeedbackAppointment(needsFeedback);
            setFeedbackModal({
              isOpen: true,
              appointmentId: needsFeedback._id,
              bloodBankName: needsFeedback.bloodBank?.name || 'Blood Bank',
              donationDate: needsFeedback.date
            });
          }
        }
      } catch (error) {
        console.error("Failed to fetch appointments", error);
      }
    };

    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/profile");
        if (res.ok) {
          const data = await res.json();
          setProfile(data);
        }
      } catch (error) {
        console.error("Failed to fetch profile", error);
      }
    };

    if (session) {
      fetchAppointments();
      fetchProfile();
    }
  }, [session]);

  const handleFeedbackSuccess = async () => {
    // Refresh appointments to update feedbackSubmitted status
    try {
      const res = await fetch("/api/appointments");
      if (res.ok) {
        const data = await res.json();
        setAppointments(data);
        setPendingFeedbackAppointment(null);
      }
    } catch (error) {
      console.error("Failed to refresh appointments", error);
    }
  };

  const openFeedbackModal = (appointment: Appointment) => {
    setFeedbackModal({
      isOpen: true,
      appointmentId: appointment._id,
      bloodBankName: appointment.bloodBank?.name || 'Blood Bank',
      donationDate: appointment.date
    });
  };

  const downloadCertificate = async (date: string) => {
    setCertificateDate(new Date(date).toLocaleDateString());
    // Wait for state to update and render
    setTimeout(async () => {
      if (!certificateRef.current) return;
      setIsGenerating(true);

      try {
        const canvas = await html2canvas(certificateRef.current, {
          scale: 2, // Higher quality
          logging: false,
          useCORS: true,
          backgroundColor: '#ffffff'
        } as any);

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
          orientation: 'landscape',
          unit: 'px',
          format: [canvas.width, canvas.height]
        });

        pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
        pdf.save(`Jeevan-Certificate-${new Date(date).toISOString().split('T')[0]}.pdf`);
      } catch (error) {
        console.error("Error generating certificate:", error);
      } finally {
        setIsGenerating(false);
      }
    }, 100);
  };

  const getHealthInsight = async (apt: Appointment) => {
    if (!apt.healthStats) return;
    
    setLoadingInsight(apt._id);
    try {
      const res = await fetch("/api/ai/health-insight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hemoglobin: apt.healthStats.hemoglobin,
          bloodPressure: apt.healthStats.bloodPressure,
          weight: apt.healthStats.weight,
          pulse: apt.healthStats.pulse
        }),
      });
      
      const data = await res.json();
      if (data.insight) {
        setInsights(prev => ({ ...prev, [apt._id]: data.insight }));
      }
    } catch (error) {
      console.error("Failed to get insight", error);
    } finally {
      setLoadingInsight(null);
    }
  };

  const upcomingAppointments = appointments.filter(a => new Date(a.date) > new Date() && a.status !== 'cancelled' && a.status !== 'completed');
  const completedAppointments = appointments.filter(a => a.status === 'completed');
  const lastDonation = completedAppointments.length > 0 ? new Date(completedAppointments[completedAppointments.length - 1].date).toLocaleDateString() : "--";

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Welcome back, {session?.user?.name}</h1>
            <p className="text-gray-600">Here's your donation overview</p>
          </div>
          <div className="flex space-x-3">
            <div className="bg-white rounded-lg p-1 flex border border-gray-200">
              {['overview', 'health', 'card', 'badges', 'reminders'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`relative px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeTab === tab ? 'text-red-700' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {activeTab === tab && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-red-50 rounded-md"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <span className="relative z-10 capitalize">
                    {tab === 'card' ? 'Digital ID' : tab === 'health' ? 'Health Card' : tab === 'badges' ? 'Badges' : tab === 'reminders' ? 'Reminders' : tab}
                  </span>
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link 
                  href="/donate" 
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  Schedule Donation
                </Link>
              </motion.div>
            </div>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {activeTab === 'overview' ? (
            <motion.div
              key="overview"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {[
                  { title: "Total Donations", icon: Droplet, value: completedAppointments.length, sub: "You're a hero!", color: "text-red-500" },
                  { title: "Last Donation", icon: History, value: lastDonation, sub: "", color: "text-blue-500" },
                  { title: "Next Eligible Date", icon: Calendar, value: "Today", sub: "You can donate now!", color: "text-green-500" }
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
                    {stat.sub && <p className="text-sm text-green-600 mt-2">{stat.sub}</p>}
                  </motion.div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Upcoming Appointments */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
                >
                  <div className="p-6 border-b border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-900">Upcoming Appointments</h2>
                  </div>
                  <div className="p-6">
                    {upcomingAppointments.length > 0 ? (
                      <div className="space-y-4">
                        {upcomingAppointments.map((appointment) => (
                          <motion.div 
                            key={appointment._id} 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg"
                          >
                            <div className="bg-red-100 p-2 rounded-full">
                              <Calendar className="h-5 w-5 text-red-600" />
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">{new Date(appointment.date).toLocaleDateString()}</h4>
                              <p className="text-sm text-gray-600">{appointment.bloodBank?.name}</p>
                              <p className="text-xs text-gray-500">{appointment.bloodBank?.address?.city}, {appointment.bloodBank?.address?.state}</p>
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 mt-2">
                                {appointment.status}
                              </span>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Calendar className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                        <p>No upcoming appointments</p>
                        <Link href="/donate" className="text-red-600 hover:text-red-700 font-medium mt-2 inline-block">
                          Book an appointment
                        </Link>
                      </div>
                    )}
                  </div>
                </motion.div>

                {/* Donation History */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
                >
                  <div className="p-6 border-b border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-900">Donation History</h2>
                  </div>
                  <div className="p-6">
                    {completedAppointments.length > 0 ? (
                      <div className="space-y-4">
                        {completedAppointments.map((appointment, index) => (
                          <motion.div 
                            key={appointment._id} 
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={`bg-gray-50 rounded-lg p-4 ${!appointment.feedbackSubmitted ? 'ring-2 ring-orange-400 ring-offset-2' : ''}`}
                          >
                            {/* Feedback Required Banner */}
                            {!appointment.feedbackSubmitted && (
                              <div className="mb-3 p-2 bg-orange-50 border border-orange-200 rounded-lg flex items-center justify-between">
                                <div className="flex items-center text-orange-700 text-sm">
                                  <MessageSquare className="h-4 w-4 mr-2" />
                                  <span className="font-medium">Feedback required for this donation</span>
                                </div>
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => openFeedbackModal(appointment)}
                                  className="px-3 py-1 bg-orange-500 text-white text-xs font-medium rounded-md hover:bg-orange-600"
                                >
                                  Give Feedback
                                </motion.button>
                              </div>
                            )}
                            
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center space-x-4">
                                <div className="bg-green-100 p-2 rounded-full">
                                  <CheckCircle className="h-5 w-5 text-green-600" />
                                </div>
                                <div>
                                  <h4 className="font-medium text-gray-900">{new Date(appointment.date).toLocaleDateString()}</h4>
                                  <p className="text-sm text-gray-600">{appointment.bloodBank?.name}</p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                {appointment.feedbackSubmitted && (
                                  <span className="flex items-center text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Feedback Given
                                  </span>
                                )}
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => downloadCertificate(appointment.date)}
                                  disabled={isGenerating}
                                  className="flex items-center space-x-2 px-3 py-1.5 bg-white border border-gray-200 text-gray-700 rounded-md hover:bg-gray-50 text-sm transition-colors"
                                >
                                  <Download className="h-4 w-4" />
                                  <span>Certificate</span>
                                </motion.button>
                              </div>
                            </div>
                            
                            {/* Blood Journey Tracker */}
                            <div className="mt-4 pt-4 border-t border-gray-200">
                              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Blood Journey</p>
                              <BloodJourneyTracker status={appointment.trackingStatus || 'collected'} />
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <History className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                        <p>No donation history found</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              </div>
            </motion.div>
          ) : activeTab === 'health' ? (
            <motion.div
              key="health"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
            >
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900">My Health Card</h2>
                <p className="text-sm text-gray-500">Track your vitals from each donation</p>
              </div>
              <div className="p-6">
                {completedAppointments.length > 0 ? (
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {completedAppointments.map((apt, index) => (
                      <motion.div 
                        key={apt._id} 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
                        className="bg-gray-50 rounded-xl p-6 border border-gray-200 transition-all"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-sm font-medium text-gray-500">{new Date(apt.date).toLocaleDateString()}</span>
                          <span className={`px-2 py-1 text-xs rounded-full font-medium ${apt.healthStats ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                            {apt.healthStats ? 'Recorded' : 'No Data'}
                          </span>
                        </div>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Blood Pressure</span>
                            <span className="font-semibold text-gray-900">{apt.healthStats?.bloodPressure || '--'}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Hemoglobin</span>
                            <span className="font-semibold text-gray-900">{apt.healthStats?.hemoglobin ? `${apt.healthStats.hemoglobin} g/dL` : '--'}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Weight</span>
                            <span className="font-semibold text-gray-900">{apt.healthStats?.weight ? `${apt.healthStats.weight} kg` : '--'}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Pulse</span>
                            <span className="font-semibold text-gray-900">{apt.healthStats?.pulse ? `${apt.healthStats.pulse} bpm` : '--'}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Temperature</span>
                            <span className="font-semibold text-gray-900">{apt.healthStats?.temperature ? `${apt.healthStats.temperature} °C` : '--'}</span>
                          </div>
                        </div>

                        {apt.healthStats && (
                          <div className="mt-6 pt-4 border-t border-gray-100">
                            {!insights[apt._id] ? (
                              <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => getHealthInsight(apt)}
                                disabled={loadingInsight === apt._id}
                                className="w-full flex items-center justify-center space-x-2 py-2 px-4 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors text-sm font-medium"
                              >
                                {loadingInsight === apt._id ? (
                                  <span className="animate-pulse">Analyzing...</span>
                                ) : (
                                  <>
                                    <Sparkles className="h-4 w-4" />
                                    <span>Get AI Health Insight</span>
                                  </>
                                )}
                              </motion.button>
                            ) : (
                              <motion.div 
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                className="bg-purple-50 rounded-lg p-4"
                              >
                                <div className="flex items-start space-x-3">
                                  <Sparkles className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                                  <div>
                                    <h4 className="text-sm font-semibold text-purple-900 mb-1">AI Health Tip</h4>
                                    <p className="text-sm text-purple-800 leading-relaxed">{insights[apt._id]}</p>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="bg-red-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Activity className="h-8 w-8 text-red-500" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">No Health Records Yet</h3>
                    <p className="text-gray-500 mt-2">Complete a donation to see your health stats here.</p>
                  </div>
                )}
              </div>
            </motion.div>
          ) : activeTab === 'card' ? (
            <motion.div
              key="card"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center justify-center py-12"
            >
              <div className="mb-8 text-center">
                <h2 className="text-2xl font-bold text-gray-900">Your Digital Donor ID</h2>
                <p className="text-gray-600 mt-2">Show this card at blood banks for quick verification</p>
              </div>
              
              {profile ? (
                <motion.div 
                  whileHover={{ rotateY: 5, rotateX: 5 }}
                  className="w-full max-w-md perspective-1000"
                >
                  <DigitalDonorCard 
                    user={{
                      name: profile.name,
                      bloodGroup: profile.bloodGroup,
                      id: profile._id,
                      donationCount: profile.donationCount || completedAppointments.length
                    }} 
                  />
                  <div className="mt-8 text-center">
                    <p className="text-sm text-gray-500">
                      This QR code contains your secure donor identification.
                    </p>
                  </div>
                </motion.div>
              ) : (
                <div className="animate-pulse flex flex-col items-center">
                  <div className="h-64 w-96 bg-gray-200 rounded-xl mb-4"></div>
                  <div className="h-4 w-48 bg-gray-200 rounded"></div>
                </div>
              )}
            </motion.div>
          ) : activeTab === 'badges' ? (
            <motion.div
              key="badges"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <BadgesDisplay />
            </motion.div>
          ) : activeTab === 'reminders' ? (
            <motion.div
              key="reminders"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <DonationReminders />
            </motion.div>
          ) : null}
        </AnimatePresence>

        {/* Hidden Certificate Template for Generation */}
        <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
          {certificateDate && (
            <Certificate 
              ref={certificateRef} 
              donorName={session?.user?.name || "Valued Donor"} 
              date={certificateDate} 
            />
          )}
        </div>

        {/* Feedback Modal */}
        <FeedbackModal
          isOpen={feedbackModal.isOpen}
          onClose={() => setFeedbackModal(prev => ({ ...prev, isOpen: false }))}
          appointmentId={feedbackModal.appointmentId}
          bloodBankName={feedbackModal.bloodBankName}
          donationDate={feedbackModal.donationDate}
          onSubmitSuccess={handleFeedbackSuccess}
        />

      </div>
    </div>
  );
}

