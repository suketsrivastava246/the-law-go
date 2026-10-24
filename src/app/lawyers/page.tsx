"use client";
import API_BASE from "@/lib/api";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, MapPin, Star, ShieldCheck, Filter, Award, Clock } from "lucide-react";
import { fetchAPI } from "@/lib/api";

const SPECIALIZATIONS = [
  "All",
  "Family & Marriage Law",
  "Corporate & Business Law",
  "Criminal Law",
  "Civil & Property Law",
  "Cyber Crime",
  "Taxation & Finance",
];

export default function LawyerDirectory() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpec, setSelectedSpec] = useState("All");
  const [selectedExp, setSelectedExp] = useState("All");
  const [selectedFee, setSelectedFee] = useState("All");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [lawyers, setLawyers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLawyers = async () => {
      try {
        const data = await fetchAPI("/lawyers");
        if (data) {
          setLawyers(data);
        }
      } catch (err) {
        console.error("Failed to load lawyers", err);
      } finally {
        setLoading(false);
      }
    };
    loadLawyers();
  }, []);

  const filteredLawyers = lawyers.filter((lawyer) => {
    const nameMatch = lawyer.user?.full_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const locationMatch = lawyer.location && lawyer.location.toLowerCase().includes(searchTerm.toLowerCase());
    const specMatchText = lawyer.specialization && lawyer.specialization.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSearch = nameMatch || locationMatch || specMatchText;

    const matchesSpec = selectedSpec === "All" || lawyer.specialization === selectedSpec;

    let matchesExp = true;
    if (selectedExp === "1-5") matchesExp = lawyer.experience_years >= 1 && lawyer.experience_years <= 5;
    if (selectedExp === "5-10") matchesExp = lawyer.experience_years > 5 && lawyer.experience_years <= 10;
    if (selectedExp === "10+") matchesExp = lawyer.experience_years > 10;

    let matchesFee = true;
    if (selectedFee === "under150") matchesFee = lawyer.fee_per_hour < 150;
    if (selectedFee === "150-200") matchesFee = lawyer.fee_per_hour >= 150 && lawyer.fee_per_hour <= 200;
    if (selectedFee === "200+") matchesFee = lawyer.fee_per_hour > 200;

    return matchesSearch && matchesSpec && matchesExp && matchesFee;
  });

  return (
    <div className="bg-ivory min-h-screen pb-20">
      {/* Header */}
      <div className="bg-primary text-white py-14 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-block bg-gold/20 text-gold text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full mb-3">
            Verified Legal Network
          </div>
          <h1 className="text-3xl md:text-5xl font-serif font-bold mb-4">Find a Verified Legal Professional</h1>
          <p className="text-gray-300 max-w-2xl mx-auto mb-8 text-sm md:text-base">
            Connect with experienced, board-certified lawyers across top specializations. Book consultations easily and securely.
          </p>
          
          {/* Search Bar */}
          <div className="max-w-3xl mx-auto relative flex items-center">
            <Search className="absolute left-4 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search by lawyer name, specialization, or city (e.g. Jenkins, New York, Family)..."
              className="w-full pl-12 pr-4 py-3.5 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-gold shadow-lg text-sm md:text-base"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="bg-blue-50 border border-blue-200 text-blue-900 px-4 py-3 rounded-xl mb-8 text-xs md:text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-green-600 shrink-0" />
            <span>
              All listed attorneys are verified against state and national bar registries for active licensing.
            </span>
          </div>
          <span className="font-semibold text-primary">{filteredLawyers.length} Verified Lawyers Available</span>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-1/4">
            <div className="flex justify-between items-center lg:hidden mb-4">
              <h2 className="font-bold text-lg text-slate-900">Filters</h2>
              <button 
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                className="flex items-center gap-2 text-primary p-2 border border-primary rounded-md text-sm font-medium"
              >
                <Filter className="h-4 w-4" />
                {showMobileFilters ? "Hide Filters" : "Show Filters"}
              </button>
            </div>
            
            <div className={`${showMobileFilters ? 'block' : 'hidden'} lg:block card p-6 sticky top-24 space-y-6`}>
              <div>
                <h3 className="font-bold text-base mb-3 text-slate-900">Specialization</h3>
                <div className="space-y-2">
                  {SPECIALIZATIONS.map((spec) => (
                    <label key={spec} className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name="specialization"
                        className="form-radio text-primary h-4 w-4"
                        checked={selectedSpec === spec}
                        onChange={() => setSelectedSpec(spec)}
                      />
                      <span className={`text-sm ${selectedSpec === spec ? "font-bold text-primary" : "text-gray-700"}`}>
                        {spec}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="border-t pt-5">
                <h3 className="font-bold text-base mb-3 text-slate-900">Experience</h3>
                <select 
                  value={selectedExp} 
                  onChange={(e) => setSelectedExp(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-primary focus:border-primary"
                >
                  <option value="All">Any Experience Level</option>
                  <option value="1-5">1-5 years</option>
                  <option value="5-10">5-10 years</option>
                  <option value="10+">10+ years (Senior Counsel)</option>
                </select>
              </div>

              <div className="border-t pt-5">
                <h3 className="font-bold text-base mb-3 text-slate-900">Consultation Fee</h3>
                <select 
                  value={selectedFee} 
                  onChange={(e) => setSelectedFee(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-primary focus:border-primary"
                >
                  <option value="All">Any Hourly Rate</option>
                  <option value="under150">Under $150 / hr</option>
                  <option value="150-200">$150 - $200 / hr</option>
                  <option value="200+">$200+ / hr</option>
                </select>
              </div>

              <button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedSpec("All");
                  setSelectedExp("All");
                  setSelectedFee("All");
                }}
                className="w-full text-center text-xs text-gray-500 hover:text-primary font-medium py-1"
              >
                Reset All Filters
              </button>
            </div>
          </div>

          {/* Lawyer Grid */}
          <div className="lg:w-3/4">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map((n) => (
                  <div key={n} className="card p-6 animate-pulse">
                    <div className="flex gap-4 items-center mb-4">
                      <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
                      <div className="space-y-2 flex-1">
                        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                    <div className="h-16 bg-gray-100 rounded mb-4"></div>
                    <div className="h-10 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            ) : filteredLawyers.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
                <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-slate-800 mb-1">No verified lawyers found</h3>
                <p className="text-gray-500 text-sm max-w-sm mx-auto mb-6">
                  No attorneys match your current filter parameters. Try broadening your specialization or location.
                </p>
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedSpec("All");
                    setSelectedExp("All");
                    setSelectedFee("All");
                  }}
                  className="btn-primary text-sm py-2 px-5"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredLawyers.map((lawyer) => (
                  <div key={lawyer.id} className="card p-6 flex flex-col justify-between hover:shadow-lg transition-shadow border border-gray-200/80">
                    <div>
                      <div className="flex items-start gap-4 mb-4">
                        {lawyer.avatar_url ? (
                          <img
                            src={lawyer.avatar_url}
                            alt={lawyer.user?.full_name}
                            className="w-16 h-16 rounded-xl object-cover border-2 border-primary/20 shadow-sm shrink-0"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-xl bg-primary text-white flex items-center justify-center font-bold text-xl shrink-0">
                            {lawyer.user?.full_name?.charAt(0) || "L"}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h3 className="text-lg font-bold text-slate-900 truncate">{lawyer.user?.full_name}</h3>
                            {lawyer.is_verified && (
                              <ShieldCheck className="h-4 w-4 text-green-600 shrink-0" />
                            )}
                          </div>
                          <p className="text-primary font-medium text-xs mt-0.5">{lawyer.specialization}</p>
                          <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                            <MapPin className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                            <span>{lawyer.location || "Remote / National"}</span>
                          </div>
                        </div>
                      </div>

                      <p className="text-xs text-gray-600 line-clamp-2 mb-4">
                        {lawyer.about || "Dedicated legal professional committed to strategic client advocacy."}
                      </p>

                      <div className="grid grid-cols-3 gap-2 py-3 border-y border-gray-100 mb-4 text-center">
                        <div>
                          <p className="text-[11px] text-gray-400 uppercase font-medium">Exp.</p>
                          <p className="font-bold text-xs text-slate-800">{lawyer.experience_years} yrs</p>
                        </div>
                        <div>
                          <p className="text-[11px] text-gray-400 uppercase font-medium">Rate</p>
                          <p className="font-bold text-xs text-primary">${lawyer.fee_per_hour}/hr</p>
                        </div>
                        <div>
                          <p className="text-[11px] text-gray-400 uppercase font-medium">Rating</p>
                          <div className="flex items-center justify-center gap-1">
                            <Star className="h-3 w-3 text-yellow-500 fill-current" />
                            <span className="font-bold text-xs text-slate-800">{lawyer.rating || "4.9"}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2.5 pt-1">
                      <Link 
                        href={`/lawyers/${lawyer.id}`}
                        className="flex-1 text-center btn-outline py-2.5 px-2 text-xs font-semibold rounded-lg"
                      >
                        View Profile
                      </Link>
                      <Link 
                        href={`/book?lawyer=${lawyer.id}`}
                        className="flex-1 text-center btn-primary py-2.5 px-2 text-xs font-semibold rounded-lg"
                      >
                        Book Consult
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

