"use client";
import API_BASE from "@/lib/api";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { 
  ArrowLeft, Video, Phone, Paperclip, Send, Shield, Lock, FileText, 
  Download, Search, MoreVertical, Check, CheckCheck, User, Calendar, 
  Clock, Mail, MapPin, X, Plus, Sparkles, MessageSquare, Scale,
  Briefcase, Award, ShieldCheck, Users, Filter, ChevronRight
} from "lucide-react";
import { fetchAPI } from "@/lib/api";

interface ChatContact {
  id: number | string;
  name: string;
  role: "client" | "lawyer";
  email: string;
  phone: string;
  subtitle: string;
  caseType?: string;
  specialization?: string;
  barNumber?: string;
  location?: string;
  feePerHour?: number;
  qualifications?: string;
  status: "Active Client" | "Retained Client" | "Consultation Pending" | "Verified Attorney";
  avatar: string;
  lastMessage: string;
  lastTime: string;
  unreadCount?: number;
  online: boolean;
  notes?: string;
  documents?: { title: string; size: string; date: string }[];
}

interface Message {
  id: string | number;
  sender: "me" | "them";
  text: string;
  time: string;
  status?: "sent" | "delivered" | "read";
  attachment?: { name: string; size: string; type: string };
}

// ── All Available Contacts (Clients & Lawyers) ──────────────────────────────
const ALL_CONTACTS: ChatContact[] = [
  // ── CLIENTS ──
  {
    id: "client-2",
    name: "John Doe",
    role: "client",
    email: "john@example.com",
    phone: "+1 555-019-2831",
    subtitle: "Commercial Lease & Breach of Contract Advisory",
    caseType: "Corporate & Commercial Law",
    status: "Active Client",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&auto=format&fit=crop",
    lastMessage: "Thank you for reviewing the clauses. When can we sign the revised addendum?",
    lastTime: "11:42 AM",
    unreadCount: 1,
    online: true,
    notes: "Franchise operator in Manhattan. Reviewing commercial arbitration terms & rent liability clauses.",
    documents: [
      { title: "Commercial_Lease_Addendum_Final.pdf", size: "2.4 MB", date: "Oct 24, 2026" },
      { title: "Arbitration_Notice_Draft.docx", size: "840 KB", date: "Oct 21, 2026" }
    ]
  },
  {
    id: "client-3",
    name: "Jane Smith",
    role: "client",
    email: "client@thelawgo.com",
    phone: "+1 555-019-2832",
    subtitle: "Patent Trademark Registration & Licensing Agreement",
    caseType: "Intellectual Property Law",
    status: "Retained Client",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=150&auto=format&fit=crop",
    lastMessage: "I have uploaded the USPTO filing receipt for your docket records.",
    lastTime: "Yesterday",
    online: false,
    notes: "Filing patent claim for medical diagnostic software across US & EU jurisdictions.",
    documents: [
      { title: "USPTO_Filing_Receipt_77218.pdf", size: "1.1 MB", date: "Oct 23, 2026" }
    ]
  },
  {
    id: "client-4",
    name: "Robert Taylor",
    role: "client",
    email: "robert.taylor@techventures.io",
    phone: "+1 415-555-8822",
    subtitle: "Series A Seed Investment & Shareholder Voting Rights",
    caseType: "Venture Financing",
    status: "Active Client",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop",
    lastMessage: "Our lead VC sent over their revised term sheet this morning.",
    lastTime: "Oct 22",
    online: true,
    notes: "Reviewing drag-along rights and anti-dilution provisions for $4.5M institutional round.",
    documents: [
      { title: "Series_A_Term_Sheet_v3.pdf", size: "3.8 MB", date: "Oct 22, 2026" }
    ]
  },
  {
    id: "client-5",
    name: "Emily Davis",
    role: "client",
    email: "emily.davis@healthcorp.org",
    phone: "+1 617-555-9011",
    subtitle: "Healthcare Regulatory Compliance & HIPAA Safeguards",
    caseType: "Regulatory Compliance",
    status: "Consultation Pending",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=150&auto=format&fit=crop",
    lastMessage: "Could we schedule a preliminary video conference for Tuesday afternoon?",
    lastTime: "Oct 19",
    online: false,
    notes: "Inquiring about audit risk mitigation and patient data compliance guidelines.",
    documents: [
      { title: "HIPAA_Privacy_Assessment_Summary.pdf", size: "1.6 MB", date: "Oct 18, 2026" }
    ]
  },

  // ── LAWYERS (COLLEAGUES / VERIFIED ATTORNEYS) ──
  {
    id: "lawyer-1",
    name: "Adv. Sarah Jenkins",
    role: "lawyer",
    email: "sarah.jenkins@thelawgo.com",
    phone: "+1 212-555-0143",
    subtitle: "Family & Marriage Law • Bar #NY-984210",
    specialization: "Family & Marriage Law",
    barNumber: "NY-984210",
    location: "New York, NY",
    feePerHour: 150,
    qualifications: "J.D. from Harvard Law School, B.A. in Psychology from NYU",
    status: "Verified Attorney",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=150&auto=format&fit=crop",
    lastMessage: "I have prepared the draft mediation memo for review.",
    lastTime: "12:15 PM",
    online: true,
    notes: "Lead counsel on domestic relations, complex matrimonial property settlements, and custody mediation.",
    documents: [
      { title: "Family_Mediation_Guidelines_NY.pdf", size: "1.5 MB", date: "Oct 24, 2026" }
    ]
  },
  {
    id: "lawyer-2",
    name: "Adv. Michael Chen",
    role: "lawyer",
    email: "michael.chen@thelawgo.com",
    phone: "+1 415-555-0188",
    subtitle: "Corporate & Business Law • Bar #CA-841920",
    specialization: "Corporate & Business Law",
    barNumber: "CA-841920",
    location: "San Francisco, CA",
    feePerHour: 220,
    qualifications: "LL.M. Stanford Law School, B.S. in Economics UC Berkeley",
    status: "Verified Attorney",
    avatar: "https://images.unsplash.com/photo-1556157382-97eda2d62296?q=80&w=150&auto=format&fit=crop",
    lastMessage: "Regarding the cross-border Delaware merger, let's align on Section 4 indemnities.",
    lastTime: "10:30 AM",
    unreadCount: 2,
    online: true,
    notes: "Co-counsel partner for Silicon Valley tech transactions and cross-border commercial compliance.",
    documents: [
      { title: "Delaware_Corporate_Code_Summary.pdf", size: "3.2 MB", date: "Oct 23, 2026" }
    ]
  },
  {
    id: "lawyer-3",
    name: "Adv. Marcus Vance",
    role: "lawyer",
    email: "marcus.vance@thelawgo.com",
    phone: "+1 312-555-0199",
    subtitle: "Criminal Law & Litigation • Bar #IL-552194",
    specialization: "Criminal Law & Litigation",
    barNumber: "IL-552194",
    location: "Chicago, IL",
    feePerHour: 190,
    qualifications: "J.D. Northwestern Pritzker School of Law, Former Assistant State Prosecutor",
    status: "Verified Attorney",
    avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=150&auto=format&fit=crop",
    lastMessage: "The evidentiary hearing has been calendared for next month. Subpoenas served.",
    lastTime: "Yesterday",
    online: false,
    notes: "Consulting criminal defense strategist with 18 years of state and federal court trial experience.",
    documents: [
      { title: "Evidentiary_Hearing_Schedule.pdf", size: "920 KB", date: "Oct 21, 2026" }
    ]
  },
  {
    id: "lawyer-4",
    name: "Adv. Priya Sharma",
    role: "lawyer",
    email: "priya.sharma@thelawgo.com",
    phone: "+1 512-555-0177",
    subtitle: "Civil & Property Law • Bar #TX-782104",
    specialization: "Civil & Property Law",
    barNumber: "TX-782104",
    location: "Austin, TX",
    feePerHour: 175,
    qualifications: "J.D. Columbia Law School, LL.B. National Law School of India",
    status: "Verified Attorney",
    avatar: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=150&auto=format&fit=crop",
    lastMessage: "Title deed discrepancy cleared with the municipal land registry.",
    lastTime: "Oct 20",
    online: true,
    notes: "Real estate litigation, title disputes, and municipal zoning compliance counsel.",
    documents: [
      { title: "Land_Registry_Title_Clearance.pdf", size: "2.1 MB", date: "Oct 20, 2026" }
    ]
  }
];

const INITIAL_CONVERSATIONS: Record<string, Message[]> = {
  // Client: John Doe
  "client-2": [
    {
      id: 1,
      sender: "them",
      text: "Hello Counselor, I have submitted the draft commercial lease agreement along with the landlord dispute notes.",
      time: "10:15 AM",
      status: "read"
    },
    {
      id: 2,
      sender: "me",
      text: "Hello John, I have thoroughly reviewed Section 8 regarding the early termination penalty and repair liabilities.",
      time: "10:22 AM",
      status: "read"
    },
    {
      id: 3,
      sender: "me",
      text: "The clause as originally written exposed you to uncapped damages. I have redrafted Clause 8.2 to limit your liability strictly to 60 days rent.",
      time: "10:25 AM",
      status: "read",
      attachment: {
        name: "Commercial_Lease_Addendum_Redline.pdf",
        size: "1.8 MB",
        type: "pdf"
      }
    },
    {
      id: 4,
      sender: "them",
      text: "Thank you for reviewing the clauses. When can we sign the revised addendum?",
      time: "11:42 AM",
      status: "read"
    }
  ],

  // Client: Jane Smith
  "client-3": [
    {
      id: 1,
      sender: "them",
      text: "Good morning! The trademark examiner requested clarifying details regarding our class 42 software classification.",
      time: "Yesterday, 3:20 PM",
      status: "read"
    },
    {
      id: 2,
      sender: "me",
      text: "I received the Office Action notice. We have 30 days to respond with our specimen of use and claim limitation. I will prepare the formal response by Friday.",
      time: "Yesterday, 4:05 PM",
      status: "read"
    },
    {
      id: 3,
      sender: "them",
      text: "I have uploaded the USPTO filing receipt for your docket records.",
      time: "Yesterday, 5:15 PM",
      status: "read"
    }
  ],

  // Client: Robert Taylor
  "client-4": [
    {
      id: 1,
      sender: "them",
      text: "Our lead VC sent over their revised term sheet this morning.",
      time: "Oct 22, 9:10 AM",
      status: "read"
    },
    {
      id: 2,
      sender: "me",
      text: "Acknowledged Robert. I will evaluate the liquidation preference and board seat requirements today.",
      time: "Oct 22, 10:00 AM",
      status: "read"
    }
  ],

  // Client: Emily Davis
  "client-5": [
    {
      id: 1,
      sender: "them",
      text: "Could we schedule a preliminary video conference for Tuesday afternoon?",
      time: "Oct 19, 2:30 PM",
      status: "read"
    }
  ],

  // Lawyer: Adv. Sarah Jenkins (Client view default)
  "lawyer-1": [
    {
      id: 1,
      sender: "them",
      text: "Hello! Welcome to THE LAW GO. I have received your case inquiry and look forward to our consultation session.",
      time: "10:00 AM",
      status: "read"
    },
    {
      id: 2,
      sender: "me",
      text: "Thank you Counselor. I have uploaded the background documents for your review.",
      time: "10:05 AM",
      status: "read"
    },
    {
      id: 3,
      sender: "them",
      text: "I have prepared the draft mediation memo for review. We will discuss the specific clauses in our scheduled video conference.",
      time: "12:15 PM",
      status: "read"
    }
  ],

  // Lawyer: Adv. Michael Chen (Co-Counsel chat)
  "lawyer-2": [
    {
      id: 1,
      sender: "them",
      text: "Counselor, regarding the cross-border Delaware merger, let's align on Section 4 indemnities and tax allocation covenants.",
      time: "10:15 AM",
      status: "read"
    },
    {
      id: 2,
      sender: "me",
      text: "Agreed Michael. I reviewed the Delaware Supreme Court precedents on representation reps and warranties survival periods.",
      time: "10:25 AM",
      status: "read"
    },
    {
      id: 3,
      sender: "them",
      text: "Excellent. Let's exchange the redlined indemnity carve-outs before 3 PM today.",
      time: "10:30 AM",
      status: "read",
      attachment: {
        name: "Merger_Indemnity_Section4_Redline.pdf",
        size: "2.1 MB",
        type: "pdf"
      }
    }
  ],

  // Lawyer: Adv. Marcus Vance (Co-Counsel chat)
  "lawyer-3": [
    {
      id: 1,
      sender: "them",
      text: "The evidentiary hearing has been calendared for next month. Subpoenas served.",
      time: "Yesterday, 2:10 PM",
      status: "read"
    },
    {
      id: 2,
      sender: "me",
      text: "Received Marcus. I will finalize our motion in limine to exclude unauthenticated digital evidence.",
      time: "Yesterday, 3:30 PM",
      status: "read"
    }
  ],

  // Lawyer: Adv. Priya Sharma (Co-Counsel chat)
  "lawyer-4": [
    {
      id: 1,
      sender: "them",
      text: "Title deed discrepancy cleared with the municipal land registry.",
      time: "Oct 20, 11:00 AM",
      status: "read"
    }
  ]
};

export default function UnifiedSecureChat() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  // Active perspective: "lawyer" or "client"
  const [perspectiveRole, setPerspectiveRole] = useState<"lawyer" | "client">("lawyer");
  // Filter for lawyers view: "all" | "clients" | "lawyers"
  const [lawyerContactFilter, setLawyerContactFilter] = useState<"all" | "clients" | "lawyers">("all");

  const [selectedContactId, setSelectedContactId] = useState<string>("client-2");
  const [conversations, setConversations] = useState<Record<string, Message[]>>(INITIAL_CONVERSATIONS);
  const [inputText, setInputText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showProfileDrawer, setShowProfileDrawer] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [bookingDate, setBookingDate] = useState("2026-11-06");
  const [bookingTime, setBookingTime] = useState("10:00 AM");
  const [bookingType, setBookingType] = useState("Video Call");
  const [bookingSubject, setBookingSubject] = useState("");
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load current user authentication
  useEffect(() => {
    const init = async () => {
      try {
        const me = await fetchAPI("/auth/me");
        if (me) {
          setCurrentUser(me);
          if (me.role === "client") {
            setPerspectiveRole("client");
            setSelectedContactId("lawyer-1"); // Default to Sarah Jenkins for client
          } else {
            setPerspectiveRole("lawyer");
            setSelectedContactId("client-2"); // Default to John Doe for lawyer
          }
        }
      } catch (e) {
        console.error(e);
      }
    };
    init();
  }, []);

  // Determine contacts list according to the active role perspective
  // 1. If Client: ONLY show Lawyers!
  // 2. If Lawyer: Can show Clients AND Lawyers (with category filter)!
  const availableContacts = ALL_CONTACTS.filter((c) => {
    if (perspectiveRole === "client") {
      // In client view: ONLY lawyers must be visible
      return c.role === "lawyer";
    } else {
      // In lawyer view: Can talk to clients AND fellow lawyers
      if (lawyerContactFilter === "clients") return c.role === "client";
      if (lawyerContactFilter === "lawyers") return c.role === "lawyer";
      return true; // "all"
    }
  });

  const filteredContacts = availableContacts.filter((c) => {
    const q = searchQuery.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.subtitle.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      (c.specialization && c.specialization.toLowerCase().includes(q))
    );
  });

  // Ensure selectedContactId is valid for the current view
  useEffect(() => {
    if (!availableContacts.some((c) => c.id === selectedContactId)) {
      if (availableContacts.length > 0) {
        setSelectedContactId(availableContacts[0].id.toString());
      }
    }
  }, [perspectiveRole, lawyerContactFilter]);

  const activeContact = ALL_CONTACTS.find((c) => c.id === selectedContactId) || availableContacts[0] || ALL_CONTACTS[0];
  const activeMessages = conversations[selectedContactId] || [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedContactId, conversations]);

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    const newMsg: Message = {
      id: Date.now(),
      sender: "me",
      text: inputText.trim(),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      status: "delivered"
    };

    setConversations((prev) => ({
      ...prev,
      [selectedContactId]: [...(prev[selectedContactId] || []), newMsg]
    }));

    setInputText("");
  };

  const handleBookAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetchAPI("/appointments/", {
        method: "POST",
        body: JSON.stringify({
          client_id: activeContact.role === "client" ? 2 : undefined,
          lawyer_id: activeContact.role === "lawyer" ? 1 : undefined,
          specialization: activeContact.specialization || activeContact.caseType || "General Practice",
          consultation_type: bookingType,
          date: bookingDate,
          time_slot: bookingTime,
          brief_subject: bookingSubject || `Consultation regarding ${activeContact.subtitle}`,
          detailed_description: `Session scheduled from secure chat for ${activeContact.name}.`
        })
      });

      const confirmMsg: Message = {
        id: Date.now(),
        sender: "me",
        text: `Confirmed: I have scheduled our upcoming ${bookingType} for ${bookingDate} at ${bookingTime}. Calendar invites have been placed on your dashboard.`,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        status: "delivered"
      };

      setConversations((prev) => ({
        ...prev,
        [selectedContactId]: [...(prev[selectedContactId] || []), confirmMsg]
      }));

      setBookingSuccess(true);
      setTimeout(() => {
        setBookingSuccess(false);
        setShowScheduleModal(false);
      }, 1500);
    } catch (err) {
      console.error(err);
      alert("Failed to schedule appointment. Please check connection.");
    }
  };

  return (
    <div className="h-full w-full bg-[#111b21] text-slate-100 flex flex-col md:flex-row overflow-hidden font-sans select-none">
      
      {/* ================= LEFT SIDEBAR (WHATSAPP WEB CONTACT LIST) ================= */}
      <aside className={`w-full md:w-96 lg:w-[420px] bg-[#111b21] border-r border-[#222e35] flex flex-col shrink-0 h-full ${showProfileDrawer ? 'hidden lg:flex' : 'flex'}`}>
        
        {/* Sidebar Header */}
        <div className="bg-[#202c33] px-4 py-3 flex items-center justify-between border-b border-[#2a3942]">
          <div className="flex items-center gap-3">
            <Link 
              href="/dashboard" 
              className="p-2 text-gray-300 hover:text-white hover:bg-[#2a3942] rounded-full transition" 
              title="Return to Dashboard"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-full bg-primary text-gold border border-gold/40 flex items-center justify-center font-bold text-sm shadow-sm">
                {perspectiveRole === "lawyer" ? "SJ" : "JD"}
              </div>
              <div>
                <h2 className="font-semibold text-sm text-slate-100 leading-tight">
                  {perspectiveRole === "lawyer" ? "Adv. Sarah Jenkins" : "John Doe (Client)"}
                </h2>
                <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
                  {perspectiveRole === "lawyer" ? "Attorney Mode" : "Client Mode"}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Perspective Switcher (Lawyer vs Client View) */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                const nextRole = perspectiveRole === "lawyer" ? "client" : "lawyer";
                setPerspectiveRole(nextRole);
                setSelectedContactId(nextRole === "client" ? "lawyer-1" : "client-2");
              }}
              className="text-[11px] bg-[#111b21] hover:bg-[#2a3942] text-gold border border-gold/30 px-2.5 py-1.5 rounded-lg font-bold transition flex items-center gap-1"
              title="Toggle view between Client view (Lawyers only) and Lawyer view (Clients & Colleagues)"
            >
              <Users className="h-3 w-3" />
              <span>{perspectiveRole === "lawyer" ? "Switch to Client View" : "Switch to Lawyer View"}</span>
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="p-3 bg-[#111b21] border-b border-[#222e35]">
          <div className="bg-[#202c33] rounded-lg flex items-center px-3 py-2 text-gray-300 focus-within:ring-1 focus-within:ring-emerald-500">
            <Search className="h-4 w-4 text-gray-400 mr-2 shrink-0" />
            <input 
              type="text"
              placeholder={perspectiveRole === "client" ? "Search verified attorneys & legal counsel..." : "Search clients, colleagues, or legal matters..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-xs text-white placeholder-gray-400 focus:outline-none w-full"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="text-gray-400 hover:text-white">
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Role Specification & Category Tabs */}
        {perspectiveRole === "lawyer" ? (
          /* Lawyer View: Filter between Clients and Colleague Lawyers */
          <div className="px-3 py-2 bg-[#182229] border-b border-[#222e35] flex items-center justify-between gap-1 text-xs">
            <button
              onClick={() => setLawyerContactFilter("all")}
              className={`flex-1 py-1.5 px-2 rounded-md font-semibold text-center text-[11px] transition ${
                lawyerContactFilter === "all"
                  ? "bg-emerald-600 text-slate-950 font-bold"
                  : "text-gray-400 hover:text-white hover:bg-[#202c33]"
              }`}
            >
              All ({ALL_CONTACTS.length})
            </button>

            <button
              onClick={() => setLawyerContactFilter("clients")}
              className={`flex-1 py-1.5 px-2 rounded-md font-semibold text-center text-[11px] transition flex items-center justify-center gap-1 ${
                lawyerContactFilter === "clients"
                  ? "bg-emerald-600 text-slate-950 font-bold"
                  : "text-gray-400 hover:text-white hover:bg-[#202c33]"
              }`}
            >
              <User className="h-3 w-3" />
              <span>Clients ({ALL_CONTACTS.filter(c => c.role === "client").length})</span>
            </button>

            <button
              onClick={() => setLawyerContactFilter("lawyers")}
              className={`flex-1 py-1.5 px-2 rounded-md font-semibold text-center text-[11px] transition flex items-center justify-center gap-1 ${
                lawyerContactFilter === "lawyers"
                  ? "bg-amber-500 text-slate-950 font-bold"
                  : "text-gray-400 hover:text-white hover:bg-[#202c33]"
              }`}
            >
              <Scale className="h-3 w-3 text-gold" />
              <span>Colleagues ({ALL_CONTACTS.filter(c => c.role === "lawyer").length})</span>
            </button>
          </div>
        ) : (
          /* Client View: Specifically states that ONLY verified Lawyers are shown */
          <div className="px-4 py-2 bg-[#182229] border-b border-[#222e35] flex items-center justify-between text-xs">
            <span className="text-[11px] font-bold text-amber-300 flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-gold" /> Verified Legal Counsel Only ({availableContacts.length})
            </span>
            <span className="text-[10px] text-gray-400">Client Confidentiality</span>
          </div>
        )}

        {/* Contacts List */}
        <div className="flex-1 overflow-y-auto divide-y divide-[#202c33]/50">
          {filteredContacts.map((contact) => {
            const isSelected = contact.id === selectedContactId;
            const isContactLawyer = contact.role === "lawyer";

            return (
              <div 
                key={contact.id}
                onClick={() => {
                  setSelectedContactId(contact.id.toString());
                  setShowProfileDrawer(false);
                }}
                className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors select-none ${
                  isSelected ? "bg-[#2a3942]" : "hover:bg-[#202c33]"
                }`}
              >
                {/* Avatar with Online indicator */}
                <div className="relative shrink-0">
                  <img 
                    src={contact.avatar} 
                    alt={contact.name} 
                    className={`w-12 h-12 rounded-full object-cover border-2 ${
                      isContactLawyer ? "border-amber-500/80" : "border-emerald-500/80"
                    }`}
                  />
                  {contact.online && (
                    <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-[#111b21] rounded-full"></div>
                  )}
                </div>

                {/* Details snippet */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 truncate">
                      <h3 className="font-semibold text-sm text-slate-100 truncate">
                        {contact.name}
                      </h3>
                      {/* SPECIFIC ROLE BADGE: Clearly distinguishes CLIENT vs ATTORNEY */}
                      {isContactLawyer ? (
                        <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded shrink-0">
                          Attorney
                        </span>
                      ) : (
                        <span className="bg-blue-500/20 text-blue-300 border border-blue-500/40 text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded shrink-0">
                          Client
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-gray-400 shrink-0 font-medium ml-1">
                      {contact.lastTime}
                    </span>
                  </div>

                  <p className="text-xs text-gray-400 truncate mt-0.5">
                    {contact.lastMessage}
                  </p>

                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border truncate max-w-[200px] ${
                      isContactLawyer
                        ? "bg-amber-950/40 text-amber-200 border-amber-900/60"
                        : "bg-emerald-950/40 text-emerald-300 border-emerald-900/60"
                    }`}>
                      {isContactLawyer ? (contact.specialization || "Legal Counsel") : (contact.caseType || "Legal Matter")}
                    </span>

                    {contact.unreadCount && contact.unreadCount > 0 ? (
                      <span className="ml-auto w-5 h-5 bg-emerald-500 text-slate-950 font-bold rounded-full text-[10px] flex items-center justify-center shrink-0">
                        {contact.unreadCount}
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })}

          {filteredContacts.length === 0 && (
            <div className="p-8 text-center text-gray-400 text-xs">
              No contacts found matching "{searchQuery}"
            </div>
          )}
        </div>

        {/* Bottom Banner */}
        <div className="p-3 bg-[#111b21] border-t border-[#222e35] text-[11px] text-gray-400 flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-emerald-400">
            <Lock className="h-3.5 w-3.5" /> End-to-end encrypted
          </span>
          <span className="text-gray-500">
            {perspectiveRole === "lawyer" ? "Practitioner Mode" : "Client Portal"}
          </span>
        </div>
      </aside>

      {/* ================= RIGHT MAIN (WHATSAPP CHAT CONVERSATION) ================= */}
      <main className="flex-1 flex flex-col h-full bg-[#0b141a] relative overflow-hidden">
        
        {/* WhatsApp Top Header Bar */}
        <header className="bg-[#202c33] px-4 py-3 flex items-center justify-between border-b border-[#2a3942] shrink-0 z-10 shadow-xs">
          {/* Active Contact Header Button */}
          <div 
            onClick={() => setShowProfileDrawer(!showProfileDrawer)}
            className="flex items-center gap-3 cursor-pointer group"
            title="Click to view full profile credentials and records"
          >
            <div className="relative shrink-0">
              <img 
                src={activeContact.avatar} 
                alt={activeContact.name} 
                className={`w-10 h-10 rounded-full object-cover border-2 transition ${
                  activeContact.role === "lawyer" 
                    ? "border-amber-500 group-hover:ring-2 group-hover:ring-amber-400" 
                    : "border-emerald-500 group-hover:ring-2 group-hover:ring-emerald-400"
                }`}
              />
              {activeContact.online && (
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-[#202c33] rounded-full"></div>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-slate-100 text-base leading-tight group-hover:text-emerald-400 transition">
                  {activeContact.name}
                </h2>
                
                {/* Explicit Role Badge in Chat Header */}
                {activeContact.role === "lawyer" ? (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-950/80 text-amber-300 border border-amber-800 font-bold flex items-center gap-1">
                    <Scale className="h-2.5 w-2.5 text-gold" />
                    <span>Attorney • Co-Counsel</span>
                  </span>
                ) : (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-950/80 text-blue-300 border border-blue-800 font-bold flex items-center gap-1">
                    <User className="h-2.5 w-2.5 text-blue-400" />
                    <span>Verified Client</span>
                  </span>
                )}
              </div>

              <p className="text-xs text-gray-400 group-hover:text-gray-200 transition flex items-center gap-1 mt-0.5">
                <span>{activeContact.subtitle}</span>
                <span className="text-emerald-400 text-[10px] underline ml-1 font-medium">
                  • View Profile
                </span>
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button 
              onClick={() => setShowScheduleModal(true)}
              className="bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 shadow-sm transition"
              title={activeContact.role === "client" ? "Schedule session with this client" : "Schedule co-counsel meeting"}
            >
              <Calendar className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">
                {activeContact.role === "client" ? "Book Session" : "Schedule Co-Counsel"}
              </span>
            </button>

            <button 
              onClick={() => alert(`Starting encrypted voice call with ${activeContact.name} (${activeContact.phone})...`)}
              className="p-2.5 text-gray-300 hover:text-white hover:bg-[#2a3942] rounded-full transition"
              title="Voice Call"
            >
              <Phone className="h-4 w-4" />
            </button>

            <button 
              onClick={() => alert(`Starting HD secure video consultation room for: ${activeContact.subtitle}`)}
              className="p-2.5 text-gray-300 hover:text-white hover:bg-[#2a3942] rounded-full transition"
              title="Video Call"
            >
              <Video className="h-4 w-4" />
            </button>

            <button 
              onClick={() => setShowProfileDrawer(!showProfileDrawer)}
              className={`p-2.5 rounded-full transition ${showProfileDrawer ? 'bg-emerald-600 text-slate-950' : 'text-gray-300 hover:text-white hover:bg-[#2a3942]'}`}
              title="Toggle Profile View"
            >
              <User className="h-4 w-4" />
            </button>
          </div>
        </header>

        {/* Chat Area with WhatsApp Patterned Background */}
        <div 
          className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4"
          style={{
            backgroundImage: `radial-gradient(#1f2c34 1px, transparent 1px)`,
            backgroundSize: "24px 24px"
          }}
        >
          {/* Security & Confidentiality Banner */}
          <div className="max-w-md mx-auto text-center my-2">
            <span className="bg-[#182229] border border-[#222e35] text-amber-300/90 text-[11px] font-medium px-4 py-1.5 rounded-lg inline-flex items-center gap-1.5 shadow-sm">
              <Lock className="h-3 w-3 text-gold" />
              {activeContact.role === "lawyer" 
                ? "Attorney-to-Attorney Work Product Privilege • Encrypted Co-Counsel Room" 
                : "Attorney-Client Privileged Communication • End-to-End Encrypted"}
            </span>
          </div>

          <div className="text-center my-3">
            <span className="bg-[#182229] text-gray-400 text-[10px] font-semibold uppercase tracking-wider px-3 py-1 rounded-md shadow-xs">
              Today
            </span>
          </div>

          {/* Clean WhatsApp Message Bubbles (NO REPETITIVE SENDER NAMES) */}
          {activeMessages.map((msg) => {
            const isOutgoing = msg.sender === "me";
            return (
              <div 
                key={msg.id} 
                className={`flex ${isOutgoing ? "justify-end" : "justify-start"} items-end gap-1.5`}
              >
                <div 
                  className={`max-w-[85%] sm:max-w-[70%] md:max-w-[62%] rounded-2xl px-3.5 py-2.5 shadow-md relative text-sm ${
                    isOutgoing 
                      ? "bg-[#005c4b] text-[#e9edef] rounded-tr-xs" 
                      : "bg-[#202c33] text-[#e9edef] rounded-tl-xs border border-[#2a3942]"
                  }`}
                >
                  {/* Optional File Attachment Card */}
                  {msg.attachment && (
                    <div className="mb-2 bg-[#111b21]/70 border border-white/10 rounded-xl p-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-9 h-9 rounded-lg bg-emerald-600/20 text-emerald-400 flex items-center justify-center shrink-0">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-xs text-white truncate">{msg.attachment.name}</p>
                          <p className="text-[10px] text-gray-400">{msg.attachment.size} • Privileged Attachment</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => alert(`Downloading verified legal file: ${msg.attachment?.name}`)}
                        className="p-1.5 hover:bg-white/10 rounded-lg text-emerald-400 transition shrink-0"
                        title="Download Document"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                    </div>
                  )}

                  {/* Message Text */}
                  <p className="leading-relaxed whitespace-pre-wrap select-text">{msg.text}</p>

                  {/* Timestamp & Double Checkmarks (✓✓) */}
                  <div className="flex items-center justify-end gap-1 mt-1 text-[10px] text-gray-300/80">
                    <span>{msg.time}</span>
                    {isOutgoing && (
                      <span className="text-[#53bdeb]" title="Read">
                        <CheckCheck className="h-3.5 w-3.5 inline" />
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips (Tailored to whether talking to a Client or Lawyer) */}
        <div className="bg-[#202c33]/70 px-4 py-2 border-t border-[#2a3942] flex items-center gap-2 overflow-x-auto text-xs shrink-0">
          <span className="text-[11px] text-gray-400 font-semibold shrink-0">Quick Responses:</span>
          {activeContact.role === "client" ? (
            <>
              <button 
                onClick={() => setInputText("I have received your document and will review it immediately.")}
                className="bg-[#111b21] hover:bg-[#2a3942] text-gray-300 px-3 py-1 rounded-full whitespace-nowrap text-xs transition border border-[#2a3942]"
              >
                "I have received your document..."
              </button>
              <button 
                onClick={() => setInputText("I have verified the revised contract terms and approve execution.")}
                className="bg-[#111b21] hover:bg-[#2a3942] text-gray-300 px-3 py-1 rounded-full whitespace-nowrap text-xs transition border border-[#2a3942]"
              >
                "Contract terms approved..."
              </button>
              <button 
                onClick={() => setInputText("Let's jump on a quick 15-minute video call to finalize this.")}
                className="bg-[#111b21] hover:bg-[#2a3942] text-gray-300 px-3 py-1 rounded-full whitespace-nowrap text-xs transition border border-[#2a3942]"
              >
                "Quick video call..."
              </button>
            </>
          ) : (
            <>
              <button 
                onClick={() => setInputText("I have reviewed your redline on the indemnity clause and agree with the carve-outs.")}
                className="bg-[#111b21] hover:bg-[#2a3942] text-amber-200 px-3 py-1 rounded-full whitespace-nowrap text-xs transition border border-amber-900/60"
              >
                "Reviewed redline & carve-outs..."
              </button>
              <button 
                onClick={() => setInputText("Let's co-author the appellate brief by Thursday before filing deadline.")}
                className="bg-[#111b21] hover:bg-[#2a3942] text-amber-200 px-3 py-1 rounded-full whitespace-nowrap text-xs transition border border-amber-900/60"
              >
                "Co-author brief by Thursday..."
              </button>
              <button 
                onClick={() => setInputText("I will share our expert witness disclosures for your review.")}
                className="bg-[#111b21] hover:bg-[#2a3942] text-amber-200 px-3 py-1 rounded-full whitespace-nowrap text-xs transition border border-amber-900/60"
              >
                "Share witness disclosures..."
              </button>
            </>
          )}
        </div>

        {/* WhatsApp Message Input Bar */}
        <div className="bg-[#202c33] p-3 border-t border-[#2a3942] shrink-0">
          <form onSubmit={handleSendMessage} className="flex items-center gap-2 max-w-5xl mx-auto">
            <button 
              type="button" 
              onClick={() => alert("Upload case document, legal brief, or contract redline (PDF, DOCX).")}
              className="p-2.5 text-gray-400 hover:text-emerald-400 hover:bg-[#2a3942] rounded-full transition"
              title="Attach File"
            >
              <Paperclip className="h-5 w-5" />
            </button>

            <input 
              type="text" 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`Message ${activeContact.name} (${activeContact.role === "lawyer" ? "Co-Counsel Privileged" : "Attorney-Client Confidential"})...`}
              className="flex-1 bg-[#2a3942] text-[#e9edef] placeholder-gray-400 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />

            <button 
              type="submit" 
              disabled={!inputText.trim()}
              className="p-2.5 bg-emerald-600 text-slate-950 font-bold rounded-full hover:bg-emerald-500 transition-colors disabled:opacity-40 disabled:hover:bg-emerald-600 shadow-sm"
              title="Send Message"
            >
              <Send className="h-5 w-5" />
            </button>
          </form>
        </div>
      </main>

      {/* ================= SLIDE-OVER PROFILE DETAILS (SPECIFIC TO CLIENT OR LAWYER) ================= */}
      {showProfileDrawer && (
        <aside className="w-full md:w-80 lg:w-96 bg-[#111b21] border-l border-[#222e35] flex flex-col shrink-0 h-full overflow-y-auto animate-fadeIn z-20">
          <div className="bg-[#202c33] p-4 flex items-center justify-between border-b border-[#2a3942]">
            <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
              {activeContact.role === "lawyer" ? (
                <>
                  <Scale className="h-4 w-4 text-gold" />
                  <span>Attorney Credentials & Co-Counsel</span>
                </>
              ) : (
                <>
                  <User className="h-4 w-4 text-emerald-400" />
                  <span>Client Profile & Case Records</span>
                </>
              )}
            </h3>
            <button 
              onClick={() => setShowProfileDrawer(false)}
              className="p-1 text-gray-400 hover:text-white rounded-lg hover:bg-[#2a3942]"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="p-6 text-center border-b border-[#222e35] bg-[#111b21]">
            <img 
              src={activeContact.avatar} 
              alt={activeContact.name} 
              className={`w-24 h-24 rounded-full object-cover mx-auto border-4 shadow-md ${
                activeContact.role === "lawyer" ? "border-amber-500" : "border-emerald-500"
              }`}
            />
            <h2 className="text-lg font-bold text-slate-100 mt-3">{activeContact.name}</h2>
            <p className={`text-xs font-semibold ${activeContact.role === "lawyer" ? "text-amber-400" : "text-emerald-400"}`}>
              {activeContact.role === "lawyer" ? activeContact.specialization : activeContact.caseType}
            </p>
            
            <span className={`inline-block uppercase text-[10px] font-extrabold px-3 py-1 mt-2 rounded-full border ${
              activeContact.role === "lawyer" 
                ? "bg-amber-950 text-amber-300 border-amber-800" 
                : "bg-emerald-950 text-emerald-300 border-emerald-800"
            }`}>
              {activeContact.role === "lawyer" ? "Verified Legal Practitioner" : "Verified Client"}
            </span>
          </div>

          <div className="p-4 space-y-4">
            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={() => {
                  setShowScheduleModal(true);
                  setShowProfileDrawer(false);
                }}
                className={`text-slate-950 font-bold p-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition shadow-sm ${
                  activeContact.role === "lawyer" ? "bg-amber-500 hover:bg-amber-400" : "bg-emerald-600 hover:bg-emerald-500"
                }`}
              >
                <Calendar className="h-4 w-4" /> 
                {activeContact.role === "lawyer" ? "Co-Counsel Meeting" : "Book Session"}
              </button>
              <button 
                onClick={() => alert(`Dialing ${activeContact.phone}...`)}
                className="bg-[#202c33] hover:bg-[#2a3942] text-slate-200 font-semibold p-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition border border-[#2a3942]"
              >
                <Phone className="h-4 w-4" /> Call Directly
              </button>
            </div>

            {/* If Contact is a Lawyer: Show Credentials */}
            {activeContact.role === "lawyer" ? (
              <div className="bg-[#202c33] rounded-xl p-4 space-y-3 border border-[#2a3942]">
                <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Award className="h-4 w-4 text-gold" /> Bar Standing & Qualifications
                </h4>
                <div className="text-xs space-y-2 text-gray-300">
                  <p><strong>Bar License:</strong> <span className="font-mono text-white">{activeContact.barNumber}</span></p>
                  <p><strong>Primary Jurisdiction:</strong> {activeContact.location}</p>
                  <p><strong>Hourly Rate:</strong> <span className="text-gold font-bold">${activeContact.feePerHour} / hr</span></p>
                  <p><strong>Degrees:</strong> {activeContact.qualifications}</p>
                </div>
              </div>
            ) : (
              /* If Contact is a Client: Show Matter & Case Details */
              <div className="bg-[#202c33] rounded-xl p-4 space-y-2 border border-[#2a3942]">
                <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider">Active Legal Matter</h4>
                <p className="text-xs text-slate-200 font-medium leading-relaxed">
                  {activeContact.subtitle}
                </p>
                {activeContact.notes && (
                  <div className="mt-2 pt-2 border-t border-[#2a3942] text-[11px] text-gray-400 italic">
                    "{activeContact.notes}"
                  </div>
                )}
              </div>
            )}

            {/* Contact Information */}
            <div className="bg-[#202c33] rounded-xl p-4 space-y-3 border border-[#2a3942]">
              <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider">Direct Contact Details</h4>
              <div className="flex items-center gap-2.5 text-xs text-gray-300">
                <Mail className="h-4 w-4 text-emerald-400 shrink-0" />
                <span className="truncate">{activeContact.email}</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-gray-300">
                <Phone className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>{activeContact.phone}</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-gray-300">
                <MapPin className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>{activeContact.location || "United States (Verified Standing)"}</span>
              </div>
            </div>

            {/* Shared Documents & Case Files */}
            <div className="bg-[#202c33] rounded-xl p-4 space-y-3 border border-[#2a3942]">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider">
                  Shared Documents ({activeContact.documents?.length || 0})
                </h4>
                <button 
                  onClick={() => alert("Upload case document or contract redline.")}
                  className="text-emerald-400 hover:text-emerald-300 text-xs flex items-center gap-1 font-semibold"
                >
                  <Plus className="h-3 w-3" /> Add
                </button>
              </div>

              {activeContact.documents?.map((doc, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-[#111b21] border border-[#2a3942]">
                  <div className="flex items-center gap-2 min-w-0">
                    <FileText className="h-4 w-4 text-gold shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-white truncate">{doc.title}</p>
                      <p className="text-[10px] text-gray-400">{doc.size} • {doc.date}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => alert(`Downloading verified file: ${doc.title}`)}
                    className="p-1 text-gray-400 hover:text-emerald-400 transition"
                  >
                    <Download className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>

          </div>
        </aside>
      )}

      {/* ================= MODAL: SCHEDULE CONSULTATION ================= */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-[#202c33] border border-[#2a3942] rounded-2xl max-w-md w-full p-6 text-slate-100 shadow-2xl animate-scaleUp">
            <div className="flex items-center justify-between pb-4 border-b border-[#2a3942]">
              <div>
                <h3 className="font-bold text-base text-white">
                  {activeContact.role === "client" ? "Book Appointment with Client" : "Schedule Co-Counsel Session"}
                </h3>
                <p className="text-xs text-emerald-400 mt-0.5">Scheduling session with {activeContact.name}</p>
              </div>
              <button 
                onClick={() => setShowScheduleModal(false)}
                className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-[#2a3942]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {bookingSuccess ? (
              <div className="py-8 text-center space-y-2">
                <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
                  <Check className="h-6 w-6" />
                </div>
                <h4 className="font-bold text-base text-white">Session Confirmed!</h4>
                <p className="text-xs text-gray-300">
                  Confirmed appointment registered in database and notification sent to {activeContact.name}.
                </p>
              </div>
            ) : (
              <form onSubmit={handleBookAppointment} className="space-y-4 mt-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Session Subject</label>
                  <input 
                    type="text" 
                    required
                    placeholder={`e.g. ${activeContact.subtitle}`}
                    value={bookingSubject}
                    onChange={(e) => setBookingSubject(e.target.value)}
                    className="w-full bg-[#111b21] border border-[#2a3942] rounded-lg px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">Date</label>
                    <input 
                      type="date" 
                      required
                      value={bookingDate}
                      onChange={(e) => setBookingDate(e.target.value)}
                      className="w-full bg-[#111b21] border border-[#2a3942] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">Time Slot</label>
                    <select 
                      value={bookingTime}
                      onChange={(e) => setBookingTime(e.target.value)}
                      className="w-full bg-[#111b21] border border-[#2a3942] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="09:00 AM">09:00 AM</option>
                      <option value="10:00 AM">10:00 AM</option>
                      <option value="11:30 AM">11:30 AM</option>
                      <option value="02:00 PM">02:00 PM</option>
                      <option value="04:00 PM">04:00 PM</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Meeting Mode</label>
                  <select 
                    value={bookingType}
                    onChange={(e) => setBookingType(e.target.value)}
                    className="w-full bg-[#111b21] border border-[#2a3942] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Video Call">Encrypted Video Conference</option>
                    <option value="Phone Call">Direct Phone Call</option>
                    <option value="In-Person">In-Office Meeting</option>
                  </select>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button 
                    type="button" 
                    onClick={() => setShowScheduleModal(false)}
                    className="px-4 py-2 rounded-lg text-xs font-semibold text-gray-300 hover:bg-[#2a3942]"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold px-4 py-2 rounded-lg text-xs shadow-md transition"
                  >
                    Confirm & Schedule
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
