"use client";
import API_BASE from "@/lib/api";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, ChevronRight, Calendar, Clock, Video, Phone, MessageSquare, AlertCircle, UserCheck } from "lucide-react";
import { fetchAPI } from "@/lib/api";

function BookingContent() {
  const searchParams = useSearchParams();
  const preselectedLawyerId = searchParams.get("lawyer") || "";

  const [step, setStep] = useState(1);
  const [isSuccess, setIsSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lawyers, setLawyers] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState("");

  // Form State
  const [specialization, setSpecialization] = useState("Family & Marriage Law");
  const [lawyerId, setLawyerId] = useState(preselectedLawyerId);
  const [clientId, setClientId] = useState<number>(2);
  const [clients, setClients] = useState<any[]>([]);
  const [consultationType, setConsultationType] = useState("Video Call");
  const [date, setDate] = useState("2026-11-05");
  const [timeSlot, setTimeSlot] = useState("10:00 AM");
  const [briefSubject, setBriefSubject] = useState("");
  const [detailedDescription, setDetailedDescription] = useState("");

  useEffect(() => {
    // 1. Fetch live lawyers
    fetchAPI("/lawyers")
      .then((data) => {
        if (data) {
          setLawyers(data);
          if (preselectedLawyerId) {
            const found = data.find((l: any) => l.id.toString() === preselectedLawyerId);
            if (found) {
              setSpecialization(found.specialization);
              setLawyerId(found.id.toString());
            }
          }
        }
      })
      .catch((err) => console.error(err));

    // 2. Check if logged in
    const token = localStorage.getItem("token");
    if (token) {
      fetch(`${API_BASE}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((userData) => setUser(userData))
        .catch(() => setUser(null));
    }
  }, [preselectedLawyerId]);

  const selectedLawyerObj = lawyers.find((l) => l.id.toString() === lawyerId);

  const nextStep = () => {
    setErrorMsg("");
    setStep((prev) => Math.min(prev + 1, 4));
  };
  const prevStep = () => {
    setErrorMsg("");
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const loginDemoClient = async () => {
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
        setUser({ full_name: "John Doe", email: "john@example.com", role: "client" });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const submitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    const token = localStorage.getItem("token");
    if (!token) {
      setErrorMsg("Please log in to confirm your booking. You can use the One-Click Demo Login below.");
      setLoading(false);
      return;
    }

    try {
      await fetchAPI("/appointments/", {
        method: "POST",
        body: JSON.stringify({
          specialization,
          lawyer_id: selectedLawyerObj ? selectedLawyerObj.user_id : null,
          consultation_type: consultationType,
          date,
          time_slot: timeSlot,
          brief_subject: briefSubject || "General Legal Consultation",
          detailed_description: detailedDescription || "Consultation requested via THE LAW GO platform."
        })
      });

      setIsSuccess(true);
    } catch (error: any) {
      setErrorMsg(error.message || "Failed to schedule appointment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-ivory py-20 px-4 flex items-center justify-center">
        <div className="card p-8 md:p-12 max-w-lg w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-serif font-bold text-slate-900 mb-2">Booking Confirmed!</h1>
          <p className="text-sm font-semibold text-primary mb-4">Appointment Reference #{Math.floor(100000 + Math.random() * 900000)}</p>
          <p className="text-gray-600 mb-8 text-sm">
            Your appointment has been registered in the database. You can track this consultation, access meeting links, and upload case notes directly from your dashboard.
          </p>
          <div className="flex flex-col gap-3">
            <Link href="/dashboard/appointments" className="btn-primary w-full text-center py-3">
              View In My Appointments
            </Link>
            <Link href="/dashboard" className="btn-outline w-full text-center py-2.5">
              Go to Dashboard Overview
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-ivory min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-serif font-bold text-slate-900">Book a Consultation</h1>
          <p className="text-gray-600 mt-2 text-sm">Follow the 4-step process to schedule your appointment.</p>
        </div>

        {/* Progress Bar */}
        <div className="flex items-center justify-between mb-8 relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-200 -z-10"></div>
          <div 
            className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary -z-10 transition-all duration-300" 
            style={{ width: `${((step - 1) / 3) * 100}%` }}
          ></div>
          
          {[1, 2, 3, 4].map((i) => (
            <div 
              key={i} 
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-4 border-ivory transition-colors ${
                step >= i ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'
              }`}
            >
              {step > i ? <CheckCircle2 className="h-5 w-5" /> : i}
            </div>
          ))}
        </div>

        {/* Auth status alert if not logged in */}
        {!user && (
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
            <div className="flex items-center gap-2 text-blue-900">
              <AlertCircle className="h-5 w-5 text-primary shrink-0" />
              <span>You are booking as a guest. Log in to save to your dashboard account:</span>
            </div>
            <button
              onClick={loginDemoClient}
              className="bg-primary hover:bg-primary-dark text-white text-xs font-semibold px-3 py-1.5 rounded-lg shrink-0 flex items-center gap-1.5 shadow-sm"
            >
              <UserCheck className="h-3.5 w-3.5 text-gold" /> One-Click Client Login
            </button>
          </div>
        )}

        <div className="card p-6 md:p-8">
          {errorMsg && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
              {errorMsg}
            </div>
          )}

          <form onSubmit={step === 4 ? submitBooking : (e) => { e.preventDefault(); nextStep(); }}>
            
            {/* Step 1: Select Professional */}
            {step === 1 && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-slate-900 border-b pb-2">Step 1: Select Legal Professional</h2>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Legal Specialization</label>
                  <select 
                    value={specialization} 
                    onChange={(e) => setSpecialization(e.target.value)} 
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-sm" 
                    required
                  >
                    <option>Family & Marriage Law</option>
                    <option>Corporate & Business Law</option>
                    <option>Criminal Law</option>
                    <option>Civil & Property Law</option>
                    <option>Cyber Crime</option>
                    <option>Taxation & Finance</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Verified Attorney</label>
                  <select 
                    value={lawyerId} 
                    onChange={(e) => setLawyerId(e.target.value)} 
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-sm"
                  >
                    <option value="">Any available certified attorney</option>
                    {lawyers.map((l) => (
                      <option key={l.id} value={l.id.toString()}>
                        {l.user?.full_name} — {l.specialization} (${l.fee_per_hour}/hr)
                      </option>
                    ))}
                  </select>
                  {selectedLawyerObj && (
                    <div className="mt-3 p-3 bg-blue-50/60 border border-blue-100 rounded-lg flex items-center gap-3 text-xs text-slate-700">
                      <div className="font-bold text-primary">{selectedLawyerObj.user?.full_name}</div>
                      <div>• {selectedLawyerObj.experience_years} yrs exp</div>
                      <div>• Bar #{selectedLawyerObj.bar_number}</div>
                      <div>• ${selectedLawyerObj.fee_per_hour}/hr</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 2: Date & Time */}
            {step === 2 && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-slate-900 border-b pb-2">Step 2: Consultation Format & Time</h2>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Consultation Mode</label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {[
                      { name: "Video Call", icon: Video, desc: "Face-to-face HD Video" },
                      { name: "Voice Call", icon: Phone, desc: "Confidential phone audio" },
                      { name: "Secure Chat", icon: MessageSquare, desc: "Encrypted messaging" }
                    ].map((mode) => {
                      const Icon = mode.icon;
                      const active = consultationType === mode.name;
                      return (
                        <button
                          key={mode.name}
                          type="button"
                          onClick={() => setConsultationType(mode.name)}
                          className={`p-4 rounded-xl border text-left transition ${
                            active 
                              ? "border-primary bg-blue-50/80 ring-2 ring-primary/20" 
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <Icon className={`h-6 w-6 mb-2 ${active ? "text-primary" : "text-gray-500"}`} />
                          <p className="font-bold text-sm text-slate-900">{mode.name}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{mode.desc}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Consultation Date</label>
                    <input 
                      type="date" 
                      value={date} 
                      onChange={(e) => setDate(e.target.value)} 
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-sm" 
                      required 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Available Time Window</label>
                    <select 
                      value={timeSlot} 
                      onChange={(e) => setTimeSlot(e.target.value)} 
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-sm" 
                      required
                    >
                      <option>10:00 AM</option>
                      <option>11:30 AM</option>
                      <option>02:00 PM</option>
                      <option>03:30 PM</option>
                      <option>04:15 PM</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Details */}
            {step === 3 && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-slate-900 border-b pb-2">Step 3: Consultation Summary & Notes</h2>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Brief Matter Subject</label>
                  <input 
                    type="text" 
                    value={briefSubject} 
                    onChange={(e) => setBriefSubject(e.target.value)} 
                    placeholder="e.g., Commercial lease breach notice consultation" 
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-sm" 
                    required 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Background Context for Attorney</label>
                  <textarea 
                    rows={4} 
                    value={detailedDescription} 
                    onChange={(e) => setDetailedDescription(e.target.value)} 
                    placeholder="Describe key dates, contract references, or questions so the lawyer can prepare..." 
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-sm" 
                    required
                  ></textarea>
                  <p className="text-xs text-gray-400 mt-1">
                    Your notes are stored with confidential access safeguards.
                  </p>
                </div>
              </div>
            )}

            {/* Step 4: Confirm */}
            {step === 4 && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-slate-900 border-b pb-2">Step 4: Review & Finalize Booking</h2>
                
                <div className="bg-gray-50 border border-gray-200 p-6 rounded-xl space-y-3.5 text-sm">
                  <div className="flex justify-between border-b border-gray-200 pb-2">
                    <span className="text-gray-500">Selected Attorney</span>
                    <span className="font-bold text-slate-900">
                      {selectedLawyerObj ? selectedLawyerObj.user?.full_name : "Assigned Certified Specialist"}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-gray-200 pb-2">
                    <span className="text-gray-500">Specialization</span>
                    <span className="font-semibold text-primary">{specialization}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-200 pb-2">
                    <span className="text-gray-500">Format</span>
                    <span className="font-medium text-slate-800">{consultationType}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-200 pb-2">
                    <span className="text-gray-500">Date & Time</span>
                    <span className="font-medium text-slate-800">{date} at {timeSlot}</span>
                  </div>
                  <div className="flex justify-between pt-1">
                    <span className="text-gray-700 font-bold">Estimated Consultation Fee</span>
                    <span className="font-bold text-primary text-lg">
                      ${selectedLawyerObj ? selectedLawyerObj.fee_per_hour : "150.00"}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2 text-xs text-gray-600 bg-blue-50/70 p-3 rounded-lg border border-blue-100">
                  <input type="checkbox" id="terms" className="mt-0.5" required defaultChecked />
                  <label htmlFor="terms">
                    I agree to the consultation booking terms and acknowledge that consultations provide legal opinion and analysis under professional conduct rules.
                  </label>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="mt-8 flex justify-between pt-6 border-t border-gray-200">
              {step > 1 ? (
                <button type="button" onClick={prevStep} className="btn-outline px-5 py-2.5 text-sm font-semibold">
                  Back
                </button>
              ) : <div></div>}
              
              <button 
                type="submit" 
                disabled={loading} 
                className="btn-primary flex items-center gap-2 px-6 py-2.5 text-sm font-semibold shadow-md"
              >
                {step === 4 ? (loading ? "Confirming..." : "Confirm & Schedule") : "Next Step"} 
                {step < 4 && <ChevronRight className="h-4 w-4" />}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function BookingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-ivory flex items-center justify-center p-8">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <BookingContent />
    </Suspense>
  );
}


