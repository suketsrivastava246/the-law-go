"use client";

import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import API_BASE from "@/lib/api";
import {
  CalendarCheck, LockKeyhole, BookOpen,
  ArrowRight, UserCheck, ChevronLeft, ChevronRight
} from "lucide-react";

type HeroSlide = {
  id: number;
  title: string;
  subtitle?: string;
  image_url: string;
  button_text?: string;
  button_url?: string;
};

const DEFAULT_SLIDES: HeroSlide[] = [
  {
    id: 0,
    title: "Legal Guidance. Simplified for Everyone.",
    subtitle: "Connect with verified legal professionals, explore legal resources, and take the next step toward understanding your legal needs.",
    image_url: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=1000&auto=format&fit=crop",
    button_text: "Find a Lawyer",
    button_url: "/lawyers",
  },
  {
    id: -1,
    title: "Your Rights, Clearly Explained.",
    subtitle: "Access our library of constitutional articles, legal guides, and AI-powered preliminary legal advice — all in one place.",
    image_url: "https://images.unsplash.com/photo-1521791136064-7986c2920216?q=80&w=1000&auto=format&fit=crop",
    button_text: "Browse Resources",
    button_url: "/resources",
  },
  {
    id: -2,
    title: "Justice Is Just a Consultation Away.",
    subtitle: "Book a video, voice, or chat consultation with specialized attorneys. Transparent pricing, verified credentials.",
    image_url: "https://images.unsplash.com/photo-1453728013993-6d66e9c9123a?q=80&w=1000&auto=format&fit=crop",
    button_text: "Book Appointment",
    button_url: "/book",
  },
];

export default function Home() {
  const [slides, setSlides] = useState<HeroSlide[]>(DEFAULT_SLIDES);
  const [current, setCurrent] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // Fetch admin-managed slides from backend
  useEffect(() => {
    fetch(`${API_BASE}/api/hero-slides/`)
      .then((r) => r.json())
      .then((data: HeroSlide[]) => {
        if (data && data.length > 0) setSlides(data);
      })
      .catch(() => { /* fallback to defaults */ });
  }, []);

  const goTo = useCallback(
    (index: number) => {
      if (isAnimating) return;
      setIsAnimating(true);
      setCurrent((index + slides.length) % slides.length);
      setTimeout(() => setIsAnimating(false), 600);
    },
    [isAnimating, slides.length]
  );

  const next = useCallback(() => goTo(current + 1), [current, goTo]);
  const prev = useCallback(() => goTo(current - 1), [current, goTo]);

  // Auto-advance every 5 seconds
  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next, slides.length]);

  const slide = slides[current];

  return (
    <div className="flex flex-col min-h-screen">
      {/* ── Hero Section with Slideshow ── */}
      <section className="relative bg-primary text-white overflow-hidden" style={{ minHeight: "85vh" }}>

        {/* Background image (full-bleed behind everything) */}
        <div
          key={slide.id}
          className="absolute inset-0 z-0 bg-cover bg-center transition-all duration-700"
          style={{
            backgroundImage: `url('${slide.image_url}')`,
            filter: "brightness(0.25) saturate(0.6)",
          }}
        />

        {/* Content grid */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32 flex flex-col lg:flex-row items-center gap-12">
          {/* Left — Text */}
          <div
            key={`text-${slide.id}`}
            className="lg:w-1/2 space-y-8 text-center lg:text-left"
            style={{ animation: "fadeSlideIn 0.6s ease forwards" }}
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold leading-tight">
              {slide.title.split(".")[0]}
              {slide.title.includes(".") && (
                <>
                  .<br />
                  <span className="text-gold">{slide.title.split(".").slice(1).join(".").trim()}</span>
                </>
              )}
            </h1>
            {slide.subtitle && (
              <p className="text-lg md:text-xl text-gray-200 max-w-2xl mx-auto lg:mx-0">
                {slide.subtitle}
              </p>
            )}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link href={slide.button_url || "/lawyers"} className="btn-gold flex justify-center items-center gap-2">
                {slide.button_text || "Find a Lawyer"} <ArrowRight className="h-5 w-5" />
              </Link>
              <Link href="/resources" className="btn-outline border-white text-white hover:bg-white hover:text-primary flex justify-center items-center">
                Explore Legal Resources
              </Link>
            </div>
            <div className="pt-4">
              <Link href="/ai" className="inline-flex items-center gap-2 text-sm text-gray-300 hover:text-gold transition-colors font-medium">
                Need immediate preliminary info?{" "}
                <span className="underline underline-offset-4">Ask AI Assistant</span>
              </Link>
            </div>
          </div>

          {/* Right — Slide image card */}
          <div className="lg:w-1/2 mt-12 lg:mt-0 hidden md:flex items-center justify-center">
            <div className="relative w-full max-w-lg mx-auto" style={{ aspectRatio: "1 / 1" }}>
              <div
                key={`img-${slide.id}`}
                className="absolute inset-0 rounded-full shadow-2xl overflow-hidden border-4 border-slate-700/60"
                style={{ animation: "fadeSlideIn 0.6s ease forwards" }}
              >
                <img
                  src={slide.image_url}
                  alt={slide.title}
                  className="w-full h-full object-cover mix-blend-luminosity opacity-90"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/60 via-transparent to-transparent" />
              </div>

              {/* Slide number indicator */}
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {slides.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => goTo(i)}
                    className={`rounded-full transition-all duration-300 ${
                      i === current
                        ? "bg-gold w-6 h-2"
                        : "bg-white/40 w-2 h-2 hover:bg-white/70"
                    }`}
                    aria-label={`Go to slide ${i + 1}`}
                  />
                ))}
              </div>


            </div>
          </div>
        </div>

        {/* Prev / Next Arrow Controls */}
        {slides.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white/10 hover:bg-white/25 text-white rounded-full flex items-center justify-center border border-white/20 transition backdrop-blur-sm"
              aria-label="Previous slide"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={next}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white/10 hover:bg-white/25 text-white rounded-full flex items-center justify-center border border-white/20 transition backdrop-blur-sm"
              aria-label="Next slide"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}

        {/* Slide counter (mobile) */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2 md:hidden">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`rounded-full transition-all duration-300 ${
                i === current ? "bg-gold w-5 h-2" : "bg-white/40 w-2 h-2"
              }`}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      </section>

      {/* ── Keyframe CSS ── */}
      <style jsx global>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* ── Trust / Features Section ── */}
      <section className="section-padding bg-ivory">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-slate-900 mb-4">Why Choose THE LAW GO</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">A premium legal-tech platform designed to provide secure, reliable, and accessible legal assistance.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { icon: <UserCheck className="h-8 w-8" />, title: "Verified Legal Professionals", desc: "Every lawyer on our platform goes through a strict verification process to ensure credibility." },
            { icon: <CalendarCheck className="h-8 w-8" />, title: "Easy Appointment Booking", desc: "Schedule video, voice, or chat consultations seamlessly matching your availability." },
            { icon: <LockKeyhole className="h-8 w-8" />, title: "Secure Communication", desc: "Your privacy is paramount. We provide secure channels for all attorney-client interactions." },
            { icon: <BookOpen className="h-8 w-8" />, title: "Legal Knowledge", desc: "Access a vast repository of legal resources, articles, and AI-powered preliminary guidance." },
          ].map((f) => (
            <div key={f.title} className="card p-8 text-center flex flex-col items-center">
              <div className="bg-blue-50 p-4 rounded-full text-primary mb-6">{f.icon}</div>
              <h3 className="text-xl font-bold mb-3 text-slate-800">{f.title}</h3>
              <p className="text-gray-600 text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="section-padding bg-white">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-slate-900 mb-4">How THE LAW GO Works</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">Get legal assistance in three simple steps.</p>
        </div>
        <div className="relative max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { n: 1, title: "Describe Your Need", desc: "Use our AI assistant or browse categories to define your legal requirement clearly." },
              { n: 2, title: "Find the Right Professional", desc: "Search our directory and filter by specialization, experience, and consultation fee." },
              { n: 3, title: "Book a Consultation", desc: "Select a convenient time slot and connect securely via our integrated platform." },
            ].map((s) => (
              <div key={s.n} className="text-center relative">
                <div className="w-24 h-24 mx-auto bg-primary text-white rounded-full flex items-center justify-center text-2xl font-bold shadow-lg mb-6 border-4 border-white">
                  {s.n}
                </div>
                <h3 className="text-xl font-bold mb-3 text-slate-800">{s.title}</h3>
                <p className="text-gray-600">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="bg-primary-dark text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-3xl md:text-4xl font-serif font-bold">Empowering Citizens with Legal Literacy</h2>
          <p className="text-lg text-gray-300">
            We believe that access to legal knowledge is a fundamental right. Explore our digital library to understand your rights, read simplified legal news, and make informed decisions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
            <Link href="/auth/register" className="btn-gold">Create an Account</Link>
            <Link href="/resources" className="btn-outline border-gray-400 text-gray-200 hover:border-white hover:bg-white hover:text-primary-dark">
              Browse Library
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
