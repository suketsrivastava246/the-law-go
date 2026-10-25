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
    const fullName = lawyer.user?.full_name || lawyer.full_name || "";
    const nameMatch = fullName.toLowerCase().includes(searchTerm.toLowerCase());
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
    <div className="bg-ivory min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-slate-900 mb-3">
            Find Verified Legal Counsel
          </h1>
          <p className="text-gray-600 text-sm md:text-base">
            Browse accredited attorneys across civil, criminal, corporate, and family law. Filter by specialization, jurisdiction, and hourly rates.
          </p>
        </div>

        {/* Search & Quick Filters Bar */}
        <div className="card p-4 mb-8 shadow-sm">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search attorney name, city, or keyword..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
              {SPECIALIZATIONS.map((spec) => (
                <button
                  key={spec}
                  onClick={() => setSelectedSpec(spec)}
                  className={`text-xs px-3 py-1.5 rounded-full font-medium whitespace-nowrap transition-colors ${
                    selectedSpec === spec
                      ? "bg-primary text-white"
                      : "bg-gray-100 text-slate-700 hover:bg-gray-200"
                  }`}
                >
                  {spec}
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="md:hidden flex items-center gap-2 text-sm text-primary font-semibold self-start"
            >
              <Filter className="h-4 w-4" /> Filters
            </button>
          </div>
        </div>

        {/* Content Layout */}
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Sidebar Filters */}
          <div className={`lg:w-1/4 ${showMobileFilters ? "block" : "hidden lg:block"}`}>
            <div className="card p-6 space-y-6 sticky top-24">
              <div>
                <h3 className="font-bold text-base mb-3 text-slate-900 flex items-center gap-2">
                  <Filter className="h-4 w-4 text-gold" /> Filter Attorneys
                </h3>
                <p className="text-xs text-gray-500">Refine search according to specific case needs.</p>
              </div>

              <div className="border-t pt-5">
                <h3 className="font-bold text-base mb-3 text-slate-900">Experience</h3>
                <div className="space-y-2">
                  {[
                    { label: "All Experience Levels", value: "All" },
                    { label: "1 - 5 Years", value: "1-5" },
                    { label: "5 - 10 Years", value: "5-10" },
                    { label: "10+ Years Senior Counsel", value: "10+" },
                  ].map((exp) => (
                    <label key={exp.value} className="flex items-center text-sm text-gray-700 cursor-pointer">
                      <input
                        type="radio"
                        name="experience"
                        checked={selectedExp === exp.value}
                        onChange={() => setSelectedExp(exp.value)}
                        className="text-primary focus:ring-primary mr-2"
                      />
                      {exp.label}
                    </label>
                  ))}
                </div>
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
                {filteredLawyers.map((lawyer) => {
                  const fullName = lawyer.user?.full_name || lawyer.full_name || "Verified Legal Counsel";
                  return (
                    <div key={lawyer.id} className="card p-6 flex flex-col justify-between hover:shadow-lg transition-shadow border border-gray-200/80">
                      <div>
                        <div className="flex items-start gap-4 mb-4">
                          {lawyer.avatar_url ? (
                            <img
                              src={lawyer.avatar_url}
                              alt={fullName}
                              className="w-16 h-16 rounded-xl object-cover border-2 border-primary/20 shadow-sm shrink-0"
                            />
                          ) : (
                            <div className="w-16 h-16 rounded-xl bg-primary text-white flex items-center justify-center font-bold text-xl shrink-0">
                              {fullName.charAt(0) || "L"}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <h3 className="text-lg font-bold text-slate-900 truncate">{fullName}</h3>
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

                        <div className="flex items-center gap-4 text-xs text-gray-500 mb-4 pb-4 border-b border-gray-100">
                          <span className="flex items-center gap-1 font-semibold text-slate-800">
                            <Star className="h-3.5 w-3.5 fill-gold text-gold" /> {lawyer.rating || "4.9"}
                            <span className="text-gray-400 font-normal">({lawyer.reviews_count || 12})</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5 text-gray-400" /> {lawyer.experience_years} yrs exp
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-2 pt-2">
                        <div>
                          <span className="text-[10px] text-gray-400 uppercase font-semibold">Consultation</span>
                          <p className="text-base font-bold text-slate-900">${lawyer.fee_per_hour}<span className="text-xs font-normal text-gray-500">/hr</span></p>
                        </div>
                        <div className="flex gap-2">
                          <Link
                            href={`/lawyers/${lawyer.id}`}
                            className="btn-outline text-xs py-2 px-3.5 rounded-lg"
                          >
                            Profile
                          </Link>
                          <Link
                            href={`/book?lawyer=${lawyer.id}`}
                            className="btn-primary text-xs py-2 px-3.5 rounded-lg shadow-sm"
                          >
                            Book
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
