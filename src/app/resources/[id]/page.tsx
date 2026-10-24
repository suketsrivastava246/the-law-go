"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { ArrowLeft, BookOpen, Clock, Calendar, User, ShieldAlert, Scale, ChevronRight } from "lucide-react";
import API_BASE from "@/lib/api";

export default function ResourceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [resource, setResource] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchResource = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/resources/${resolvedParams.id}`);
        if (!res.ok) throw new Error("Legal article not found");
        const data = await res.json();
        setResource(data);
      } catch (err: any) {
        setError(err.message || "Failed to load resource");
      } finally {
        setLoading(false);
      }
    };
    fetchResource();
  }, [resolvedParams.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center p-8">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !resource) {
    return (
      <div className="min-h-screen bg-ivory py-20 px-4 text-center">
        <div className="max-w-md mx-auto card p-8">
          <h2 className="text-xl font-bold text-slate-900 mb-2">Article Not Found</h2>
          <p className="text-gray-600 text-sm mb-6">{error || "The requested legal document does not exist."}</p>
          <Link href="/resources" className="btn-primary inline-flex items-center gap-2 text-sm">
            <ArrowLeft className="h-4 w-4" /> Back to Knowledge Base
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-ivory min-h-screen pb-20">
      
      {/* Article Header */}
      <div className="bg-primary text-white py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <Link href="/resources" className="inline-flex items-center gap-2 text-gold hover:text-white text-xs font-semibold mb-6 transition">
            <ArrowLeft className="h-4 w-4" /> Back to Legal Library
          </Link>
          <div className="flex items-center gap-2 mb-3">
            <span className="bg-gold text-primary font-bold text-xs uppercase px-2.5 py-0.5 rounded">
              {resource.category}
            </span>
            <span className="text-xs text-gray-300">• {resource.jurisdiction || "Federal & National"}</span>
          </div>
          <h1 className="text-2xl md:text-4xl font-serif font-bold leading-tight mb-4 text-white">
            {resource.title}
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-xs text-gray-300">
            <span className="flex items-center gap-1.5"><User className="h-3.5 w-3.5 text-gold" /> {resource.author}</span>
            <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-gold" /> {resource.read_time}</span>
            <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5 text-gold" /> Published Recently</span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        
        {/* Legal Disclaimer Pill */}
        <div className="bg-blue-50 border border-blue-200 text-blue-900 p-4 rounded-xl text-xs md:text-sm flex items-start gap-3 mb-8">
          <ShieldAlert className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <p>
            <strong>Educational Disclaimer:</strong> This legal publication provides informational analysis of general principles. Statutory rules vary across states and municipalities. For specific legal representation, consult an attorney.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Article Content */}
          <div className="lg:col-span-2">
            <div className="card p-6 md:p-10 bg-white">
              <div className="border-b border-gray-100 pb-4 mb-6">
                <p className="text-base text-slate-700 italic font-serif leading-relaxed">
                  "{resource.summary}"
                </p>
              </div>

              {/* Render content paragraphs */}
              <div className="prose prose-slate max-w-none text-sm md:text-base text-gray-700 leading-relaxed space-y-4 whitespace-pre-line">
                {resource.content}
              </div>

              <div className="mt-10 pt-6 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                <span>Subject: {resource.category}</span>
                <span>Jurisdiction: {resource.jurisdiction}</span>
              </div>
            </div>
          </div>

          {/* Consultation CTA Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <div className="card p-6 sticky top-24 border border-gray-200">
              <div className="w-12 h-12 bg-blue-100 text-primary rounded-xl flex items-center justify-center mb-4">
                <Scale className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Need Advice On This Subject?</h3>
              <p className="text-xs text-gray-600 mb-6 leading-relaxed">
                Connect directly with our board-certified lawyers specializing in {resource.category} to review your facts in private consultation.
              </p>
              <div className="space-y-3">
                <Link href="/lawyers" className="btn-primary w-full text-center block py-2.5 text-xs font-semibold shadow-sm">
                  Find a Specialized Lawyer
                </Link>
                <Link href="/ai" className="btn-outline w-full text-center block py-2 text-xs font-semibold">
                  Ask AI Legal Assistant
                </Link>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
