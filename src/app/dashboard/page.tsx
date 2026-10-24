"use client";
import API_BASE from "@/lib/api";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Calendar, Clock, Bookmark, MessageSquare, Settings, LogOut, 
  ChevronRight, User, ShieldCheck, Video, Phone, Plus, UserCheck, AlertCircle 
} from "lucide-react";
import { useRouter } from "next/navigation";
import { fetchAPI } from "@/lib/api";

export default function UserDashboard() {
  const [user, setUser] = useState<any>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

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
      const res = await fetch("${API_BASE}/api/auth/login", {
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
          <Link href="/dashboard/secure-chat" className="flex items-center gap-3 px-3 py-2.5 text-gray-700 hover:bg-gray-50 hover:text-slate-900 rounded-lg font-medium text-sm transition-colors">
            <MessageSquare className="h-4 w-4 text-gray-500" /> Secure Chat
          </Link>
          <Link href="/resources" className="flex items-center gap-3 px-3 py-2.5 text-gray-700 hover:bg-gray-50 hover:text-slate-900 rounded-lg font-medium text-sm transition-colors">
            <Bookmark className="h-4 w-4 text-gray-500" /> Legal Resources
          </Link>
          {user.role === "admin" && (
            <Link href="/admin" className="flex items-center gap-3 px-3 py-2.5 bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100 rounded-lg font-bold text-sm transition-colors mt-2">
              <ShieldCheck className="h-4 w-4 text-amber-600" /> Admin Control Portal
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
                Here is an overview of your active legal matters, consultations, and verified documents.
              </p>
            </div>
            <Link 
              href="/book" 
              className="btn-primary inline-flex items-center gap-2 text-sm font-semibold py-2.5 px-4 shrink-0 shadow-sm"
            >
              <Plus className="h-4 w-4" /> Book New Consultation
            </Link>
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
                    Remove or verify lawyers, manage permissions, and edit constitutional / legal resources.
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

          {/* Upcoming Appointment Widget */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900">Next Upcoming Consultation</h2>
              <Link href="/dashboard/appointments" className="text-primary text-sm font-semibold hover:underline">
                View All ({appointments.length})
              </Link>
            </div>
            
            {upcomingAppointment ? (
              <div className="card p-6 border-l-4 border-l-primary shadow-sm hover:shadow-md transition">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-primary text-white flex items-center justify-center font-bold text-xl shrink-0 shadow-sm">
                      {upcomingAppointment.lawyer?.full_name?.charAt(0) || "L"}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-slate-900 text-base">
                          {upcomingAppointment.lawyer?.full_name || "Assigned Legal Counsel"}
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
                      Join Consultation Room
                    </Link>
                    <Link 
                      href="/dashboard/appointments" 
                      className="btn-outline py-2 px-4 text-xs text-center font-semibold rounded-lg"
                    >
                      Manage Booking
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              <div className="card p-8 text-center bg-white border border-dashed border-gray-300">
                <Calendar className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-800">No scheduled consultations</h3>
                <p className="text-gray-500 text-xs mt-1 mb-5">Connect with verified attorneys for case evaluation or contract advisory.</p>
                <Link href="/lawyers" className="btn-primary inline-flex items-center gap-2 text-xs py-2 px-4 font-semibold">
                  Browse Verified Lawyers
                </Link>
              </div>
            )}
          </section>

          {/* Quick Shortcuts & Resources */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-slate-900">Secure Communications</h2>
                <Link href="/dashboard/secure-chat" className="text-primary text-xs font-semibold hover:underline">Open Room</Link>
              </div>
              <div className="card divide-y divide-gray-100 border border-gray-200">
                <Link href="/dashboard/secure-chat" className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                  <div>
                    <p className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                      Adv. Sarah Jenkins <span className="w-2 h-2 rounded-full bg-green-500 inline-block"></span>
                    </p>
                    <p className="text-xs text-gray-500 truncate max-w-[220px] mt-0.5">
                      "I have reviewed the background notes for your upcoming session..."
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400 shrink-0" />
                </Link>
                <Link href="/ai" className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                  <div>
                    <p className="font-bold text-sm text-slate-900">THE LAW GO AI Assistant</p>
                    <p className="text-xs text-gray-500 truncate max-w-[220px] mt-0.5">
                      Ask quick legal inquiries & find relevant statutes
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400 shrink-0" />
                </Link>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-slate-900">Recommended Legal Guides</h2>
                <Link href="/resources" className="text-primary text-xs font-semibold hover:underline">All Library</Link>
              </div>
              <div className="card divide-y divide-gray-100 border border-gray-200">
                <Link href="/resources/1" className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                  <div>
                    <p className="font-bold text-sm text-slate-900">Understanding Your Fundamental Rights</p>
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
    </div>
  );
}

