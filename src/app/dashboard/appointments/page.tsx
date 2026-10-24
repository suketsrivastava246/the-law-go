"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Calendar, Clock, Video, Phone, MessageSquare, ArrowLeft, 
  ShieldCheck, AlertCircle, Plus, CheckCircle, XCircle 
} from "lucide-react";
import { fetchAPI } from "@/lib/api";

export default function AppointmentsListPage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const [actionMessage, setActionMessage] = useState("");

  const loadAppointments = async () => {
    try {
      const data = await fetchAPI("/appointments/me");
      if (data) setAppointments(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  const handleCancel = async (id: number) => {
    if (!confirm("Are you sure you want to cancel this consultation?")) return;
    setCancellingId(id);
    try {
      await fetchAPI(`/appointments/${id}/cancel`, { method: "POST" });
      setActionMessage("Appointment cancelled successfully.");
      await loadAppointments();
      setTimeout(() => setActionMessage(""), 4000);
    } catch (err: any) {
      alert(err.message || "Failed to cancel appointment");
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="bg-ivory min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Breadcrumb / Back */}
        <div className="flex items-center justify-between">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-primary hover:text-primary-dark text-sm font-semibold">
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Link>
          <Link href="/book" className="btn-primary inline-flex items-center gap-1.5 text-xs py-2 px-3.5 font-semibold">
            <Plus className="h-3.5 w-3.5" /> Book Consultation
          </Link>
        </div>

        <div>
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-slate-900">My Consultations & Appointments</h1>
          <p className="text-gray-600 text-sm mt-1">
            Review your upcoming, completed, and pending legal consultation sessions.
          </p>
        </div>

        {actionMessage && (
          <div className="p-4 bg-green-50 border border-green-200 text-green-800 rounded-xl text-sm flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600 shrink-0" />
            <span>{actionMessage}</span>
          </div>
        )}

        {loading ? (
          <div className="py-20 text-center">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-sm text-gray-500">Loading appointments from database...</p>
          </div>
        ) : appointments.length === 0 ? (
          <div className="card p-12 text-center bg-white border border-dashed border-gray-300 rounded-2xl">
            <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-800">No Appointments Found</h3>
            <p className="text-gray-500 text-sm max-w-sm mx-auto mb-6">
              You do not have any scheduled consultations. Connect with a verified attorney today to get started.
            </p>
            <Link href="/lawyers" className="btn-primary inline-flex items-center gap-2 text-sm py-2.5 px-5 font-semibold">
              Find a Lawyer & Book
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {appointments.map((app) => {
              const isConfirmed = app.status === "confirmed";
              const isCancelled = app.status === "cancelled";

              return (
                <div 
                  key={app.id} 
                  className={`card p-6 border transition ${
                    isCancelled ? "opacity-60 bg-gray-50 border-gray-200" : "border-gray-200/90 shadow-sm hover:shadow"
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-primary text-gold flex items-center justify-center font-bold text-lg shrink-0">
                        {app.lawyer?.full_name?.charAt(0) || "L"}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-slate-900 text-base">
                            {app.lawyer?.full_name || "Specialist Assigned"}
                          </h3>
                          <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                            isConfirmed 
                              ? "bg-green-100 text-green-800" 
                              : isCancelled 
                              ? "bg-red-100 text-red-800" 
                              : "bg-yellow-100 text-yellow-800"
                          }`}>
                            {app.status}
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-primary mt-0.5">{app.specialization}</p>
                        <p className="text-sm font-medium text-slate-800 mt-2">{app.brief_subject}</p>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{app.detailed_description}</p>
                        
                        <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-gray-600 font-medium">
                          <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5 text-primary" /> {app.date}</span>
                          <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-primary" /> {app.time_slot}</span>
                          <span className="flex items-center gap-1.5"><Video className="h-3.5 w-3.5 text-primary" /> {app.consultation_type}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row md:flex-col gap-2 shrink-0 pt-2 md:pt-0">
                      {!isCancelled && (
                        <>
                          <Link 
                            href="/dashboard/secure-chat" 
                            className="btn-primary py-2 px-4 text-xs font-semibold text-center rounded-lg shadow-sm"
                          >
                            Enter Consultation
                          </Link>
                          <button
                            onClick={() => handleCancel(app.id)}
                            disabled={cancellingId === app.id}
                            className="btn-outline text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 py-1.5 px-3 text-xs font-medium rounded-lg"
                          >
                            {cancellingId === app.id ? "Cancelling..." : "Cancel Appointment"}
                          </button>
                        </>
                      )}
                      {isCancelled && (
                        <span className="text-xs text-gray-400 italic">Session Cancelled</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
