"use client";
import API_BASE from "@/lib/api";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { 
  ArrowLeft, Video, Phone, Paperclip, Send, Shield, Lock, FileText, 
  Download, Search, MoreVertical, Check, CheckCheck, User, Calendar, 
  Clock, Mail, MapPin, X, Plus, Sparkles, MessageSquare
} from "lucide-react";
import { fetchAPI } from "@/lib/api";

interface ClientContact {
  id: number;
  name: string;
  email: string;
  phone: string;
  matter: string;
  caseType: string;
  status: "Active" | "Retained" | "Consultation Pending";
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
  sender: "lawyer" | "client";
  text: string;
  time: string;
  status?: "sent" | "delivered" | "read";
  attachment?: { name: string; size: string; type: string };
}

const INITIAL_CLIENTS: ClientContact[] = [
  {
    id: 2,
    name: "John Doe",
    email: "john@example.com",
    phone: "+1 555-019-2831",
    matter: "Commercial Lease & Breach of Contract Advisory",
    caseType: "Corporate & Contracts",
    status: "Active",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&auto=format&fit=crop",
    lastMessage: "Thank you for reviewing the clauses. When can we sign the revised addendum?",
    lastTime: "11:42 AM",
    unreadCount: 1,
    online: true,
    notes: "Client operates a logistics franchise in Manhattan. Reviewing commercial arbitration terms.",
    documents: [
      { title: "Commercial_Lease_Addendum_Final.pdf", size: "2.4 MB", date: "Oct 24, 2026" },
      { title: "Arbitration_Notice_Draft.docx", size: "840 KB", date: "Oct 21, 2026" }
    ]
  },
  {
    id: 3,
    name: "Jane Smith",
    email: "client@thelawgo.com",
    phone: "+1 555-019-2832",
    matter: "Patent Trademark Registration & Licensing Agreement",
    caseType: "Intellectual Property",
    status: "Retained",
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
    id: 4,
    name: "Robert Taylor",
    email: "robert.taylor@techventures.io",
    phone: "+1 415-555-8822",
    matter: "Series A Seed Investment & Shareholder Voting Rights",
    caseType: "Venture Financing",
    status: "Active",
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
    id: 5,
    name: "Emily Davis",
    email: "emily.davis@healthcorp.org",
    phone: "+1 617-555-9011",
    matter: "Healthcare Regulatory Compliance & HIPAA Safeguards",
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
  }
];

const INITIAL_CONVERSATIONS: Record<number, Message[]> = {
  2: [
    {
      id: 1,
      sender: "client",
      text: "Hello Counselor, I have submitted the draft commercial lease agreement along with the landlord dispute notes.",
      time: "10:15 AM",
      status: "read"
    },
    {
      id: 2,
      sender: "lawyer",
      text: "Hello John, I have thoroughly reviewed Section 8 regarding the early termination penalty and repair liabilities.",
      time: "10:22 AM",
      status: "read"
    },
    {
      id: 3,
      sender: "lawyer",
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
      sender: "client",
      text: "Thank you for reviewing the clauses. When can we sign the revised addendum?",
      time: "11:42 AM",
      status: "read"
    }
  ],
  3: [
    {
      id: 1,
      sender: "client",
      text: "Good morning! The trademark examiner requested clarifying details regarding our class 42 software classification.",
      time: "Yesterday, 3:20 PM",
      status: "read"
    },
    {
      id: 2,
      sender: "lawyer",
      text: "I received the Office Action notice. We have 30 days to respond with our specimen of use and claim limitation. I will prepare the formal response by Friday.",
      time: "Yesterday, 4:05 PM",
      status: "read"
    },
    {
      id: 3,
      sender: "client",
      text: "I have uploaded the USPTO filing receipt for your docket records.",
      time: "Yesterday, 5:15 PM",
      status: "read"
    }
  ],
  4: [
    {
      id: 1,
      sender: "client",
      text: "Our lead VC sent over their revised term sheet this morning.",
      time: "Oct 22, 9:10 AM",
      status: "read"
    },
    {
      id: 2,
      sender: "lawyer",
      text: "Acknowledged Robert. I will evaluate the liquidation preference and board seat requirements today.",
      time: "Oct 22, 10:00 AM",
      status: "read"
    }
  ],
  5: [
    {
      id: 1,
      sender: "client",
      text: "Could we schedule a preliminary video conference for Tuesday afternoon?",
      time: "Oct 19, 2:30 PM",
      status: "read"
    }
  ]
};

export default function WhatsAppStyleSecureChat() {
  const [clients, setClients] = useState<ClientContact[]>(INITIAL_CLIENTS);
  const [selectedClientId, setSelectedClientId] = useState<number>(2);
  const [conversations, setConversations] = useState<Record<number, Message[]>>(INITIAL_CONVERSATIONS);
  const [inputText, setInputText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showProfileDrawer, setShowProfileDrawer] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [bookingDate, setBookingDate] = useState("2026-11-06");
  const [bookingTime, setBookingTime] = useState("10:00 AM");
  const [bookingType, setBookingType] = useState("Video Call");
  const [bookingSubject, setBookingSubject] = useState("");
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch current user & live clients if available
  useEffect(() => {
    const init = async () => {
      try {
        const me = await fetchAPI("/auth/me");
        if (me) setCurrentUser(me);

        const liveClients = await fetchAPI("/clients");
        if (liveClients && liveClients.length > 0) {
          // Merge with initial rich data
          setClients((prev) => {
            const map = new Map<number, ClientContact>();
            prev.forEach((c) => map.set(c.id, c));
            liveClients.forEach((lc: any) => {
              if (map.has(lc.id)) {
                map.set(lc.id, { ...map.get(lc.id)!, ...lc });
              } else {
                map.set(lc.id, {
                  id: lc.id,
                  name: lc.full_name || "Client",
                  email: lc.email,
                  phone: lc.phone || "+1 555-000-0000",
                  matter: "General Legal Advisory",
                  caseType: "General Matter",
                  status: "Active",
                  avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&auto=format&fit=crop",
                  lastMessage: "Inquiry registered via platform.",
                  lastTime: "Recently",
                  online: true
                });
              }
            });
            return Array.from(map.values());
          });
        }
      } catch (e) {
        console.error(e);
      }
    };
    init();
  }, []);

  const activeClient = clients.find((c) => c.id === selectedClientId) || clients[0];
  const activeMessages = conversations[selectedClientId] || [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedClientId, conversations]);

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    const newMsg: Message = {
      id: Date.now(),
      sender: "lawyer",
      text: inputText.trim(),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      status: "delivered"
    };

    setConversations((prev) => ({
      ...prev,
      [selectedClientId]: [...(prev[selectedClientId] || []), newMsg]
    }));

    // Update last message in client list
    setClients((prev) =>
      prev.map((c) =>
        c.id === selectedClientId
          ? { ...c, lastMessage: inputText.trim(), lastTime: "Just now" }
          : c
      )
    );

    setInputText("");
  };

  const handleBookAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetchAPI("/appointments/", {
        method: "POST",
        body: JSON.stringify({
          client_id: activeClient.id,
          specialization: activeClient.caseType,
          consultation_type: bookingType,
          date: bookingDate,
          time_slot: bookingTime,
          brief_subject: bookingSubject || `Follow-up Consultation with ${activeClient.name}`,
          detailed_description: `Direct session scheduled from attorney secure portal for matter: ${activeClient.matter}.`
        })
      });

      // Also append an automated confirmation message in chat
      const confirmMsg: Message = {
        id: Date.now(),
        sender: "lawyer",
        text: `I have scheduled our upcoming ${bookingType} for ${bookingDate} at ${bookingTime}. Calendar invites and encrypted video credentials have been placed on your dashboard.`,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        status: "delivered"
      };

      setConversations((prev) => ({
        ...prev,
        [selectedClientId]: [...(prev[selectedClientId] || []), confirmMsg]
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

  const filteredClients = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.matter.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
                {currentUser?.full_name ? currentUser.full_name[0] : "L"}
              </div>
              <div>
                <h2 className="font-semibold text-sm text-slate-100 leading-tight">
                  {currentUser?.full_name || "Legal Counsel"}
                </h2>
                <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
                  Online • WhatsApp Mode
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-1 text-gray-400">
            <button 
              onClick={() => setShowScheduleModal(true)}
              className="p-2 hover:bg-[#2a3942] hover:text-white rounded-full transition"
              title="Schedule Consultation with Client"
            >
              <Calendar className="h-5 w-5 text-gold" />
            </button>
            <Link 
              href="/dashboard" 
              className="text-xs bg-[#2a3942] hover:bg-[#32434e] text-slate-200 px-2.5 py-1.5 rounded-lg font-semibold transition"
            >
              Dashboard
            </Link>
          </div>
        </div>

        {/* Search Bar */}
        <div className="p-3 bg-[#111b21] border-b border-[#222e35]">
          <div className="bg-[#202c33] rounded-lg flex items-center px-3 py-2 text-gray-300 focus-within:ring-1 focus-within:ring-emerald-500">
            <Search className="h-4 w-4 text-gray-400 mr-2 shrink-0" />
            <input 
              type="text"
              placeholder="Search clients or active legal matters..."
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

        {/* Clients List */}
        <div className="flex-1 overflow-y-auto divide-y divide-[#202c33]/50">
          <div className="px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-gray-400 bg-[#111b21]/80">
            My Active Clients ({filteredClients.length})
          </div>

          {filteredClients.map((client) => {
            const isSelected = client.id === selectedClientId;
            return (
              <div 
                key={client.id}
                onClick={() => {
                  setSelectedClientId(client.id);
                  // On small screens, hide profile drawer to focus on chat
                  setShowProfileDrawer(false);
                }}
                className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors select-none ${
                  isSelected ? "bg-[#2a3942]" : "hover:bg-[#202c33]"
                }`}
              >
                {/* Client Avatar with Online indicator */}
                <div className="relative shrink-0">
                  <img 
                    src={client.avatar} 
                    alt={client.name} 
                    className="w-12 h-12 rounded-full object-cover border border-[#2a3942]"
                  />
                  {client.online && (
                    <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-[#111b21] rounded-full"></div>
                  )}
                </div>

                {/* Details snippet */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-sm text-slate-100 truncate">
                      {client.name}
                    </h3>
                    <span className="text-[11px] text-gray-400 shrink-0 font-medium">
                      {client.lastTime}
                    </span>
                  </div>

                  <p className="text-xs text-gray-400 truncate mt-0.5">
                    {client.lastMessage}
                  </p>

                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#202c33] text-gray-300 border border-[#2a3942]">
                      {client.caseType}
                    </span>
                    {client.unreadCount && client.unreadCount > 0 ? (
                      <span className="ml-auto w-5 h-5 bg-emerald-500 text-slate-950 font-bold rounded-full text-[10px] flex items-center justify-center">
                        {client.unreadCount}
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })}

          {filteredClients.length === 0 && (
            <div className="p-8 text-center text-gray-400 text-xs">
              No clients found matching "{searchQuery}"
            </div>
          )}
        </div>

        {/* Bottom Banner */}
        <div className="p-3 bg-[#111b21] border-t border-[#222e35] text-[11px] text-gray-400 flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-emerald-400">
            <Lock className="h-3.5 w-3.5" /> End-to-end encrypted
          </span>
          <span>THE LAW GO Secure</span>
        </div>
      </aside>

      {/* ================= RIGHT MAIN (WHATSAPP CHAT CONVERSATION) ================= */}
      <main className="flex-1 flex flex-col h-full bg-[#0b141a] relative overflow-hidden">
        
        {/* WhatsApp Top Header Bar */}
        <header className="bg-[#202c33] px-4 py-3 flex items-center justify-between border-b border-[#2a3942] shrink-0 z-10 shadow-xs">
          {/* Client Profile Header Button: Clicking opens the full Client Profile Details */}
          <div 
            onClick={() => setShowProfileDrawer(!showProfileDrawer)}
            className="flex items-center gap-3 cursor-pointer group"
            title="Click to view full client profile and legal records"
          >
            <div className="relative shrink-0">
              <img 
                src={activeClient.avatar} 
                alt={activeClient.name} 
                className="w-10 h-10 rounded-full object-cover border border-[#2a3942] group-hover:ring-2 group-hover:ring-emerald-400 transition"
              />
              {activeClient.online && (
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-[#202c33] rounded-full"></div>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-slate-100 text-base leading-tight group-hover:text-emerald-400 transition">
                  {activeClient.name}
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-800 font-semibold">
                  {activeClient.status}
                </span>
              </div>
              <p className="text-xs text-gray-400 group-hover:text-gray-200 transition flex items-center gap-1 mt-0.5">
                <span>{activeClient.matter}</span>
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
              title="Schedule consultation with this client"
            >
              <Calendar className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Book Session</span>
            </button>

            <button 
              onClick={() => alert(`Starting encrypted voice call with ${activeClient.name} (${activeClient.phone})...`)}
              className="p-2.5 text-gray-300 hover:text-white hover:bg-[#2a3942] rounded-full transition"
              title="Voice Call"
            >
              <Phone className="h-4 w-4" />
            </button>

            <button 
              onClick={() => alert(`Starting HD secure video consultation room for matter: ${activeClient.matter}`)}
              className="p-2.5 text-gray-300 hover:text-white hover:bg-[#2a3942] rounded-full transition"
              title="Video Call"
            >
              <Video className="h-4 w-4" />
            </button>

            <button 
              onClick={() => setShowProfileDrawer(!showProfileDrawer)}
              className={`p-2.5 rounded-full transition ${showProfileDrawer ? 'bg-emerald-600 text-slate-950' : 'text-gray-300 hover:text-white hover:bg-[#2a3942]'}`}
              title="Toggle Client Profile View"
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
              Attorney-Client Privileged Communication • End-to-End Encrypted
            </span>
          </div>

          <div className="text-center my-3">
            <span className="bg-[#182229] text-gray-400 text-[10px] font-semibold uppercase tracking-wider px-3 py-1 rounded-md shadow-xs">
              Today
            </span>
          </div>

          {/* Clean WhatsApp Message Bubbles (NO REPETITIVE SENDER NAMES) */}
          {activeMessages.map((msg) => {
            const isOutgoing = msg.sender === "lawyer";
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
                  {/* Notice: No repetitive lawyer or client name label inside the bubble, as requested! */}

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
                      <span className="text-[#53bdeb]" title="Read by client">
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

        {/* Quick Legal Suggestion Chips */}
        <div className="bg-[#202c33]/70 px-4 py-2 border-t border-[#2a3942] flex items-center gap-2 overflow-x-auto text-xs shrink-0">
          <span className="text-[11px] text-gray-400 font-semibold shrink-0">Quick Responses:</span>
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
        </div>

        {/* WhatsApp Message Input Bar */}
        <div className="bg-[#202c33] p-3 border-t border-[#2a3942] shrink-0">
          <form onSubmit={handleSendMessage} className="flex items-center gap-2 max-w-5xl mx-auto">
            <button 
              type="button" 
              onClick={() => alert("Upload case document, contract redline, or evidentiary file (PDF, DOCX, PNG).")}
              className="p-2.5 text-gray-400 hover:text-emerald-400 hover:bg-[#2a3942] rounded-full transition"
              title="Attach File"
            >
              <Paperclip className="h-5 w-5" />
            </button>

            <input 
              type="text" 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`Message ${activeClient.name} (Confidential & Encrypted)...`}
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

      {/* ================= SLIDE-OVER CLIENT PROFILE DETAILS ================= */}
      {showProfileDrawer && (
        <aside className="w-full md:w-80 lg:w-96 bg-[#111b21] border-l border-[#222e35] flex flex-col shrink-0 h-full overflow-y-auto animate-fadeIn z-20">
          <div className="bg-[#202c33] p-4 flex items-center justify-between border-b border-[#2a3942]">
            <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
              <User className="h-4 w-4 text-emerald-400" /> Client Profile & Details
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
              src={activeClient.avatar} 
              alt={activeClient.name} 
              className="w-24 h-24 rounded-full object-cover mx-auto border-4 border-[#202c33] shadow-md"
            />
            <h2 className="text-lg font-bold text-slate-100 mt-3">{activeClient.name}</h2>
            <p className="text-xs text-emerald-400 font-semibold">{activeClient.caseType}</p>
            <span className="inline-block uppercase text-[10px] font-bold px-3 py-1 mt-2 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
              {activeClient.status}
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
                className="bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold p-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition shadow-sm"
              >
                <Calendar className="h-4 w-4" /> Book Session
              </button>
              <button 
                onClick={() => alert(`Dialing ${activeClient.phone}...`)}
                className="bg-[#202c33] hover:bg-[#2a3942] text-slate-200 font-semibold p-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition border border-[#2a3942]"
              >
                <Phone className="h-4 w-4" /> Call Client
              </button>
            </div>

            {/* Contact Info */}
            <div className="bg-[#202c33] rounded-xl p-4 space-y-3 border border-[#2a3942]">
              <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider">Contact Information</h4>
              <div className="flex items-center gap-2.5 text-xs text-gray-300">
                <Mail className="h-4 w-4 text-emerald-400 shrink-0" />
                <span className="truncate">{activeClient.email}</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-gray-300">
                <Phone className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>{activeClient.phone}</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-gray-300">
                <MapPin className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>United States (Jurisdiction Registered)</span>
              </div>
            </div>

            {/* Matter & Case Summary */}
            <div className="bg-[#202c33] rounded-xl p-4 space-y-2 border border-[#2a3942]">
              <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider">Active Legal Matter</h4>
              <p className="text-xs text-slate-200 font-medium leading-relaxed">
                {activeClient.matter}
              </p>
              {activeClient.notes && (
                <div className="mt-2 pt-2 border-t border-[#2a3942] text-[11px] text-gray-400 italic">
                  "{activeClient.notes}"
                </div>
              )}
            </div>

            {/* Shared Documents */}
            <div className="bg-[#202c33] rounded-xl p-4 space-y-3 border border-[#2a3942]">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider">
                  Case Documents ({activeClient.documents?.length || 0})
                </h4>
                <button 
                  onClick={() => alert("Upload new legal document for this client.")}
                  className="text-emerald-400 hover:text-emerald-300 text-xs flex items-center gap-1 font-semibold"
                >
                  <Plus className="h-3 w-3" /> Add
                </button>
              </div>

              {activeClient.documents?.map((doc, idx) => (
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

      {/* ================= MODAL: SCHEDULE CONSULTATION WITH CLIENT ================= */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-[#202c33] border border-[#2a3942] rounded-2xl max-w-md w-full p-6 text-slate-100 shadow-2xl animate-scaleUp">
            <div className="flex items-center justify-between pb-4 border-b border-[#2a3942]">
              <div>
                <h3 className="font-bold text-base text-white">Book Appointment with Client</h3>
                <p className="text-xs text-emerald-400 mt-0.5">Scheduling session for {activeClient.name}</p>
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
                <h4 className="font-bold text-base text-white">Appointment Scheduled!</h4>
                <p className="text-xs text-gray-300">
                  Confirmed session registered in database and notification sent to {activeClient.name}.
                </p>
              </div>
            ) : (
              <form onSubmit={handleBookAppointment} className="space-y-4 mt-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Consultation Subject</label>
                  <input 
                    type="text" 
                    required
                    placeholder={`e.g. ${activeClient.matter}`}
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
                    Confirm & Send to Client
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
