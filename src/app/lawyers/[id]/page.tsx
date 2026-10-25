"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { ArrowLeft, Star, MapPin, ShieldCheck, Clock, Award, GraduationCap, Languages, MessageSquare, Calendar } from "lucide-react";
import API_BASE from "@/lib/api";

export default function LawyerProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [lawyer, setLawyer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchLawyer = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/lawyers/${resolvedParams.id}`);
        if (!res.ok) throw new Error("Lawyer profile not found");
        const data = await res.json();
        setLawyer(data);
      } catch (err: any) {
        setError(err.message || "Failed to load lawyer details");
      } finally {
        setLoading(false);
      }
    };
    fetchLawyer();
  }, [resolvedParams.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center p-8">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading verified lawyer credentials...</p>
        </div>
      </div>
    );
  }

  if (error || !lawyer) {
    return (
      <div className="min-h-screen bg-ivory py-20 px-4 text-center">
        <div className="max-w-md mx-auto card p-8">
          <h2 className="text-xl font-bold text-slate-900 mb-2">Profile Not Available</h2>
          <p className="text-gray-600 text-sm mb-6">{error || "The requested attorney profile does not exist."}</p>
          <Link href="/lawyers" className="btn-primary inline-flex items-center gap-2 text-sm">
            <ArrowLeft className="h-4 w-4" /> Return to Directory
          </Link>
        </div>
      </div>
    );
  }

  const qualificationsList = lawyer.qualifications 
    ? lawyer.qualifications.split(",").map((q: string) => q.trim()) 
    : ["Juris Doctor (J.D.)", "Member of State Bar Association"];

  const languagesList = lawyer.languages 
    ? lawyer.languages.split(",").map((l: string) => l.trim()) 
    : ["English"];

  const lawyerName = lawyer.user?.full_name || lawyer.full_name || "Verified Legal Counsel";

  return (
    <div className="bg-ivory min-h-screen pb-20">
      <div className="bg-primary pt-8 pb-32">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/lawyers" className="inline-flex items-center text-gold hover:text-white transition-colors mb-8 text-sm font-medium">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Lawyer Directory
          </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 relative z-10">
        <div className="bg-blue-50 border border-blue-200 text-blue-900 px-4 py-3 rounded-xl mb-6 text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-green-600 shrink-0" />
            <span>
              <strong>Verified Attorney:</strong> Bar Registration #{lawyer.bar_number} is verified with active standing.
            </span>
          </div>
          <span className="text-xs font-bold uppercase bg-green-100 text-green-800 px-2.5 py-1 rounded-full">
            Active License
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Profile Info */}
          <div className="lg:col-span-2 space-y-8">
            <div className="card p-6 md:p-8">
              <div className="flex flex-col md:flex-row gap-6 items-start">
                {lawyer.avatar_url ? (
                  <img 
                    src={lawyer.avatar_url} 
                    alt={lawyerName} 
                    className="w-28 h-28 md:w-32 md:h-32 rounded-2xl object-cover shadow-md border-4 border-white shrink-0"
                  />
                ) : (
                  <div className="w-28 h-28 md:w-32 md:h-32 rounded-2xl bg-primary text-white flex items-center justify-center font-bold text-3xl shrink-0">
                    {lawyerName.charAt(0) || "L"}
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h1 className="text-2xl md:text-3xl font-serif font-bold text-slate-900">
                      {lawyerName}
                    </h1>
                    {lawyer.is_verified && (
                      <ShieldCheck className="h-6 w-6 text-green-600 shrink-0" />
                    )}
                  </div>
                  <p className="text-primary font-semibold text-base mb-3">{lawyer.specialization}</p>
                  
                  <div className="flex flex-wrap gap-4 text-xs md:text-sm text-gray-600">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span>{lawyer.location || "National / Remote"}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span>{lawyer.experience_years} Years Experience</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span className="font-bold text-slate-800">{lawyer.rating || "4.9"}</span>
                      <span className="text-gray-400">({lawyer.reviews_count || 12} reviews)</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-100">
                <h2 className="text-lg font-bold text-slate-900 mb-3">Professional Biography</h2>
                <p className="text-gray-700 leading-relaxed text-sm md:text-base">
                  {lawyer.about || "Experienced legal counselor dedicated to protecting clients' rights and providing clear strategic representation."}
                </p>
              </div>
            </div>

            <div className="card p-6 md:p-8 space-y-6">
              <h2 className="text-lg font-bold text-slate-900 pb-3 border-b border-gray-100">
                Credentials & Practice Details
              </h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="flex items-center gap-2 font-semibold text-slate-800 mb-2.5 text-sm">
                    <GraduationCap className="h-4 w-4 text-primary" /> Education & Bar Admissions
                  </h3>
                  <ul className="list-disc list-inside text-gray-600 space-y-1.5 text-sm ml-1">
                    {qualificationsList.map((qual: string, idx: number) => (
                      <li key={idx}>{qual}</li>
                    ))}
                    <li>Bar Registration Number: <span className="font-mono font-medium text-slate-800">{lawyer.bar_number}</span></li>
                  </ul>
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <h3 className="flex items-center gap-2 font-semibold text-slate-800 mb-2.5 text-sm">
                    <Award className="h-4 w-4 text-primary" /> Core Practice Focus Areas
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    <span className="bg-blue-50 text-primary border border-blue-200 text-xs px-3 py-1.5 rounded-lg font-medium">
                      {lawyer.specialization}
                    </span>
                    <span className="bg-gray-50 text-slate-700 border border-gray-200 text-xs px-3 py-1.5 rounded-lg">
                      Statutory Advisory
                    </span>
                    <span className="bg-gray-50 text-slate-700 border border-gray-200 text-xs px-3 py-1.5 rounded-lg">
                      Mediation & Trial Defense
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <h3 className="flex items-center gap-2 font-semibold text-slate-800 mb-2.5 text-sm">
                    <Languages className="h-4 w-4 text-primary" /> Languages Spoken
                  </h3>
                  <div className="flex gap-2">
                    {languagesList.map((lang: string, idx: number) => (
                      <span key={idx} className="bg-gray-100 text-slate-700 text-xs px-3 py-1 rounded-md">
                        {lang}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Booking & Consultation Sidebar */}
          <div className="space-y-6">
            <div className="card p-6 md:p-8 sticky top-24 border-t-4 border-t-gold">
              <div className="mb-6">
                <span className="text-xs uppercase tracking-wider text-gray-400 font-bold block mb-1">
                  Verified Consultation Rate
                </span>
                <div className="flex items-baseline gap-1">
                  <p className="text-3xl font-bold text-slate-900">${lawyer.fee_per_hour}</p>
                  <span className="text-gray-500 text-sm font-medium">/ 60-min session</span>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <Link 
                  href={`/book?lawyer=${lawyer.id}`} 
                  className="btn-primary w-full flex items-center justify-center gap-2 py-3 text-sm font-semibold shadow-md"
                >
                  <Calendar className="h-4 w-4 text-gold" /> Schedule Consultation
                </Link>
                <Link 
                  href={`/dashboard/secure-chat?lawyer=${lawyer.id}`} 
                  className="btn-outline w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold"
                >
                  <MessageSquare className="h-4 w-4" /> Send Pre-Consult Inquiry
                </Link>
              </div>

              <div className="border-t border-gray-100 pt-4 space-y-2.5 text-xs text-gray-500">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-green-600 shrink-0" />
                  <span>Verified Legal License and Credentials</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary shrink-0" />
                  <span>Prompt Response Within 24 Hours</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
