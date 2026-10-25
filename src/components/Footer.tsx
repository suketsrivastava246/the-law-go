"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Scale, Mail, Phone, ExternalLink } from "lucide-react";
import API_BASE from "@/lib/api";

export default function Footer() {
  const [settings, setSettings] = useState({
    support_email: "support@thelawgo.com",
    contact_email: "contact@thelawgo.com",
    phone: "+1 (234) 567-890",
    linkedin_url: "https://www.linkedin.com/company/the-law-go",
    office_address: "Empire State Building, Suite 4800, New York, NY 10118",
  });

  useEffect(() => {
    fetch(`${API_BASE}/api/site-settings`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setSettings((prev) => ({ ...prev, ...data }));
      })
      .catch((err) => console.error("Error loading site settings in footer", err));
  }, []);

  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2 text-white">
              <Scale className="h-8 w-8 text-gold" />
              <span className="font-serif font-bold text-xl tracking-wider">THE LAW GO</span>
            </Link>
            <p className="text-sm leading-relaxed max-w-xs text-gray-400">
              A digital legal consultancy platform connecting common people with verified legal professionals and essential legal resources.
            </p>
            <div className="flex space-x-4 pt-2">
              <a 
                href={settings.linkedin_url || "https://www.linkedin.com/company/the-law-go"} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-gold transition-colors text-sm flex items-center gap-1 font-semibold"
              >
                LinkedIn <ExternalLink className="h-3 w-3" />
              </a>
              <a href="#" className="text-gray-400 hover:text-gold transition-colors text-sm">
                Twitter
              </a>
              <a href="#" className="text-gray-400 hover:text-gold transition-colors text-sm">
                Instagram
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4 uppercase text-sm tracking-wider">Quick Links</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/" className="hover:text-gold transition-colors">Home</Link>
              </li>
              <li>
                <Link href="/lawyers" className="hover:text-gold transition-colors">Find a Lawyer</Link>
              </li>
              <li>
                <Link href="/book" className="hover:text-gold transition-colors">Book Consultation</Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-gold transition-colors">User Dashboard</Link>
              </li>
            </ul>
          </div>

          {/* Legal Resources */}
          <div>
            <h3 className="text-white font-semibold mb-4 uppercase text-sm tracking-wider">Resources</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/resources" className="hover:text-gold transition-colors">Legal Library</Link>
              </li>
              <li>
                <Link href="/news" className="hover:text-gold transition-colors">News & Insights</Link>
              </li>
              <li>
                <Link href="/ai" className="hover:text-gold transition-colors">AI Legal Assistant</Link>
              </li>
              <li>
                <Link href="/auth/lawyer-registration" className="hover:text-gold transition-colors">Join as a Lawyer</Link>
              </li>
            </ul>
          </div>

          {/* Contact & Support (Admin Configured) */}
          <div>
            <h3 className="text-white font-semibold mb-4 uppercase text-sm tracking-wider">Official Contact & Support</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <a href={`mailto:${settings.support_email}`} className="hover:text-gold transition-colors flex items-center gap-1.5 text-xs sm:text-sm">
                  <Mail className="h-3.5 w-3.5 text-gold shrink-0" />
                  <span className="truncate">{settings.support_email}</span>
                </a>
              </li>
              <li>
                <a href={`tel:${settings.phone}`} className="hover:text-gold transition-colors flex items-center gap-1.5 text-xs sm:text-sm">
                  <Phone className="h-3.5 w-3.5 text-gold shrink-0" />
                  <span>{settings.phone}</span>
                </a>
              </li>
              <li className="text-xs text-gray-400 pt-1">
                {settings.office_address}
              </li>
              <li className="pt-2">
                <Link href="/resources/1" className="hover:text-white transition-colors text-xs text-gray-400">Privacy & Confidentiality</Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-400">
            © 2026 THE LAW GO. All rights reserved.
          </p>
          <p className="text-xs text-gray-500 text-center md:text-right max-w-xl">
            This platform is a digital legal infrastructure prototype. Always consult verified legal professionals for formal judicial proceedings.
          </p>
        </div>
      </div>
    </footer>
  );
}
