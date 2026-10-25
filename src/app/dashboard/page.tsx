"use client";
import API_BASE from "@/lib/api";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Calendar, Clock, Bookmark, MessageSquare, Settings, LogOut, 
  ChevronRight, User, ShieldCheck, Video, Phone, Plus, UserCheck, 
  AlertCircle, Briefcase, Edit3, Check, X, DollarSign, MapPin, Award 
} from "lucide-react";
import { useRouter } from "next/navigation";
import { fetchAPI } from "@/lib/api";

export default function UserDashboard() {
  const [user, setUser] = useState<any>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Lawyer Profile Edit State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [lawyerProfile, setLawyerProfile] = useState<any>(null);
  const [editFormData, setEditFormData] = useState({
    fee_per_hour: 250,
    specialization: "",
    experience_years: 10,
    location: "",
    phone: "",
    qualifications: "",
    about: "",
    languages: "English"
  });
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Lawyer Booking Client State
  const [isBookingClient, setIsBookingClient] = useState(false);
  const [clientsList, setClientsList] = useState<any[]>([]);
  const [bookingFormData, setBookingFormData] = useState({
    client_id: 2,
    date: "2026-11-06",
    time_slot: "10:00 AM",
    consultation_type: "Video Call",
    brief_subject: "Legal Strategy & Contract Review"
  });
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  useEffect(() => {
    const loadDashboard = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const userData = await fetchAPI("/auth/me");
        setUser(userData);

        if (userData?.role === "lawyer") {
          const lId = userData.lawyer_id || 1;
          const lData = await fetchAPI(`/lawyers/${lId}`);
          if (lData) {
            setLawyerProfile(lData);
            setEditFormData({
              fee_per_hour: lData.fee_per_hour || 250,
              specialization: lData.specialization || "Family & Marriage Law",
              experience_years: lData.experience_years || 12,
              location: lData.location || "New York, NY",
              phone: lData.phone || lData.user?.phone || "+1 212-555-0143",
              qualifications: lData.qualifications || "Juris Doctor (J.D.), Harvard Law School",
              about: lData.about || "Senior legal practitioner with over a decade of litigation experience.",
              languages: lData.languages || "English, Spanish"
            });
          }

          // Fetch clients list for quick booking
          const clList = await fetchAPI("/clients");
          if (clList) setClientsList(clList);
        }

        const apps = await fetchAPI("/appointments/me");
        if (apps) setAppointments(apps);
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.dispatchEvent(new Event("storage"));
    router.push("/");
  };

  const loginDemoClient = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          username: "john@example.com",
          password: "password123",
        })
      });
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem("token", data.access_token);
        window.dispatchEvent(new Event("storage"));
        window.location.reload();
      }
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveLoading(true);
    try {
      const lId = user?.lawyer_id || lawyerProfile?.id || 1;
      const res = await fetchAPI(`/lawyers/${lId}`, {
        method: "PUT",
        body: JSON.stringify(editFormData)
      });
      if (res) {
        setLawyerProfile((prev: any) => ({ ...prev, ...editFormData }));
        setSaveSuccess(true);
        setTimeout(() => {
          setSaveSuccess(false);
          setIsEditingProfile(false);
        }, 1200);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to update profile. Please try again.");
    } finally {
      setSaveLoading(false);
    }
  };

  const handleScheduleClientBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setBookingLoading(true);
    try {
      const newApp = await fetchAPI("/appointments/", {
        method: "POST",
        body: JSON.stringify({
          client_id: bookingFormData.client_id,
          specialization: editFormData.specialization || "Legal Advisory",
          consultation_type: bookingFormData.consultation_type,
          date: bookingFormData.date,
          time_slot: bookingFormData.time_slot,
          brief_subject: bookingFormData.brief_subject,
          detailed_description: "Appointment confirmed and booked by attorney."
        })
      });

      if (newApp) {
        const apps = await fetchAPI("/appointments/me");
        if (apps) setAppointments(apps);
        setBookingSuccess(true);
        setTimeout(() => {
          setBookingSuccess(false);
          setIsBookingClient(false);
        }, 1200);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to schedule appointment.");
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center p-8">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading your secure legal dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center p-4">
        <div className="card p-8 md:p-10 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-blue-100 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-serif font-bold text-slate-900 mb-2">Access Your Dashboard</h2>
          <p className="text-gray-600 text-sm mb-6">
            Please log in with your client or attorney account to review scheduled consultations and confidential communications.
          </p>
          <div className="space-y-3">
            <button
              onClick={loginDemoClient}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3 text-sm font-semibold shadow-md"
            >
              <UserCheck className="h-4 w-4 text-gold" /> One-Click Login as John Doe (Client)
            </button>
            <Link href="/auth/login" className="btn-outline w-full block py-2.5 text-sm font-semibold">
              Enter Email & Password
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const upcomingAppointment = appointments.find((a) => a.status === "confirmed" || a.status === "pending");

  return (
    <div className="bg-ivory min-h-screen flex flex-col md:flex-row">
      
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white border-r border-gray-200 shrink-0">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary text-gold rounded-xl flex items-center justify-center font-bold text-lg shadow-sm">
              {user.full_name?.split(" ").map((n: string) => n[0]).join("") || "U"}
            </div>
            <div className="min-w-0">
              <h2 className="font-bold text-slate-900 leading-tight truncate">{user.full_name}</h2>
              <span className="inline-block uppercase text-[10px] font-bold px-2 py-0.5 mt-1 rounded bg-blue-50 text-primary border border-blue-200">
                {user.role} Account
              </span>
            </div>
          </div>
        </div>
        
        <nav className="p-4 space-y-1">
          <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2.5 bg-blue-50 text-primary rounded-lg font-semibold text-sm">
            <User className="h-4 w-4" /> Overview
          </Link>
          <Link href="/dashboard/appointments" className="flex items-center justify-between px-3 py-2.5 text-gray-700 hover:bg-gray-50 hover:text-slate-900 rounded-lg font-medium text-sm transition-colors">
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span>Appointments</span>
            </div>
            <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-0.5 rounded-full">
              {appointments.length}
            </span>
          </Link>
          <Link href="/dashboard/secure-chat" className="flex items-center justify-between px-3 py-2.5 text-gray-700 hover:bg-gray-50 hover:text-slate-900 rounded-lg font-medium text-sm transition-colors">
            <div className="flex items-center gap-3">
              <MessageSquare className="h-4 w-4 text-gray-500" />
              <span>WhatsApp Chat</span>
            </div>
            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              Live
            </span>
          </Link>
          <Link href="/resources" className="flex items-center gap-3 px-3 py-2.5 text-gray-700 hover:bg-gray-50 hover:text-slate-900 rounded-lg font-medium text-sm transition-colors">
            <Bookmark className="h-4 w-4 text-gray-500" /> Legal Resources
          </Link>
          {user.role === "admin" && (
            <Link href="/admin" className="flex items-center gap-3 px-3 py-2.5 bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100 rounded-lg font-bold text-sm transition-colors mt-2">
              <ShieldCheck className="h-4 w-4 text-amber-600" /> Admin Control Portal
            </Link>
          )}
          {user.role === "lawyer" && (
            <Link href={`/lawyers/${user.lawyer_id || 1}`} className="flex items-center gap-3 px-3 py-2.5 bg-blue-50 text-primary border border-blue-200 hover:bg-blue-100 rounded-lg font-bold text-sm transition-colors mt-2">
              <Briefcase className="h-4 w-4 text-gold" /> My Public Profile
            </Link>
          )}
        </nav>

        <div className="p-4 border-t border-gray-200 mt-auto md:absolute md:bottom-0 md:w-64 bg-white">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2.5 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg font-semibold text-sm transition-colors w-full"
          >
            <LogOut className="h-4 w-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto space-y-8">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-serif font-bold text-slate-900">
                Welcome back, {user.full_name?.split(" ")[0]}!
              </h1>
              <p className="text-gray-600 text-sm mt-1">
                {user.role === "lawyer"
                  ? "Manage your attorney profile, consultation fees, scheduled clients, and privileged communications."
                  : "Here is an overview of your active legal matters, consultations, and verified documents."}
              </p>
            </div>

            {user.role === "lawyer" ? (
              <div className="flex flex-wrap gap-2">
                <button 
                  onClick={() => setIsEditingProfile(true)}
                  className="btn-primary inline-flex items-center gap-2 text-xs sm:text-sm font-semibold py-2.5 px-4 shadow-sm"
                >
                  <Edit3 className="h-4 w-4 text-gold" /> Edit My Profile & Rates
                </button>
                <button 
                  onClick={() => setIsBookingClient(true)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white inline-flex items-center gap-2 text-xs sm:text-sm font-semibold py-2.5 px-4 rounded-xl shadow-sm transition"
                >
                  <Calendar className="h-4 w-4" /> Book Client Session
                </button>
              </div>
            ) : (
              <Link 
                href="/book" 
                className="btn-primary inline-flex items-center gap-2 text-sm font-semibold py-2.5 px-4 shrink-0 shadow-sm"
              >
                <Plus className="h-4 w-4" /> Book New Consultation
              </Link>
            )}
          </div>

          {/* Admin Quick Action Banner */}
          {user.role === "admin" && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shrink-0">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Administrator Control Center</h3>
                  <p className="text-xs text-gray-600">
                    Manage, edit, or remove all lawyer and client profiles, permissions, and resources.
                  </p>
                </div>
              </div>
              <Link 
                href="/admin" 
                className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs py-2 px-4 rounded-lg shrink-0 shadow-2xs transition"
              >
                Open Admin Portal
              </Link>
            </div>
          )}

          {/* Lawyer Quick Action & Profile Status Banner */}
          {user.role === "lawyer" && (
            <div className="card p-6 bg-gradient-to-r from-blue-900 to-primary text-white shadow-md border-0">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[11px] font-bold uppercase px-2.5 py-0.5 rounded-full">
                      Active Bar Standing
                    </span>
                    <span className="text-blue-200 text-xs font-medium">Bar #{lawyerProfile?.bar_number || "NY-2012-8849"}</span>
                  </div>
                  <h2 className="text-xl font-bold font-serif text-white">
                    {user.full_name} • {editFormData.specialization}
                  </h2>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-blue-100 pt-1">
                    <span className="flex items-center gap-1.5 font-bold text-gold text-sm">
                      <DollarSign className="h-4 w-4" /> ${editFormData.fee_per_hour} / hour
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Briefcase className="h-3.5 w-3.5 text-blue-300" /> {editFormData.experience_years} Years Exp.
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-blue-300" /> {editFormData.location}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row md:flex-col gap-2 shrink-0">
                  <button 
                    onClick={() => setIsEditingProfile(true)}
                    className="bg-gold hover:bg-gold-light text-slate-950 font-bold text-xs py-2.5 px-4 rounded-xl shadow-sm transition text-center"
                  >
                    Change Rate & Profile Info
                  </button>
                  <Link 
                    href={`/lawyers/${user.lawyer_id || 1}`}
                    className="bg-white/10 hover:bg-white/20 text-white font-semibold text-xs py-2 px-4 rounded-xl border border-white/20 text-center transition"
                  >
                    View Public Directory Card
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Upcoming Appointment Widget */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900">
                {user.role === "lawyer" ? "Next Scheduled Client Consultation" : "Next Upcoming Consultation"}
              </h2>
              <Link href="/dashboard/appointments" className="text-primary text-sm font-semibold hover:underline">
                View All ({appointments.length})
              </Link>
            </div>
            
            {upcomingAppointment ? (
              <div className="card p-6 border-l-4 border-l-primary shadow-sm hover:shadow-md transition">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-primary text-white flex items-center justify-center font-bold text-xl shrink-0 shadow-sm">
                      {user.role === "lawyer" 
                        ? (upcomingAppointment.client?.full_name?.charAt(0) || "C")
                        : (upcomingAppointment.lawyer?.full_name?.charAt(0) || "L")}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-slate-900 text-base">
                          {user.role === "lawyer" 
                            ? `Client: ${upcomingAppointment.client?.full_name || "John Doe"}` 
                            : (upcomingAppointment.lawyer?.full_name || "Assigned Legal Counsel")}
                        </h3>
                        <ShieldCheck className="h-4 w-4 text-green-600" />
                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                          upcomingAppointment.status === "confirmed" 
                            ? "bg-green-100 text-green-800" 
                            : "bg-yellow-100 text-yellow-800"
                        }`}>
                          {upcomingAppointment.status}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-primary mt-0.5">{upcomingAppointment.specialization}</p>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-1">{upcomingAppointment.brief_subject}</p>
                      <div className="flex items-center gap-4 mt-3 text-xs font-semibold text-slate-700">
                        <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5 text-primary" /> {upcomingAppointment.date}</span>
                        <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-primary" /> {upcomingAppointment.time_slot}</span>
                        <span className="flex items-center gap-1.5"><Video className="h-3.5 w-3.5 text-primary" /> {upcomingAppointment.consultation_type}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row md:flex-col gap-2 shrink-0">
                    <Link 
                      href="/dashboard/secure-chat" 
                      className="btn-primary py-2.5 px-5 text-xs text-center font-semibold rounded-lg shadow-sm"
                    >
                      Open WhatsApp Chat
                    </Link>
                    <Link 
                      href="/dashboard/appointments" 
                      className="btn-outline py-2 px-4 text-xs text-center font-semibold rounded-lg"
                    >
                      Manage Session
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              <div className="card p-8 text-center bg-white border border-dashed border-gray-300">
                <Calendar className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-800">No scheduled consultations</h3>
                <p className="text-gray-500 text-xs mt-1 mb-5">
                  {user.role === "lawyer" 
                    ? "Schedule upcoming consultations with your retained clients directly from the portal."
                    : "Connect with verified attorneys for case evaluation or contract advisory."}
                </p>
                {user.role === "lawyer" ? (
                  <button 
                    onClick={() => setIsBookingClient(true)}
                    className="btn-primary inline-flex items-center gap-2 text-xs py-2 px-4 font-semibold"
                  >
                    <Plus className="h-4 w-4" /> Schedule Client Appointment
                  </button>
                ) : (
                  <Link href="/lawyers" className="btn-primary inline-flex items-center gap-2 text-xs py-2 px-4 font-semibold">
                    Browse Verified Lawyers
                  </Link>
                )}
              </div>
            )}
          </section>

          {/* Quick Shortcuts & Resources */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-slate-900">Privileged Client Communications</h2>
                <Link href="/dashboard/secure-chat" className="text-primary text-xs font-semibold hover:underline">Launch Chat</Link>
              </div>
              <div className="card divide-y divide-gray-100 border border-gray-200">
                <Link href="/dashboard/secure-chat" className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                  <div>
                    <p className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                      John Doe (Client) <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
                    </p>
                    <p className="text-xs text-gray-500 truncate max-w-[220px] mt-0.5">
                      "Thank you for reviewing the clauses. When can we sign..."
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400 shrink-0" />
                </Link>
                <Link href="/dashboard/secure-chat" className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                  <div>
                    <p className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                      Jane Smith (Client) <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
                    </p>
                    <p className="text-xs text-gray-500 truncate max-w-[220px] mt-0.5">
                      "I have uploaded the USPTO filing receipt for your docket records..."
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400 shrink-0" />
                </Link>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-slate-900">Legal Practice Resources</h2>
                <Link href="/resources" className="text-primary text-xs font-semibold hover:underline">All Library</Link>
              </div>
              <div className="card divide-y divide-gray-100 border border-gray-200">
                <Link href="/resources/1" className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                  <div>
                    <p className="font-bold text-sm text-slate-900">Understanding Fundamental Constitutional Rights</p>
                    <p className="text-xs text-gold font-semibold mt-0.5">Constitutional Primer • 6 min read</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400 shrink-0" />
                </Link>
                <Link href="/resources/2" className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                  <div>
                    <p className="font-bold text-sm text-slate-900">Commercial Contracts & Breach of Agreement</p>
                    <p className="text-xs text-gold font-semibold mt-0.5">Corporate Law • 8 min read</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400 shrink-0" />
                </Link>
              </div>
            </div>
          </section>

        </div>
      </main>

      {/* ================= MODAL: LAWYER EDIT OWN PROFILE & FEES ================= */}
      {isEditingProfile && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="card max-w-xl w-full p-6 md:p-8 max-h-[90vh] overflow-y-auto animate-scaleUp">
            <div className="flex items-center justify-between pb-4 border-b border-gray-200">
              <div>
                <h3 className="text-xl font-serif font-bold text-slate-900">Edit Practitioner Profile & Rates</h3>
                <p className="text-xs text-gray-500 mt-0.5">Your public rates and credentials will update across the platform immediately.</p>
              </div>
              <button 
                onClick={() => setIsEditingProfile(false)}
                className="p-1.5 text-gray-400 hover:text-slate-900 rounded-lg hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {saveSuccess ? (
              <div className="py-12 text-center space-y-2">
                <div className="w-14 h-14 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                  <Check className="h-8 w-8" />
                </div>
                <h4 className="text-lg font-bold text-slate-900">Profile Updated Successfully!</h4>
                <p className="text-xs text-gray-600">Your new consultation fee and profile information have been saved.</p>
              </div>
            ) : (
              <form onSubmit={handleSaveProfile} className="space-y-4 mt-6">
                
                {/* Fee Per Hour */}
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <label className="block text-xs font-bold text-amber-900 uppercase tracking-wider mb-1">
                    Consultation Fee ($ / Hour)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 font-bold text-gray-500">$</span>
                    <input 
                      type="number" 
                      min="50"
                      max="2000"
                      required
                      value={editFormData.fee_per_hour}
                      onChange={(e) => setEditFormData({ ...editFormData, fee_per_hour: Number(e.target.value) })}
                      className="input-field pl-8 font-bold text-slate-900 text-lg"
                    />
                  </div>
                  <p className="text-[11px] text-amber-800 mt-1">
                    This rate is displayed directly to prospective clients booking on the platform.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Specialization</label>
                    <input 
                      type="text" 
                      required
                      value={editFormData.specialization}
                      onChange={(e) => setEditFormData({ ...editFormData, specialization: e.target.value })}
                      className="input-field text-sm"
                      placeholder="e.g. Corporate Law & Securities"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Years of Experience</label>
                    <input 
                      type="number" 
                      min="1"
                      max="60"
                      required
                      value={editFormData.experience_years}
                      onChange={(e) => setEditFormData({ ...editFormData, experience_years: Number(e.target.value) })}
                      className="input-field text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Office Location / City</label>
                    <input 
                      type="text" 
                      required
                      value={editFormData.location}
                      onChange={(e) => setEditFormData({ ...editFormData, location: e.target.value })}
                      className="input-field text-sm"
                      placeholder="e.g. New York, NY"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                    <input 
                      type="text" 
                      value={editFormData.phone}
                      onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                      className="input-field text-sm"
                      placeholder="+1 212-555-0143"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Academic Qualifications</label>
                  <input 
                    type="text" 
                    value={editFormData.qualifications}
                    onChange={(e) => setEditFormData({ ...editFormData, qualifications: e.target.value })}
                    className="input-field text-sm"
                    placeholder="e.g. Juris Doctor (J.D.), Harvard Law School"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Languages Spoken</label>
                  <input 
                    type="text" 
                    value={editFormData.languages}
                    onChange={(e) => setEditFormData({ ...editFormData, languages: e.target.value })}
                    className="input-field text-sm"
                    placeholder="e.g. English, Spanish, French"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Professional Biography / Bio</label>
                  <textarea 
                    rows={3}
                    value={editFormData.about}
                    onChange={(e) => setEditFormData({ ...editFormData, about: e.target.value })}
                    className="input-field text-sm"
                    placeholder="Provide a summary of your legal background and practice highlights..."
                  />
                </div>

                <div className="pt-4 border-t border-gray-200 flex justify-end gap-3">
                  <button 
                    type="button" 
                    onClick={() => setIsEditingProfile(false)}
                    className="btn-outline text-xs px-4 py-2.5"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={saveLoading}
                    className="btn-primary text-xs px-6 py-2.5 flex items-center gap-2"
                  >
                    {saveLoading ? "Saving Changes..." : "Save Profile & Rates"}
                  </button>
                </div>

              </form>
            )}

          </div>
        </div>
      )}

      {/* ================= MODAL: LAWYER BOOKING CLIENT APPOINTMENT ================= */}
      {isBookingClient && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="card max-w-lg w-full p-6 md:p-8 animate-scaleUp">
            <div className="flex items-center justify-between pb-4 border-b border-gray-200">
              <div>
                <h3 className="text-xl font-serif font-bold text-slate-900">Schedule Client Session</h3>
                <p className="text-xs text-gray-500 mt-0.5">Book a consultation directly into your calendar and notify the client.</p>
              </div>
              <button 
                onClick={() => setIsBookingClient(false)}
                className="p-1.5 text-gray-400 hover:text-slate-900 rounded-lg hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {bookingSuccess ? (
              <div className="py-10 text-center space-y-2">
                <div className="w-14 h-14 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                  <Check className="h-8 w-8" />
                </div>
                <h4 className="text-lg font-bold text-slate-900">Session Booked!</h4>
                <p className="text-xs text-gray-600">The consultation has been added to your calendar and client records.</p>
              </div>
            ) : (
              <form onSubmit={handleScheduleClientBooking} className="space-y-4 mt-6">
                
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Select Client</label>
                  <select 
                    value={bookingFormData.client_id}
                    onChange={(e) => setBookingFormData({ ...bookingFormData, client_id: Number(e.target.value) })}
                    className="input-field text-sm"
                  >
                    {clientsList.length > 0 ? (
                      clientsList.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.full_name} ({c.email})
                        </option>
                      ))
                    ) : (
                      <>
                        <option value={2}>John Doe (john@example.com)</option>
                        <option value={3}>Jane Smith (client@thelawgo.com)</option>
                        <option value={4}>Robert Taylor (robert.taylor@techventures.io)</option>
                        <option value={5}>Emily Davis (emily.davis@healthcorp.org)</option>
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Consultation Topic / Subject</label>
                  <input 
                    type="text" 
                    required
                    value={bookingFormData.brief_subject}
                    onChange={(e) => setBookingFormData({ ...bookingFormData, brief_subject: e.target.value })}
                    className="input-field text-sm"
                    placeholder="e.g. Commercial Lease Final Addendum Review"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Date</label>
                    <input 
                      type="date" 
                      required
                      value={bookingFormData.date}
                      onChange={(e) => setBookingFormData({ ...bookingFormData, date: e.target.value })}
                      className="input-field text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Time Slot</label>
                    <select 
                      value={bookingFormData.time_slot}
                      onChange={(e) => setBookingFormData({ ...bookingFormData, time_slot: e.target.value })}
                      className="input-field text-sm"
                    >
                      <option value="09:00 AM">09:00 AM</option>
                      <option value="10:00 AM">10:00 AM</option>
                      <option value="11:30 AM">11:30 AM</option>
                      <option value="02:00 PM">02:00 PM</option>
                      <option value="04:00 PM">04:00 PM</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Meeting Mode</label>
                  <select 
                    value={bookingFormData.consultation_type}
                    onChange={(e) => setBookingFormData({ ...bookingFormData, consultation_type: e.target.value })}
                    className="input-field text-sm"
                  >
                    <option value="Video Call">Encrypted Video Conference</option>
                    <option value="Phone Call">Direct Phone Call</option>
                    <option value="In-Person">In-Office Meeting</option>
                  </select>
                </div>

                <div className="pt-4 border-t border-gray-200 flex justify-end gap-3">
                  <button 
                    type="button" 
                    onClick={() => setIsBookingClient(false)}
                    className="btn-outline text-xs px-4 py-2.5"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={bookingLoading}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-sm transition"
                  >
                    {bookingLoading ? "Scheduling..." : "Confirm & Schedule"}
                  </button>
                </div>

              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
