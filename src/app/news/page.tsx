"use client";

import { Search, TrendingUp, Calendar, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const NEWS = [
  {
    id: 1,
    title: "New Supreme Court Ruling on Digital Privacy",
    category: "Cyber Law",
    date: "Sep 18, 2026",
    summary: "The recent ruling establishes new precedents for how personal data can be processed by tech companies...",
    image: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=600&auto=format&fit=crop"
  },
  {
    id: 2,
    title: "Understanding the 2026 Corporate Tax Amendments",
    category: "Taxation",
    date: "Sep 15, 2026",
    summary: "Expert analysis on how the new corporate tax amendments will affect small and medium enterprises...",
    image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?q=80&w=600&auto=format&fit=crop"
  },
  {
    id: 3,
    title: "Changes in Property Dispute Resolutions",
    category: "Civil Law",
    date: "Sep 10, 2026",
    summary: "A look at the streamlined procedures introduced for resolving commercial property disputes...",
    image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=600&auto=format&fit=crop"
  }
];

export default function NewsPage() {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="bg-ivory min-h-screen pb-20">
      <div className="bg-primary text-white py-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <TrendingUp className="h-12 w-12 text-gold mx-auto mb-4" />
          <h1 className="text-3xl md:text-5xl font-serif font-bold mb-4">Legal News & Insights</h1>
          <p className="text-gray-300 max-w-2xl mx-auto mb-8 text-lg">
            Stay updated with the latest legal developments and expert analyses.
          </p>
          
          <div className="max-w-2xl mx-auto relative flex items-center">
            <Search className="absolute left-4 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search news and insights..."
              className="w-full pl-12 pr-4 py-4 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-gold shadow-lg"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {NEWS.filter(n => n.title.toLowerCase().includes(searchTerm.toLowerCase())).map((article) => (
            <div key={article.id} className="card overflow-hidden flex flex-col hover:-translate-y-1 transition-transform duration-300">
              <img src={article.image} alt={article.title} className="w-full h-48 object-cover" />
              <div className="p-6 flex flex-col flex-grow">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-primary bg-blue-50 px-3 py-1 rounded-full uppercase tracking-wider">
                    {article.category}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-gray-500 font-medium">
                    <Calendar className="h-3 w-3" /> {article.date}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3 leading-tight">{article.title}</h3>
                <p className="text-gray-600 mb-6 text-sm flex-grow">{article.summary}</p>
                <Link href={`/resources/${article.id}`} className="text-primary font-semibold text-sm flex items-center gap-1 hover:text-gold transition-colors mt-auto">
                  Read Full Article <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
