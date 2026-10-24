"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import API_BASE from "@/lib/api";
import {
  Shield, Trash2, Edit3, Plus, Scale, BookOpen,
  CheckCircle2, AlertCircle, Search, RefreshCw, X, ArrowLeft,
  Check, Lock, ExternalLink, Image as ImageIcon, EyeOff, Eye, GripVertical
} from "lucide-react";
import { fetchAPI } from "@/lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────
type Lawyer = {
  id: number;
  user_id: number;
  specialization: string;
  experience_years: number;
  bar_number: string;
  qualifications: string;
  location: string;
  fee_per_hour: number;
  about: string;
  is_verified: boolean;
  avatar_url?: string;
  user: { id: number; full_name: string; email: string; phone: string; role: string };
};

type Resource = {
  id: number;
  title: string;
  category: string;
  summary: string;
  content: string;
  author: string;
  read_time: string;
  jurisdiction: string;
  created_at?: string;
};

type HeroSlide = {
  id: number;
  title: string;
  subtitle?: string;
  image_url: string;
  button_text?: string;
  button_url?: string;
  sort_order: number;
  is_active: boolean;
  created_at?: string;
};

const BLANK_SLIDE: Omit<HeroSlide, "id" | "created_at"> = {
  title: "",
  subtitle: "",
  image_url: "",
  button_text: "Find a Lawyer",
  button_url: "/lawyers",
  sort_order: 0,
  is_active: true,
};

// ─── Component ────────────────────────────────────────────────────────────────
export default function AdminPortal() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"lawyers" | "documents" | "slides">("lawyers");

  // Lawyers state
  const [lawyers, setLawyers] = useState<Lawyer[]>([]);
  const [lawyersLoading, setLawyersLoading] = useState(false);
  const [lawyerSearch, setLawyerSearch] = useState("");
  const [lawyerToDelete, setLawyerToDelete] = useState<Lawyer | null>(null);

  // Documents state
  const [resources, setResources] = useState<Resource[]>([]);
  const [resourcesLoading, setResourcesLoading] = useState(false);
  const [resourceSearch, setResourceSearch] = useState("");
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [isCreatingResource, setIsCreatingResource] = useState(false);

  // Hero Slides state
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [slidesLoading, setSlidesLoading] = useState(false);
  const [editingSlide, setEditingSlide] = useState<HeroSlide | null>(null);
  const [isCreatingSlide, setIsCreatingSlide] = useState(false);
  const [slideToDelete, setSlideToDelete] = useState<HeroSlide | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");

  // Toast
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // ── Auth ──────────────────────────────────────────────────────────────────
  const checkAdminAuth = async () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) { setCurrentUser(null); setAuthLoading(false); return; }
    try {
      const res = await fetch("${API_BASE}/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setCurrentUser(await res.json());
      else setCurrentUser(null);
    } catch { setCurrentUser(null); }
    finally { setAuthLoading(false); }
  };
  useEffect(() => { checkAdminAuth(); }, []);

  const loginAsAdmin = async () => {
    setAuthLoading(true);
    try {
      const res = await fetch("${API_BASE}/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ username: "admin@thelawgo.com", password: "admin123" }),
      });
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem("token", data.access_token);
        window.dispatchEvent(new Event("storage"));
        await checkAdminAuth();
      }
    } catch (err) { console.error(err); }
    finally { setAuthLoading(false); }
  };

  // ── Load Data ─────────────────────────────────────────────────────────────
  const loadLawyers = async () => {
    setLawyersLoading(true);
    try {
      const data = await fetchAPI("/lawyers/admin/all");
      if (data) setLawyers(data);
    } catch {
      try { const fb = await fetchAPI("/lawyers"); if (fb) setLawyers(fb); } catch { /* ignore */ }
    } finally { setLawyersLoading(false); }
  };

  const loadResources = async () => {
    setResourcesLoading(true);
    try { const data = await fetchAPI("/resources/"); if (data) setResources(data); }
    catch { /* ignore */ }
    finally { setResourcesLoading(false); }
  };

  const loadSlides = async () => {
    setSlidesLoading(true);
    try { const data = await fetchAPI("/hero-slides/admin/all"); if (data) setSlides(data); }
    catch { /* ignore */ }
    finally { setSlidesLoading(false); }
  };

  useEffect(() => {
    if (currentUser?.role === "admin") {
      loadLawyers();
      loadResources();
      loadSlides();
    }
  }, [currentUser]);

  // ── Lawyer Actions ────────────────────────────────────────────────────────
  const confirmDeleteLawyer = async () => {
    if (!lawyerToDelete) return;
    try {
      await fetchAPI(`/lawyers/${lawyerToDelete.id}`, { method: "DELETE" });
      setLawyers((p) => p.filter((l) => l.id !== lawyerToDelete.id));
      showToast(`Adv. ${lawyerToDelete.user?.full_name} removed.`);
      setLawyerToDelete(null);
    } catch (err: any) { showToast(err.message || "Failed", "error"); }
  };

  const handleVerifyLawyer = async (id: number) => {
    try { await fetchAPI(`/lawyers/${id}/verify`, { method: "POST" }); showToast("Lawyer verified!"); loadLawyers(); }
    catch (err: any) { showToast(err.message || "Failed", "error"); }
  };

  // ── Resource Actions ──────────────────────────────────────────────────────
  const handleSaveResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingResource) return;
    try {
      if (isCreatingResource) {
        const created = await fetchAPI("/resources/", { method: "POST", body: JSON.stringify(editingResource) });
        setResources((p) => [...p, created]);
        showToast("Document created.");
      } else {
        const updated = await fetchAPI(`/resources/${editingResource.id}`, { method: "PUT", body: JSON.stringify(editingResource) });
        setResources((p) => p.map((r) => (r.id === updated.id ? updated : r)));
        showToast(`"${editingResource.title}" updated.`);
      }
      setEditingResource(null); setIsCreatingResource(false);
    } catch (err: any) { showToast(err.message || "Failed", "error"); }
  };

  const handleDeleteResource = async (id: number, title: string) => {
    if (!confirm(`Delete "${title}"?`)) return;
    try { await fetchAPI(`/resources/${id}`, { method: "DELETE" }); setResources((p) => p.filter((r) => r.id !== id)); showToast(`"${title}" deleted.`); }
    catch (err: any) { showToast(err.message || "Failed", "error"); }
  };

  // ── Hero Slide Actions ────────────────────────────────────────────────────
  const handleSaveSlide = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSlide) return;
    try {
      const payload = {
        title: editingSlide.title,
        subtitle: editingSlide.subtitle,
        image_url: editingSlide.image_url,
        button_text: editingSlide.button_text,
        button_url: editingSlide.button_url,
        sort_order: editingSlide.sort_order,
        is_active: editingSlide.is_active,
      };
      if (isCreatingSlide) {
        const created = await fetchAPI("/hero-slides/", { method: "POST", body: JSON.stringify(payload) });
        setSlides((p) => [...p, created]);
        showToast("Hero slide created and published!");
      } else {
        const updated = await fetchAPI(`/hero-slides/${editingSlide.id}`, { method: "PUT", body: JSON.stringify(payload) });
        setSlides((p) => p.map((s) => (s.id === updated.id ? updated : s)));
        showToast("Hero slide updated!");
      }
      setEditingSlide(null); setIsCreatingSlide(false); setPreviewUrl("");
    } catch (err: any) { showToast(err.message || "Failed to save slide", "error"); }
  };

  const handleToggleSlide = async (slide: HeroSlide) => {
    try {
      const updated = await fetchAPI(`/hero-slides/${slide.id}`, {
        method: "PUT",
        body: JSON.stringify({ ...slide, is_active: !slide.is_active }),
      });
      setSlides((p) => p.map((s) => (s.id === updated.id ? updated : s)));
      showToast(`Slide "${slide.title}" ${updated.is_active ? "activated" : "hidden"}.`);
    } catch (err: any) { showToast(err.message || "Failed", "error"); }
  };

  const confirmDeleteSlide = async () => {
    if (!slideToDelete) return;
    try {
      await fetchAPI(`/hero-slides/${slideToDelete.id}`, { method: "DELETE" });
      setSlides((p) => p.filter((s) => s.id !== slideToDelete.id));
      showToast(`Slide "${slideToDelete.title}" removed.`);
      setSlideToDelete(null);
    } catch (err: any) { showToast(err.message || "Failed", "error"); }
  };

  // ── Guards ────────────────────────────────────────────────────────────────
  if (authLoading) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center p-8">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium text-sm">Verifying administrative credentials...</p>
        </div>
      </div>
    );
  }

  if (!currentUser || currentUser.role !== "admin") {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center p-4 py-16">
        <div className="card max-w-md w-full p-8 md:p-10 text-center shadow-lg border border-gray-200">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <Lock className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-serif font-bold text-slate-900 mb-2">Admin Portal Restricted</h1>
          <p className="text-gray-600 text-sm mb-6 leading-relaxed">
            This section is protected and requires System Administrator privileges.
          </p>
          <div className="space-y-3">
            <button onClick={loginAsAdmin} className="btn-primary w-full flex items-center justify-center gap-2 py-3 text-sm font-semibold">
              <Shield className="h-4 w-4 text-gold" /> One-Click Sign In as Admin
            </button>
            <Link href="/auth/login" className="btn-outline w-full block py-2.5 text-sm font-semibold">
              Enter Administrator Credentials
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const filteredLawyers = lawyers.filter((l) => {
    const q = lawyerSearch.toLowerCase();
    return (l.user?.full_name?.toLowerCase().includes(q) || l.specialization?.toLowerCase().includes(q) || l.bar_number?.toLowerCase().includes(q) || (l.location && l.location.toLowerCase().includes(q)));
  });

  const filteredResources = resources.filter((r) => {
    const q = resourceSearch.toLowerCase();
    return r.title.toLowerCase().includes(q) || r.category.toLowerCase().includes(q) || r.summary.toLowerCase().includes(q);
  });

  return (
    <div className="bg-ivory min-h-screen pb-20">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-24 right-6 z-50 p-4 rounded-xl shadow-xl flex items-center gap-3 text-sm font-medium border transition-all ${toast.type === "success" ? "bg-emerald-900 text-white border-emerald-700" : "bg-red-900 text-white border-red-700"}`}>
          {toast.type === "success" ? <CheckCircle2 className="h-5 w-5 text-emerald-400" /> : <AlertCircle className="h-5 w-5 text-red-400" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Admin Header */}
      <div className="bg-primary text-white py-10 px-4 sm:px-6 lg:px-8 border-b border-blue-900 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gold text-primary flex items-center justify-center font-bold text-xl shadow-md">
              <Shield className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl md:text-3xl font-serif font-bold tracking-tight">Admin Control Portal</h1>
                <span className="bg-gold text-primary text-[10px] font-bold uppercase px-2 py-0.5 rounded-full">Superuser</span>
              </div>
              <p className="text-gray-300 text-xs md:text-sm mt-0.5">
                Logged in as <span className="text-gold font-semibold">{currentUser.email}</span> ({currentUser.full_name})
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="btn-outline border-blue-400 text-white hover:bg-white hover:text-primary text-xs py-2 px-3 font-semibold rounded-lg flex items-center gap-1.5">
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Dashboard
            </Link>
            <Link href="/" className="bg-blue-900/60 hover:bg-blue-800 text-gray-200 text-xs py-2 px-3 font-semibold rounded-lg flex items-center gap-1.5 border border-blue-700">
              <ExternalLink className="h-3.5 w-3.5" /> View Public Site
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-8 space-x-2">
          {[
            { key: "lawyers", label: `Manage Lawyers (${lawyers.length})`, icon: <Scale className="h-4 w-4" /> },
            { key: "documents", label: `Legal Documents (${resources.length})`, icon: <BookOpen className="h-4 w-4" /> },
            { key: "slides", label: `Hero Slides (${slides.length})`, icon: <ImageIcon className="h-4 w-4" /> },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-2 py-3 px-5 text-sm font-bold border-b-2 transition ${activeTab === tab.key ? "border-primary text-primary bg-white rounded-t-lg shadow-xs" : "border-transparent text-gray-500 hover:text-slate-800"}`}
            >
              {tab.icon}<span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* ══ TAB 1: LAWYER MANAGEMENT ══════════════════════════════════════ */}
        {activeTab === "lawyers" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <div className="relative w-full sm:w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input type="text" placeholder="Search by name, specialization, bar number..." value={lawyerSearch} onChange={(e) => setLawyerSearch(e.target.value)} className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary" />
              </div>
              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                <button onClick={loadLawyers} className="btn-outline text-xs py-2 px-3 flex items-center gap-1.5"><RefreshCw className="h-3.5 w-3.5" /> Refresh</button>
                <Link href="/auth/lawyer-registration" className="btn-primary text-xs py-2 px-3 flex items-center gap-1.5"><Plus className="h-3.5 w-3.5" /> Register New Attorney</Link>
              </div>
            </div>

            {lawyersLoading ? (
              <div className="py-20 text-center"><div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" /><p className="text-sm text-gray-500">Loading attorneys...</p></div>
            ) : filteredLawyers.length === 0 ? (
              <div className="card p-12 text-center"><Scale className="h-12 w-12 text-gray-300 mx-auto mb-3" /><h3 className="text-base font-bold text-slate-800">No lawyers found</h3></div>
            ) : (
              <div className="card overflow-hidden border border-gray-200 shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase font-bold text-gray-600">
                        <th className="py-3.5 px-4">Attorney</th>
                        <th className="py-3.5 px-4">Specialization</th>
                        <th className="py-3.5 px-4">Bar Reg. #</th>
                        <th className="py-3.5 px-4">Experience / Rate</th>
                        <th className="py-3.5 px-4">Status</th>
                        <th className="py-3.5 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredLawyers.map((lawyer) => (
                        <tr key={lawyer.id} className="hover:bg-blue-50/40 transition">
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              {lawyer.avatar_url ? (
                                <img src={lawyer.avatar_url} alt={lawyer.user?.full_name} className="w-10 h-10 rounded-full object-cover border border-gray-200" />
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">{lawyer.user?.full_name?.charAt(0) || "L"}</div>
                              )}
                              <div>
                                <p className="font-bold text-slate-900">{lawyer.user?.full_name}</p>
                                <p className="text-xs text-gray-500">{lawyer.user?.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4"><span className="font-medium text-slate-800">{lawyer.specialization}</span><p className="text-xs text-gray-400">{lawyer.location || "Remote"}</p></td>
                          <td className="py-4 px-4 font-mono text-xs font-semibold text-slate-700">{lawyer.bar_number}</td>
                          <td className="py-4 px-4"><p className="font-semibold text-slate-800">{lawyer.experience_years} years</p><p className="text-xs text-primary font-bold">${lawyer.fee_per_hour}/hr</p></td>
                          <td className="py-4 px-4">
                            {lawyer.is_verified ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase bg-green-100 text-green-800 px-2 py-0.5 rounded-full"><Check className="h-3 w-3" /> Verified</span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">Pending Review</span>
                            )}
                          </td>
                          <td className="py-4 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {!lawyer.is_verified && (
                                <button onClick={() => handleVerifyLawyer(lawyer.id)} className="bg-green-600 hover:bg-green-700 text-white text-xs font-semibold py-1.5 px-2.5 rounded-md transition">Approve</button>
                              )}
                              <Link href={`/lawyers/${lawyer.id}`} className="btn-outline py-1.5 px-2.5 text-xs font-semibold rounded-md">View</Link>
                              <button onClick={() => setLawyerToDelete(lawyer)} className="bg-red-50 hover:bg-red-600 text-red-600 hover:text-white border border-red-200 hover:border-red-600 py-1.5 px-2.5 text-xs font-bold rounded-md transition flex items-center gap-1">
                                <Trash2 className="h-3.5 w-3.5" /><span>Remove</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══ TAB 2: DOCUMENTS ═══════════════════════════════════════════════ */}
        {activeTab === "documents" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <div className="relative w-full sm:w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input type="text" placeholder="Search articles by title, category..." value={resourceSearch} onChange={(e) => setResourceSearch(e.target.value)} className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary" />
              </div>
              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                <button onClick={loadResources} className="btn-outline text-xs py-2 px-3 flex items-center gap-1.5"><RefreshCw className="h-3.5 w-3.5" /> Refresh</button>
                <button
                  onClick={() => { setIsCreatingResource(true); setEditingResource({ id: 0, title: "", category: "Constitution", summary: "", content: "", author: "THE LAW GO Editorial Bureau", read_time: "5 min read", jurisdiction: "Federal / National" }); }}
                  className="btn-primary text-xs py-2 px-3 flex items-center gap-1.5"
                ><Plus className="h-3.5 w-3.5" /> Add New Legal Document</button>
              </div>
            </div>

            {resourcesLoading ? (
              <div className="py-20 text-center"><div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" /></div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredResources.map((res) => {
                  const isConstitution = res.category.toLowerCase().includes("constitution");
                  return (
                    <div key={res.id} className={`card p-6 flex flex-col justify-between border transition shadow-sm hover:shadow-md ${isConstitution ? "border-amber-300 bg-amber-50/20" : "border-gray-200"}`}>
                      <div>
                        <div className="flex items-center justify-between mb-3 text-xs">
                          <span className={`font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${isConstitution ? "bg-amber-100 text-amber-900 border border-amber-300" : "bg-blue-50 text-primary"}`}>{res.category} {isConstitution && "★"}</span>
                          <span className="text-gray-400 font-medium">{res.read_time}</span>
                        </div>
                        <h3 className="font-serif font-bold text-lg text-slate-900 mb-2 leading-snug">{res.title}</h3>
                        <p className="text-xs text-gray-600 line-clamp-3 mb-4 leading-relaxed">{res.summary}</p>
                      </div>
                      <div className="pt-4 border-t border-gray-100 flex items-center justify-between mt-auto">
                        <span className="text-xs text-gray-400 font-medium">{res.jurisdiction}</span>
                        <div className="flex items-center gap-2">
                          <Link href={`/resources/${res.id}`} className="btn-outline py-1.5 px-2.5 text-xs font-semibold rounded-md">View</Link>
                          <button onClick={() => { setIsCreatingResource(false); setEditingResource(res); }} className="bg-primary hover:bg-primary-dark text-white py-1.5 px-3 text-xs font-bold rounded-md transition flex items-center gap-1.5">
                            <Edit3 className="h-3.5 w-3.5 text-gold" /><span>Edit</span>
                          </button>
                          <button onClick={() => handleDeleteResource(res.id, res.title)} className="p-1.5 text-gray-400 hover:text-red-600 rounded-md transition"><Trash2 className="h-4 w-4" /></button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ══ TAB 3: HERO SLIDES ════════════════════════════════════════════ */}
        {activeTab === "slides" && (
          <div className="space-y-6">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <div>
                <p className="font-bold text-slate-800 text-sm">Homepage Hero Slideshow</p>
                <p className="text-xs text-gray-500 mt-0.5">Add, edit, or remove slides shown in the circular image area on the homepage. Active slides auto-rotate every 5 seconds.</p>
              </div>
              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                <button onClick={loadSlides} className="btn-outline text-xs py-2 px-3 flex items-center gap-1.5"><RefreshCw className="h-3.5 w-3.5" /> Refresh</button>
                <button
                  onClick={() => { setIsCreatingSlide(true); setPreviewUrl(""); setEditingSlide({ id: 0, ...BLANK_SLIDE }); }}
                  className="btn-primary text-xs py-2 px-3 flex items-center gap-1.5 shadow-sm"
                ><Plus className="h-3.5 w-3.5" /> Add New Slide</button>
              </div>
            </div>

            {slidesLoading ? (
              <div className="py-20 text-center"><div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" /><p className="text-sm text-gray-500">Loading slides...</p></div>
            ) : slides.length === 0 ? (
              <div className="card p-16 text-center border-2 border-dashed border-gray-200">
                <ImageIcon className="h-14 w-14 text-gray-300 mx-auto mb-4" />
                <h3 className="text-base font-bold text-slate-800 mb-1">No Hero Slides Yet</h3>
                <p className="text-xs text-gray-500 mb-5">The homepage shows 3 built-in default slides. Add your own to override them.</p>
                <button onClick={() => { setIsCreatingSlide(true); setPreviewUrl(""); setEditingSlide({ id: 0, ...BLANK_SLIDE }); }} className="btn-primary text-sm py-2 px-5 inline-flex items-center gap-2">
                  <Plus className="h-4 w-4" /> Add First Slide
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {slides.map((slide, idx) => (
                  <div key={slide.id} className={`card overflow-hidden border transition shadow-sm hover:shadow-lg group ${slide.is_active ? "border-primary/30" : "border-gray-200 opacity-60"}`}>
                    {/* Slide Image Preview */}
                    <div className="relative h-44 bg-slate-100 overflow-hidden">
                      {slide.image_url ? (
                        <img src={slide.image_url} alt={slide.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=400"; }} />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300"><ImageIcon className="h-12 w-12" /></div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 to-transparent" />
                      <div className="absolute top-2 left-2 flex gap-1.5">
                        <span className="text-[10px] font-bold uppercase bg-primary text-white px-2 py-0.5 rounded-full">Slide {idx + 1}</span>
                        {slide.is_active ? (
                          <span className="text-[10px] font-bold uppercase bg-green-500 text-white px-2 py-0.5 rounded-full">Active</span>
                        ) : (
                          <span className="text-[10px] font-bold uppercase bg-gray-500 text-white px-2 py-0.5 rounded-full">Hidden</span>
                        )}
                      </div>
                      <div className="absolute bottom-2 left-3 right-3">
                        <p className="text-white font-serif font-bold text-sm leading-tight line-clamp-2">{slide.title}</p>
                      </div>
                    </div>

                    {/* Card body */}
                    <div className="p-4">
                      {slide.subtitle && <p className="text-xs text-gray-500 line-clamp-2 mb-3">{slide.subtitle}</p>}
                      <div className="flex items-center gap-2 text-xs text-gray-400 mb-4">
                        <span className="bg-gray-100 px-2 py-0.5 rounded font-mono">{slide.button_url || "/"}</span>
                        <span>→</span>
                        <span className="font-semibold text-slate-600">{slide.button_text}</span>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 border-t border-gray-100 pt-3">
                        <button
                          onClick={() => handleToggleSlide(slide)}
                          title={slide.is_active ? "Hide slide" : "Show slide"}
                          className={`flex-1 py-1.5 text-xs font-semibold rounded-md flex items-center justify-center gap-1.5 transition ${slide.is_active ? "bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200" : "bg-green-50 text-green-700 hover:bg-green-100 border border-green-200"}`}
                        >
                          {slide.is_active ? <><EyeOff className="h-3.5 w-3.5" /> Hide</> : <><Eye className="h-3.5 w-3.5" /> Show</>}
                        </button>
                        <button
                          onClick={() => { setIsCreatingSlide(false); setPreviewUrl(slide.image_url); setEditingSlide(slide); }}
                          className="flex-1 bg-primary hover:bg-primary-dark text-white py-1.5 text-xs font-bold rounded-md transition flex items-center justify-center gap-1.5"
                        >
                          <Edit3 className="h-3.5 w-3.5 text-gold" /> Edit
                        </button>
                        <button
                          onClick={() => setSlideToDelete(slide)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition"
                          title="Delete slide"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ══ MODAL: Confirm Delete Lawyer ══════════════════════════════════════ */}
      {lawyerToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 md:p-8 shadow-2xl border border-gray-100">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4"><Trash2 className="h-6 w-6" /></div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Remove Lawyer Profile?</h3>
            <p className="text-sm text-gray-600 mb-6 leading-relaxed">Are you sure you want to remove <strong>{lawyerToDelete.user?.full_name}</strong> (Bar #{lawyerToDelete.bar_number})?</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setLawyerToDelete(null)} className="btn-outline text-xs py-2 px-4 font-semibold">Cancel</button>
              <button onClick={confirmDeleteLawyer} className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-2 px-4 rounded-lg transition">Yes, Remove Lawyer</button>
            </div>
          </div>
        </div>
      )}

      {/* ══ MODAL: Edit / Create Resource ═════════════════════════════════════ */}
      {editingResource && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 md:p-8 shadow-2xl border border-gray-100 my-8">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-6">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-primary flex items-center justify-center"><Edit3 className="h-5 w-5" /></div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">{isCreatingResource ? "Create Legal Document" : "Edit Legal Document"}</h3>
                  <p className="text-xs text-gray-500">Update article text, summary, or metadata</p>
                </div>
              </div>
              <button onClick={() => setEditingResource(null)} className="p-1.5 text-gray-400 hover:text-slate-800 rounded-lg"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleSaveResource} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Document Title</label>
                <input type="text" required value={editingResource.title} onChange={(e) => setEditingResource({ ...editingResource, title: e.target.value })} className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Category</label>
                  <select value={editingResource.category} onChange={(e) => setEditingResource({ ...editingResource, category: e.target.value })} className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary">
                    {["Constitution", "Criminal Law", "Corporate Law", "Family Law", "Civil & Property Law", "Cyber Crime", "Taxation", "Consumer Rights"].map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Jurisdiction</label>
                  <input type="text" value={editingResource.jurisdiction} onChange={(e) => setEditingResource({ ...editingResource, jurisdiction: e.target.value })} placeholder="e.g. Federal / National" className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Author</label>
                  <input type="text" value={editingResource.author} onChange={(e) => setEditingResource({ ...editingResource, author: e.target.value })} className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Read Time</label>
                  <input type="text" value={editingResource.read_time} onChange={(e) => setEditingResource({ ...editingResource, read_time: e.target.value })} placeholder="e.g. 6 min read" className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Executive Summary</label>
                <textarea rows={2} required value={editingResource.summary} onChange={(e) => setEditingResource({ ...editingResource, summary: e.target.value })} className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Full Content (Markdown Supported)</label>
                <textarea rows={8} required value={editingResource.content} onChange={(e) => setEditingResource({ ...editingResource, content: e.target.value })} className="w-full p-2.5 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-primary focus:border-primary text-xs" />
              </div>
              <div className="flex gap-3 justify-end pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setEditingResource(null)} className="btn-outline text-xs py-2 px-4 font-semibold">Cancel</button>
                <button type="submit" className="btn-primary text-xs py-2 px-5 font-bold shadow-md">Save & Publish</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══ MODAL: Confirm Delete Slide ═══════════════════════════════════════ */}
      {slideToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 md:p-8 shadow-2xl border border-gray-100">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4"><Trash2 className="h-6 w-6" /></div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Delete Hero Slide?</h3>
            <p className="text-sm text-gray-600 mb-6">Remove slide <strong>"{slideToDelete.title}"</strong>? It will disappear from the homepage immediately.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setSlideToDelete(null)} className="btn-outline text-xs py-2 px-4 font-semibold">Cancel</button>
              <button onClick={confirmDeleteSlide} className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-2 px-4 rounded-lg transition">Yes, Delete Slide</button>
            </div>
          </div>
        </div>
      )}

      {/* ══ MODAL: Edit / Create Hero Slide ══════════════════════════════════ */}
      {editingSlide && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 md:p-8 shadow-2xl border border-gray-100 my-8">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-6">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-primary flex items-center justify-center"><ImageIcon className="h-5 w-5" /></div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">{isCreatingSlide ? "Add New Hero Slide" : "Edit Hero Slide"}</h3>
                  <p className="text-xs text-gray-500">This slide will appear on the homepage hero section</p>
                </div>
              </div>
              <button onClick={() => { setEditingSlide(null); setPreviewUrl(""); }} className="p-1.5 text-gray-400 hover:text-slate-800 rounded-lg"><X className="h-5 w-5" /></button>
            </div>

            <form onSubmit={handleSaveSlide} className="space-y-4">
              {/* Image URL + live preview */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Image URL <span className="text-red-500">*</span></label>
                <input
                  type="url"
                  required
                  value={editingSlide.image_url}
                  onChange={(e) => { setEditingSlide({ ...editingSlide, image_url: e.target.value }); setPreviewUrl(e.target.value); }}
                  placeholder="https://images.unsplash.com/photo-... or your image link"
                  className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary"
                />
                <p className="text-[11px] text-gray-400 mt-1">💡 Use Unsplash, Pexels, or any public image URL. Recommended size: 1000×1000px.</p>
              </div>

              {/* Live Image Preview */}
              {previewUrl && (
                <div className="relative rounded-xl overflow-hidden h-40 border border-gray-200 bg-slate-100">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent flex items-end p-3">
                    <p className="text-white text-xs font-semibold">Preview — this is how it looks on the homepage</p>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Slide Title <span className="text-red-500">*</span></label>
                <input type="text" required value={editingSlide.title} onChange={(e) => setEditingSlide({ ...editingSlide, title: e.target.value })} placeholder="e.g. Legal Guidance. Simplified for Everyone." className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary" />
                <p className="text-[11px] text-gray-400 mt-1">Tip: Use a period (.) in the title to split it into two lines with a gold-colored second part.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Subtitle / Description</label>
                <textarea rows={2} value={editingSlide.subtitle || ""} onChange={(e) => setEditingSlide({ ...editingSlide, subtitle: e.target.value })} placeholder="Supporting text shown below the title..." className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Button Text</label>
                  <input type="text" value={editingSlide.button_text || ""} onChange={(e) => setEditingSlide({ ...editingSlide, button_text: e.target.value })} placeholder="e.g. Find a Lawyer" className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Button Link (URL)</label>
                  <input type="text" value={editingSlide.button_url || ""} onChange={(e) => setEditingSlide({ ...editingSlide, button_url: e.target.value })} placeholder="e.g. /lawyers or /resources" className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Sort Order</label>
                  <input type="number" min={0} value={editingSlide.sort_order} onChange={(e) => setEditingSlide({ ...editingSlide, sort_order: parseInt(e.target.value) || 0 })} className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary" />
                  <p className="text-[11px] text-gray-400 mt-1">Lower number = shown first (0, 1, 2…)</p>
                </div>
                <div className="flex flex-col justify-center">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Visibility</label>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative">
                      <input type="checkbox" checked={editingSlide.is_active} onChange={(e) => setEditingSlide({ ...editingSlide, is_active: e.target.checked })} className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-checked:bg-primary rounded-full transition-colors" />
                      <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform peer-checked:translate-x-5" />
                    </div>
                    <span className="text-sm font-semibold text-slate-700">{editingSlide.is_active ? "Visible on homepage" : "Hidden from homepage"}</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-gray-100">
                <button type="button" onClick={() => { setEditingSlide(null); setPreviewUrl(""); }} className="btn-outline text-xs py-2 px-4 font-semibold">Cancel</button>
                <button type="submit" className="btn-primary text-xs py-2 px-5 font-bold shadow-md flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-gold" />
                  {isCreatingSlide ? "Create & Publish Slide" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
