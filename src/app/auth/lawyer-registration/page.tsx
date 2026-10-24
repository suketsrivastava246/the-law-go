"use client";
import API_BASE from "@/lib/api";

import Link from "next/link";
import { Scale, Upload, Briefcase, FileText, CheckCircle2 } from "lucide-react";
import { useState } from "react";

export default function LawyerRegistrationPage() {
  const [isSuccess, setIsSuccess] = useState(false);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [experience, setExperience] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [barNumber, setBarNumber] = useState("");
  const [qualifications, setQualifications] = useState("");
  const [password, setPassword] = useState(""); // adding a basic password field just for prototype flow
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("${API_BASE}/api/auth/register-lawyer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user: {
            full_name: fullName,
            email: email,
            phone: phone,
            password: password || "tempPassword123!", // fallback if they don't enter one
            role: "lawyer"
          },
          lawyer_data: {
            specialization: specialization,
            experience_years: parseInt(experience) || 0,
            bar_number: barNumber,
            qualifications: qualifications,
            location: "Remote",
            fee_per_hour: 150.0,
            about: "I am a dedicated professional..."
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Registration failed");
      }

      setIsSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center p-4">
        <div className="card p-8 md:p-12 max-w-lg w-full text-center">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="h-10 w-10 text-blue-600" />
          </div>
          <h1 className="text-3xl font-serif font-bold text-slate-900 mb-4">Application Submitted</h1>
          <p className="text-gray-600 mb-8">
            Thank you for applying to join THE LAW GO network. Our team will review your credentials and verify your license. You will hear from us within 3-5 business days.
          </p>
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-lg text-sm mb-8 text-left">
            <strong>Important:</strong> Your profile will not be visible in the directory until the verification process is fully completed.
          </div>
          <Link href="/" className="btn-primary w-full inline-block text-center">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ivory py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center justify-center mb-6">
            <Scale className="h-12 w-12 text-gold" />
          </Link>
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-slate-900">Join Our Professional Network</h1>
          <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
            Apply to become a verified legal professional on THE LAW GO. Expand your practice and connect with clients securely.
          </p>
        </div>

        <div className="card p-6 md:p-10">
          {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">{error}</div>}
          <form className="space-y-8" onSubmit={handleSubmit}>
            
            {/* Personal Details */}
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2 border-b pb-2">
                <Briefcase className="h-5 w-5 text-primary" /> Personal Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Legal Name</label>
                  <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                  <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" required />
                </div>
              </div>
            </div>

            {/* Professional Details */}
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2 border-b pb-2">
                <Scale className="h-5 w-5 text-primary" /> Professional Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Primary Specialization</label>
                  <select value={specialization} onChange={(e) => setSpecialization(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" required>
                    <option value="">Select a specialization...</option>
                    <option>Family & Marriage Law</option>
                    <option>Corporate & Business Law</option>
                    <option>Criminal Law</option>
                    <option>Civil & Property Law</option>
                    <option>Cyber Crime</option>
                    <option>Taxation & Finance</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Years of Experience</label>
                  <input type="number" min="0" value={experience} onChange={(e) => setExperience(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bar Association / Registration Number</label>
                  <input type="text" value={barNumber} onChange={(e) => setBarNumber(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Qualifications (Comma separated)</label>
                  <input type="text" value={qualifications} onChange={(e) => setQualifications(e.target.value)} placeholder="e.g., J.D. Harvard Law, B.A. Yale" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" required />
                </div>
              </div>
            </div>

            {/* Document Upload */}
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2 border-b pb-2">
                <FileText className="h-5 w-5 text-primary" /> License Verification
              </h2>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
                <Upload className="h-10 w-10 text-gray-400 mx-auto mb-4" />
                <p className="text-sm text-gray-600 font-medium mb-1">Click to upload or drag and drop</p>
                <p className="text-xs text-gray-500">Please upload a scanned copy of your Bar ID or valid legal license (PDF, JPG, PNG)</p>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg text-sm text-blue-800">
              By submitting this form, you agree to our verification process. You will not be listed as a verified professional on the platform until manual verification is complete.
            </div>

            <button type="submit" className="w-full btn-primary py-4 text-lg">
              Submit Application
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

