"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import API_BASE from "@/lib/api";
import {
  Shield, Trash2, Edit3, Plus, Scale, BookOpen,
  CheckCircle2, AlertCircle, Search, RefreshCw, X, ArrowLeft,
  Check, Lock, ExternalLink, Image as ImageIcon, EyeOff, Eye, User, Phone, Mail
} from "lucide-react";
import { fetchAPI } from "@/lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────
type Lawyer = {
  id: number;
  user_id: number;
  full_name?: string;
  email?: string;
  phone?: string;
  specialization: string;
  experience_years: number;
  bar_number: string;
  qualifications: string;
  location: string;
  fee_per_hour: number;
  about: string;
  is_verified: boolean;
  avatar_url?: string;
  languages?: string;
  user?: {
    full_name: string;
    email: string;
    phone?: string;
  };
};

type Client = {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  role: string;
  is_active: boolean;
  appointments_count?: number;
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
  const [activeTab, setActiveTab] = useState<"lawyers" | "clients" | "documents" | "slides">("lawyers");

  // Lawyers state
  const [lawyers, setLawyers] = useState<Lawyer[]>([]);
  const [lawyersLoading, setLawyersLoading] = useState(false);
  const [lawyerSearch, setLawyerSearch] = useState("");
  const [lawyerToDelete, setLawyerToDelete] = useState<Lawyer | null>(null);
  const [editingLawyer, setEditingLawyer] = useState<Lawyer | null>(null);

  // Clients state
  const [clients, setClients] = useState<Client[]>([]);
  const [clientsLoading, setClientsLoading] = useState(false);
  const [clientSearch, setClientSearch] = useState("");
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [isCreatingClient, setIsCreatingClient] = useState(false);

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
      const res = await fetch(`${API_BASE}/api/auth/me`, {
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
      const res = await fetch(`${API_BASE}/api/auth/login`, {
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

  const loadClients = async () => {
    setClientsLoading(true);
    try {
      const data = await fetchAPI("/clients");
      if (data) setClients(data);
    } catch (err) { console.error(err); }
    finally { setClientsLoading(false); }
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
      loadClients();
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
      showToast(`Adv. ${lawyerToDelete.user?.full_name || lawyerToDelete.full_name} removed.`);
      setLawyerToDelete(null);
    } catch (err: any) { showToast(err.message || "Failed", "error"); }
  };

  const handleVerifyLawyer = async (id: number) => {
    try { await fetchAPI(`/lawyers/${id}/verify`, { method: "POST" }); showToast("Lawyer verified!"); loadLawyers(); }
    catch (err: any) { showToast(err.message || "Failed", "error"); }
  };

  const handleSaveLawyer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLawyer) return;
    try {
      const updated = await fetchAPI(`/lawyers/${editingLawyer.id}`, {
        method: "PUT",
        body: JSON.stringify(editingLawyer),
      });
      setLawyers((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
      showToast(`Lawyer "${editingLawyer.full_name || editingLawyer.user?.full_name}" profile updated.`);
      setEditingLawyer(null);
    } catch (err: any) {
      showToast(err.message || "Failed to update lawyer", "error");
    }
  };

  // ── Client Actions ────────────────────────────────────────────────────────
  const handleSaveClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClient) return;
    try {
      if (isCreatingClient) {
        const created = await fetchAPI("/clients", {
          method: "POST",
          body: JSON.stringify(editingClient),
        });
        setClients((prev) => [...prev, created]);
        showToast(`Client "${created.full_name}" registered.`);
      } else {
        const updated = await fetchAPI(`/clients/${editingClient.id}`, {
          method: "PUT",
          body: JSON.stringify(editingClient),
        });
        setClients((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
        showToast(`Client "${updated.full_name}" updated.`);
      }
      setEditingClient(null);
      setIsCreatingClient(false);
    } catch (err: any) {
      showToast(err.message || "Failed to save client", "error");
    }
  };

  const confirmDeleteClient = async () => {
    if (!clientToDelete) return;
    try {
      await fetchAPI(`/clients/${clientToDelete.id}`, { method: "DELETE" });
      setClients((prev) => prev.filter((c) => c.id !== clientToDelete.id));
      showToast(`Client "${clientToDelete.full_name}" removed.`);
      setClientToDelete(null);
    } catch (err: any) {
      showToast(err.message || "Failed to delete client", "error");
    }
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
    const name = l.user?.full_name || l.full_name || "";
    return (
      name.toLowerCase().includes(q) ||
      l.specialization?.toLowerCase().includes(q) ||
      l.bar_number?.toLowerCase().includes(q) ||
      (l.location && l.location.toLowerCase().includes(q))
    );
  });

  const filteredClients = clients.filter((c) => {
    const q = clientSearch.toLowerCase();
    return (
      c.full_name?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.phone?.toLowerCase().includes(q)
    );
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
        <div className="flex border-b border-gray-200 mb-8 space-x-2 overflow-x-auto scrollbar-none">
          {[
            { key: "lawyers", label: `Lawyers (${lawyers.length})`, icon: <Scale className="h-4 w-4" /> },
            { key: "clients", label: `Clients (${clients.length})`, icon: <User className="h-4 w-4" /> },
            { key: "documents", label: `Legal Documents (${resources.length})`, icon: <BookOpen className="h-4 w-4" /> },
            { key: "slides", label: `Hero Slides (${slides.length})`, icon: <ImageIcon className="h-4 w-4" /> },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-2 py-3 px-5 text-sm font-bold border-b-2 transition whitespace-nowrap ${activeTab === tab.key ? "border-primary text-primary bg-white rounded-t-lg shadow-xs" : "border-transparent text-gray-500 hover:text-slate-800"}`}
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
                      {filteredLawyers.map((lawyer) => {
                        const name = lawyer.full_name || lawyer.user?.full_name || "Legal Counsel";
                        const email = lawyer.email || lawyer.user?.email || "";
                        return (
                          <tr key={lawyer.id} className="hover:bg-blue-50/40 transition">
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-3">
                                {lawyer.avatar_url ? (
                                  <img src={lawyer.avatar_url} alt={name} className="w-10 h-10 rounded-full object-cover border border-gray-200" />
                                ) : (
                                  <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">{name.charAt(0) || "L"}</div>
                                )}
                                <div>
                                  <p className="font-bold text-slate-900">{name}</p>
                                  <p className="text-xs text-gray-500">{email}</p>
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
                              <div className="flex items-center justify-end gap-1.5">
                                {!lawyer.is_verified && (
                                  <button onClick={() => handleVerifyLawyer(lawyer.id)} className="bg-green-600 hover:bg-green-700 text-white text-xs font-semibold py-1.5 px-2.5 rounded-md transition">Approve</button>
                                )}
                                <button
                                  onClick={() => setEditingLawyer({
                                    ...lawyer,
                                    full_name: name,
                                    email: email,
                                    phone: lawyer.phone || lawyer.user?.phone || "",
                                  })}
                                  className="bg-blue-50 hover:bg-primary text-primary hover:text-white border border-blue-200 hover:border-primary py-1.5 px-2.5 text-xs font-bold rounded-md transition flex items-center gap-1"
                                >
                                  <Edit3 className="h-3.5 w-3.5" /><span>Edit</span>
                                </button>
                                <Link href={`/lawyers/${lawyer.id}`} className="btn-outline py-1.5 px-2.5 text-xs font-semibold rounded-md">View</Link>
                                <button onClick={() => setLawyerToDelete(lawyer)} className="bg-red-50 hover:bg-red-600 text-red-600 hover:text-white border border-red-200 hover:border-red-600 py-1.5 px-2.5 text-xs font-bold rounded-md transition flex items-center gap-1">
                                  <Trash2 className="h-3.5 w-3.5" /><span>Remove</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══ TAB 2: CLIENT MANAGEMENT (NEW) ══════════════════════════════════ */}
        {activeTab === "clients" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <div className="relative w-full sm:w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search clients by name, email, phone..."
                  value={clientSearch}
                  onChange={(e) => setClientSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>
              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                <button onClick={loadClients} className="btn-outline text-xs py-2 px-3 flex items-center gap-1.5">
                  <RefreshCw className="h-3.5 w-3.5" /> Refresh
                </button>
                <button
                  onClick={() => {
                    setIsCreatingClient(true);
                    setEditingClient({
                      id: 0,
                      full_name: "",
                      email: "",
                      phone: "+1 555-010-0000",
                      role: "client",
                      is_active: true,
                    });
                  }}
                  className="btn-primary text-xs py-2 px-3 flex items-center gap-1.5"
                >
                  <Plus className="h-3.5 w-3.5" /> Add New Client
                </button>
              </div>
            </div>

            {clientsLoading ? (
              <div className="py-20 text-center">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-sm text-gray-500">Loading registered clients...</p>
              </div>
            ) : filteredClients.length === 0 ? (
              <div className="card p-12 text-center">
                <User className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-800">No clients found</h3>
                <p className="text-gray-500 text-xs mt-1">Register new clients or adjust search filters.</p>
              </div>
            ) : (
              <div className="card overflow-hidden border border-gray-200 shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase font-bold text-gray-600">
                        <th className="py-3.5 px-4">Client Name</th>
                        <th className="py-3.5 px-4">Email</th>
                        <th className="py-3.5 px-4">Phone</th>
                        <th className="py-3.5 px-4">Bookings</th>
                        <th className="py-3.5 px-4">Account Status</th>
                        <th className="py-3.5 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredClients.map((client) => (
                        <tr key={client.id} className="hover:bg-blue-50/40 transition">
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-blue-100 text-primary flex items-center justify-center font-bold text-sm">
                                {client.full_name?.charAt(0) || "C"}
                              </div>
                              <p className="font-bold text-slate-900">{client.full_name}</p>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-gray-600">{client.email}</td>
                          <td className="py-4 px-4 font-mono text-xs text-slate-700">{client.phone || "—"}</td>
                          <td className="py-4 px-4">
                            <span className="bg-blue-50 text-primary text-xs font-bold px-2.5 py-1 rounded-full border border-blue-200">
                              {client.appointments_count ?? 1} consultations
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            {client.is_active ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                                <Check className="h-3 w-3" /> Active
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase bg-red-100 text-red-800 px-2 py-0.5 rounded-full">
                                Suspended
                              </span>
                            )}
                          </td>
                          <td className="py-4 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => {
                                  setIsCreatingClient(false);
                                  setEditingClient({ ...client });
                                }}
                                className="bg-blue-50 hover:bg-primary text-primary hover:text-white border border-blue-200 hover:border-primary py-1.5 px-2.5 text-xs font-bold rounded-md transition flex items-center gap-1"
                              >
                                <Edit3 className="h-3.5 w-3.5" /><span>Edit</span>
                              </button>
                              <button
                                onClick={() => setClientToDelete(client)}
                                className="bg-red-50 hover:bg-red-600 text-red-600 hover:text-white border border-red-200 hover:border-red-600 py-1.5 px-2.5 text-xs font-bold rounded-md transition flex items-center gap-1"
                              >
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

        {/* ══ TAB 3: DOCUMENTS ═══════════════════════════════════════════════ */}
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
              <div className="py-20 text-center"><div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" /><p className="text-sm text-gray-500">Loading documents...</p></div>
            ) : filteredResources.length === 0 ? (
              <div className="card p-12 text-center"><BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-3" /><h3 className="text-base font-bold text-slate-800">No resources found</h3></div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredResources.map((res) => (
                  <div key={res.id} className="card p-5 flex flex-col justify-between border border-gray-200 hover:shadow-md transition">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider bg-blue-50 text-primary px-2.5 py-0.5 rounded-full border border-blue-100">{res.category}</span>
                        <span className="text-xs text-gray-400">{res.read_time}</span>
                      </div>
                      <h3 className="font-bold text-slate-900 text-base mb-2 line-clamp-2">{res.title}</h3>
                      <p className="text-xs text-gray-500 line-clamp-3 mb-4 leading-relaxed">{res.summary}</p>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <span className="text-[11px] text-gray-400">{res.jurisdiction}</span>
                      <div className="flex items-center gap-2">
                        <button onClick={() => { setIsCreatingResource(false); setEditingResource(res); }} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition" title="Edit Article"><Edit3 className="h-4 w-4" /></button>
                        <button onClick={() => handleDeleteResource(res.id, res.title)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition" title="Delete Article"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ══ TAB 4: HERO SLIDES ═════════════════════════════════════════════ */}
        {activeTab === "slides" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <div>
                <h2 className="font-bold text-slate-900 text-base">Homepage Hero Carousel Slides</h2>
                <p className="text-xs text-gray-500 mt-0.5">Add, reorder, show/hide, or delete banners on the homepage slider.</p>
              </div>
              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                <button onClick={loadSlides} className="btn-outline text-xs py-2 px-3 flex items-center gap-1.5"><RefreshCw className="h-3.5 w-3.5" /> Refresh</button>
                <button
                  onClick={() => { setIsCreatingSlide(true); setEditingSlide({ ...BLANK_SLIDE, id: 0, sort_order: slides.length + 1 }); setPreviewUrl(""); }}
                  className="btn-primary text-xs py-2 px-3 flex items-center gap-1.5"
                ><Plus className="h-3.5 w-3.5" /> Add New Slide</button>
              </div>
            </div>

            {slidesLoading ? (
              <div className="py-20 text-center"><div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" /><p className="text-sm text-gray-500">Loading slides...</p></div>
            ) : slides.length === 0 ? (
              <div className="card p-12 text-center"><ImageIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" /><h3 className="text-base font-bold text-slate-800">No slides configured</h3></div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {slides.map((slide) => (
                  <div key={slide.id} className={`card overflow-hidden border transition flex flex-col justify-between ${slide.is_active ? "border-gray-200 shadow-sm" : "border-dashed border-gray-300 opacity-60 bg-gray-50"}`}>
                    <div>
                      <div className="relative h-44 bg-slate-900 overflow-hidden">
                        <img src={slide.image_url} alt={slide.title} className="w-full h-full object-cover" />
                        <div className="absolute top-2 left-2 flex gap-1.5">
                          <span className="bg-black/70 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">Order #{slide.sort_order}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${slide.is_active ? "bg-green-500 text-white" : "bg-gray-600 text-gray-200"}`}>{slide.is_active ? "Active" : "Hidden"}</span>
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-bold text-slate-900 text-sm mb-1 line-clamp-1">{slide.title}</h3>
                        {slide.subtitle && <p className="text-xs text-gray-500 line-clamp-2 mb-2">{slide.subtitle}</p>}
                      </div>
                    </div>
                    <div className="p-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                      <button onClick={() => handleToggleSlide(slide)} className="text-xs font-semibold flex items-center gap-1 text-gray-600 hover:text-primary">{slide.is_active ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />} {slide.is_active ? "Hide" : "Show"}</button>
                      <div className="flex gap-1.5">
                        <button onClick={() => { setIsCreatingSlide(false); setEditingSlide(slide); setPreviewUrl(slide.image_url); }} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md"><Edit3 className="h-4 w-4" /></button>
                        <button onClick={() => setSlideToDelete(slide)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-md"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

      {/* ── MODAL: EDIT LAWYER (NEW) ────────────────────────────────────────── */}
      {editingLawyer && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="card max-w-2xl w-full p-6 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-gray-200 mb-6">
              <h2 className="text-xl font-serif font-bold text-slate-900 flex items-center gap-2">
                <Edit3 className="h-5 w-5 text-gold" /> Edit Attorney Profile
              </h2>
              <button onClick={() => setEditingLawyer(null)} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg"><X className="h-5 w-5" /></button>
            </div>

            <form onSubmit={handleSaveLawyer} className="space-y-4 text-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Full Name & Title</label>
                  <input
                    type="text"
                    required
                    value={editingLawyer.full_name || ""}
                    onChange={(e) => setEditingLawyer({ ...editingLawyer, full_name: e.target.value })}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={editingLawyer.email || ""}
                    onChange={(e) => setEditingLawyer({ ...editingLawyer, email: e.target.value })}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={editingLawyer.phone || ""}
                    onChange={(e) => setEditingLawyer({ ...editingLawyer, phone: e.target.value })}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Consultation Fee ($/hr)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={editingLawyer.fee_per_hour}
                    onChange={(e) => setEditingLawyer({ ...editingLawyer, fee_per_hour: parseFloat(e.target.value) || 0 })}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary font-bold text-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Experience (Years)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={editingLawyer.experience_years}
                    onChange={(e) => setEditingLawyer({ ...editingLawyer, experience_years: parseInt(e.target.value) || 0 })}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Legal Specialization</label>
                  <select
                    value={editingLawyer.specialization}
                    onChange={(e) => setEditingLawyer({ ...editingLawyer, specialization: e.target.value })}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                  >
                    <option>Family & Marriage Law</option>
                    <option>Corporate & Business Law</option>
                    <option>Criminal Law</option>
                    <option>Civil & Property Law</option>
                    <option>Cyber Crime</option>
                    <option>Taxation & Finance</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Jurisdiction / Location</label>
                  <input
                    type="text"
                    value={editingLawyer.location}
                    onChange={(e) => setEditingLawyer({ ...editingLawyer, location: e.target.value })}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Bar Registration Number</label>
                  <input
                    type="text"
                    value={editingLawyer.bar_number}
                    onChange={(e) => setEditingLawyer({ ...editingLawyer, bar_number: e.target.value })}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Avatar Image URL</label>
                  <input
                    type="url"
                    value={editingLawyer.avatar_url || ""}
                    onChange={(e) => setEditingLawyer({ ...editingLawyer, avatar_url: e.target.value })}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Qualifications & Degrees</label>
                <input
                  type="text"
                  value={editingLawyer.qualifications}
                  onChange={(e) => setEditingLawyer({ ...editingLawyer, qualifications: e.target.value })}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Professional Bio / About</label>
                <textarea
                  rows={3}
                  value={editingLawyer.about}
                  onChange={(e) => setEditingLawyer({ ...editingLawyer, about: e.target.value })}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="lawyer_verified"
                  checked={editingLawyer.is_verified}
                  onChange={(e) => setEditingLawyer({ ...editingLawyer, is_verified: e.target.checked })}
                  className="h-4 w-4 text-primary rounded focus:ring-primary"
                />
                <label htmlFor="lawyer_verified" className="text-xs font-semibold text-gray-800 cursor-pointer">
                  Mark as Verified Attorney (visible on public directory)
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setEditingLawyer(null)} className="btn-outline text-xs py-2 px-4">Cancel</button>
                <button type="submit" className="btn-primary text-xs py-2 px-5">Save Attorney Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: EDIT / CREATE CLIENT (NEW) ───────────────────────────────── */}
      {editingClient && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="card max-w-md w-full p-6">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200 mb-5">
              <h2 className="text-lg font-serif font-bold text-slate-900 flex items-center gap-2">
                <User className="h-5 w-5 text-primary" /> {isCreatingClient ? "Add New Client" : "Edit Client Details"}
              </h2>
              <button onClick={() => setEditingClient(null)} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg"><X className="h-5 w-5" /></button>
            </div>

            <form onSubmit={handleSaveClient} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={editingClient.full_name}
                  onChange={(e) => setEditingClient({ ...editingClient, full_name: e.target.value })}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={editingClient.email}
                  onChange={(e) => setEditingClient({ ...editingClient, email: e.target.value })}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={editingClient.phone}
                  onChange={(e) => setEditingClient({ ...editingClient, phone: e.target.value })}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="client_active"
                  checked={editingClient.is_active}
                  onChange={(e) => setEditingClient({ ...editingClient, is_active: e.target.checked })}
                  className="h-4 w-4 text-primary rounded focus:ring-primary"
                />
                <label htmlFor="client_active" className="text-xs font-semibold text-gray-800 cursor-pointer">
                  Active Account (allowed to book consultations and log in)
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setEditingClient(null)} className="btn-outline text-xs py-2 px-4">Cancel</button>
                <button type="submit" className="btn-primary text-xs py-2 px-5">Save Client</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: CONFIRM DELETE CLIENT (NEW) ──────────────────────────────── */}
      {clientToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="card max-w-sm w-full p-6 text-center">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-lg mb-2">Remove Client?</h3>
            <p className="text-gray-500 text-xs mb-6">
              Are you sure you want to delete <span className="font-bold text-slate-800">{clientToDelete.full_name}</span>? Their consultation bookings will also be cancelled.
            </p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => setClientToDelete(null)} className="btn-outline text-xs py-2 px-4">Cancel</button>
              <button onClick={confirmDeleteClient} className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs py-2 px-4 rounded-lg">Confirm Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: CONFIRM DELETE LAWYER ────────────────────────────────────── */}
      {lawyerToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="card max-w-sm w-full p-6 text-center">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4"><Trash2 className="h-6 w-6" /></div>
            <h3 className="font-bold text-slate-900 text-lg mb-2">Remove Attorney?</h3>
            <p className="text-gray-500 text-xs mb-6">Are you sure you want to remove <span className="font-bold text-slate-800">{lawyerToDelete.full_name || lawyerToDelete.user?.full_name}</span> from the directory?</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => setLawyerToDelete(null)} className="btn-outline text-xs py-2 px-4">Cancel</button>
              <button onClick={confirmDeleteLawyer} className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs py-2 px-4 rounded-lg">Confirm Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: EDIT / CREATE DOCUMENT ───────────────────────────────────── */}
      {editingResource && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="card max-w-2xl w-full p-6 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200 mb-5">
              <h2 className="text-lg font-serif font-bold text-slate-900 flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-gold" /> {isCreatingResource ? "Add New Legal Document" : "Edit Document"}
              </h2>
              <button onClick={() => setEditingResource(null)} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg"><X className="h-5 w-5" /></button>
            </div>

            <form onSubmit={handleSaveResource} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Document Title</label>
                <input type="text" required value={editingResource.title} onChange={(e) => setEditingResource({ ...editingResource, title: e.target.value })} className="w-full p-2.5 border border-gray-300 rounded-lg" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Category</label>
                  <select value={editingResource.category} onChange={(e) => setEditingResource({ ...editingResource, category: e.target.value })} className="w-full p-2.5 border border-gray-300 rounded-lg">
                    <option>Constitution</option><option>Corporate Law</option><option>Criminal Law</option><option>Family Law</option><option>Cyber Crime</option><option>Taxation</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Jurisdiction</label>
                  <input type="text" value={editingResource.jurisdiction} onChange={(e) => setEditingResource({ ...editingResource, jurisdiction: e.target.value })} className="w-full p-2.5 border border-gray-300 rounded-lg" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Summary Overview</label>
                <textarea rows={2} required value={editingResource.summary} onChange={(e) => setEditingResource({ ...editingResource, summary: e.target.value })} className="w-full p-2.5 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Full Content (Markdown Supported)</label>
                <textarea rows={6} required value={editingResource.content} onChange={(e) => setEditingResource({ ...editingResource, content: e.target.value })} className="w-full p-2.5 border border-gray-300 rounded-lg font-mono text-xs" />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setEditingResource(null)} className="btn-outline text-xs py-2 px-4">Cancel</button>
                <button type="submit" className="btn-primary text-xs py-2 px-5">Save Document</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: EDIT / CREATE HERO SLIDE ─────────────────────────────────── */}
      {editingSlide && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="card max-w-xl w-full p-6 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200 mb-5">
              <h2 className="text-lg font-serif font-bold text-slate-900 flex items-center gap-2">
                <ImageIcon className="h-5 w-5 text-gold" /> {isCreatingSlide ? "Add New Hero Banner" : "Edit Hero Banner"}
              </h2>
              <button onClick={() => setEditingSlide(null)} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg"><X className="h-5 w-5" /></button>
            </div>

            <form onSubmit={handleSaveSlide} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Headline Title</label>
                <input type="text" required value={editingSlide.title} onChange={(e) => setEditingSlide({ ...editingSlide, title: e.target.value })} className="w-full p-2.5 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Subtitle</label>
                <textarea rows={2} value={editingSlide.subtitle || ""} onChange={(e) => setEditingSlide({ ...editingSlide, subtitle: e.target.value })} className="w-full p-2.5 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Image URL</label>
                <input type="url" required value={editingSlide.image_url} onChange={(e) => { setEditingSlide({ ...editingSlide, image_url: e.target.value }); setPreviewUrl(e.target.value); }} className="w-full p-2.5 border border-gray-300 rounded-lg text-xs" />
              </div>
              {previewUrl && (
                <div className="rounded-lg overflow-hidden border border-gray-200 h-32">
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" onError={() => setPreviewUrl("")} />
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Button Text</label>
                  <input type="text" value={editingSlide.button_text || ""} onChange={(e) => setEditingSlide({ ...editingSlide, button_text: e.target.value })} className="w-full p-2.5 border border-gray-300 rounded-lg" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Button Link</label>
                  <input type="text" value={editingSlide.button_url || ""} onChange={(e) => setEditingSlide({ ...editingSlide, button_url: e.target.value })} className="w-full p-2.5 border border-gray-300 rounded-lg" />
                </div>
              </div>
              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={editingSlide.is_active} onChange={(e) => setEditingSlide({ ...editingSlide, is_active: e.target.checked })} className="h-4 w-4 text-primary rounded" />
                  <span className="text-xs font-bold text-gray-700">Slide is Active</span>
                </label>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setEditingSlide(null)} className="btn-outline text-xs py-2 px-4">Cancel</button>
                <button type="submit" className="btn-primary text-xs py-2 px-5">Save Slide</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: CONFIRM DELETE HERO SLIDE ─────────────────────────────────── */}
      {slideToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="card max-w-sm w-full p-6 text-center">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4"><Trash2 className="h-6 w-6" /></div>
            <h3 className="font-bold text-slate-900 text-lg mb-2">Delete Slide?</h3>
            <p className="text-gray-500 text-xs mb-6">Are you sure you want to remove <span className="font-bold text-slate-800">"{slideToDelete.title}"</span>?</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => setSlideToDelete(null)} className="btn-outline text-xs py-2 px-4">Cancel</button>
              <button onClick={confirmDeleteSlide} className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs py-2 px-4 rounded-lg">Confirm Delete</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
