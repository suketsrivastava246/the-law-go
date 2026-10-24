import Link from "next/link";
import { Scale } from "lucide-react";

export default function Footer() {
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
            <p className="text-sm leading-relaxed max-w-xs">
              A digital legal consultancy platform connecting common people with verified legal professionals and essential legal resources.
            </p>
            <div className="flex space-x-4 pt-2">
              <a href="#" className="text-gray-400 hover:text-gold transition-colors text-sm">
                Facebook
              </a>
              <a href="#" className="text-gray-400 hover:text-gold transition-colors text-sm">
                LinkedIn
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

          {/* Contact & Legal */}
          <div>
            <h3 className="text-white font-semibold mb-4 uppercase text-sm tracking-wider">Contact & Legal</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <a href="mailto:support@thelawgo.com" className="hover:text-gold transition-colors">support@thelawgo.com</a>
              </li>
              <li>
                <a href="tel:+1234567890" className="hover:text-gold transition-colors">+1 (234) 567-890</a>
              </li>
              <li className="pt-2">
                <Link href="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link>
              </li>
              <li>
                <Link href="/terms-of-use" className="hover:text-white transition-colors">Terms of Use</Link>
              </li>
              <li>
                <Link href="/disclaimer" className="hover:text-white transition-colors text-xs text-gray-500">Legal Disclaimer</Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-400">
            © 2026 THE LAW GO. All rights reserved.
          </p>
          <p className="text-xs text-gray-500 text-center md:text-right max-w-xl">
            This platform is a prototype. Lawyers shown are for demonstration purposes only. Always consult verified professionals for actual legal matters.
          </p>
        </div>
      </div>
    </footer>
  );
}
