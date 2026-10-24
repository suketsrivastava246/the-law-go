"use client";
import API_BASE from "@/lib/api";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Book, FileText, Scale, Landmark, Shield, AlertCircle, ArrowRight, Clock, MapPin } from "lucide-react";
import { fetchAPI } from "@/lib/api";

const CATEGORIES = [
  { name: "All", icon: Book },
  { name: "Constitution", icon: Landmark },
  { name: "Criminal Law", icon: AlertCircle },
  { name: "Corporate Law", icon: FileText },
  { name: "Family Law", icon: Shield },
  { name: "Cyber Crime", icon: Scale },
  { name: "Taxation", icon: FileText },
];

export default function ResourcesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadResources = async () => {
      try {
        const data = await fetchAPI("/resources/");
        if (data && data.length > 0) {
          setResources(data);
        }
      } catch (err) {
        console.error("Failed to load resources from backend", err);
      } finally {
        setLoading(false);
      }
    };
    loadResources();
  }, []);

  const filteredResources = resources.filter((res) => {
    const matchesSearch = 
      res.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      res.summary.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = activeCategory === "All" || res.category.toLowerCase().includes(activeCategory.toLowerCase());
    return matchesSearch && matchesCat;
  });

  return (
    <div className="bg-ivory min-h-screen pb-20">
      
      {/* Header */}
      <div className="bg-primary text-white py-14 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-block bg-gold/20 text-gold text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full mb-3">
            Digital Legal Knowledge Base
          </div>
          <h1 className="text-3xl md:text-5xl font-serif font-bold mb-4">Legal Resources & Digital Library</h1>
          <p className="text-gray-300 max-w-2xl mx-auto mb-8 text-sm md:text-base">
            Authoritative educational articles, statutory breakdowns, and practical primers curated by legal professionals.
          </p>

          {/* Search Box */}
          <div className="max-w-2xl mx-auto relative flex items-center">
            <Search className="absolute left-4 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search legal articles, acts, or procedures..."
              className="w-full pl-12 pr-4 py-3.5 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-gold shadow-lg text-sm md:text-base"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        
        {/* Categories Bar */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-8 no-scrollbar">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.name;
            return (
              <button
                key={cat.name}
                onClick={() => setActiveCategory(cat.name)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition shadow-sm ${
                  isActive 
                    ? "bg-primary text-white ring-2 ring-primary/20" 
                    : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? "text-gold" : "text-gray-400"}`} />
                {cat.name}
              </button>
            );
          })}
        </div>

        {/* Resources Grid */}
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-sm text-gray-500">Loading library resources...</p>
          </div>
        ) : filteredResources.length === 0 ? (
          <div className="card p-12 text-center bg-white border border-dashed border-gray-300 rounded-2xl">
            <Book className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-800">No resources found</h3>
            <p className="text-gray-500 text-sm max-w-sm mx-auto mb-4">
              Try searching with another keyword or selecting "All" categories.
            </p>
            <button onClick={() => { setSearchTerm(""); setActiveCategory("All"); }} className="btn-primary text-xs py-2 px-4">
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResources.map((res) => (
              <div key={res.id} className="card p-6 flex flex-col justify-between hover:shadow-lg transition-shadow border border-gray-200/80">
                <div>
                  <div className="flex items-center justify-between mb-3 text-xs">
                    <span className="font-semibold text-primary uppercase tracking-wider bg-blue-50 px-2.5 py-1 rounded-md">
                      {res.category}
                    </span>
                    <span className="text-gray-400 flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {res.read_time || "5 min read"}
                    </span>
                  </div>
                  <h3 className="font-serif font-bold text-lg text-slate-900 mb-2 leading-snug">
                    {res.title}
                  </h3>
                  <p className="text-gray-600 text-xs md:text-sm line-clamp-3 mb-4 leading-relaxed">
                    {res.summary}
                  </p>
                </div>
                
                <div className="pt-4 border-t border-gray-100 flex items-center justify-between mt-auto">
                  <span className="text-xs text-gray-400 font-medium">
                    {res.jurisdiction || "Federal"}
                  </span>
                  <Link 
                    href={`/resources/${res.id}`} 
                    className="text-primary font-semibold text-xs flex items-center gap-1 hover:text-gold transition-colors"
                  >
                    Read Full Article <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

