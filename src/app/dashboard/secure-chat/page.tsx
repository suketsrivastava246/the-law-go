"use client";
import API_BASE from "@/lib/api";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { 
  ArrowLeft, Video, Phone, Paperclip, Send, Shield, Lock, FileText, 
  Download, Search, Check, CheckCheck, User, Calendar, 
  Clock, Mail, MapPin, X, Scale, Briefcase, Award, ShieldCheck, 
  RefreshCw, ArrowRightLeft
} from "lucide-react";
import { fetchAPI } from "@/lib/api";

interface ChatAllotment {
  id: string; // conversation key e.g. "lawyer-1_client-2"
  appointmentId: number;
  partnerId: number;
  partnerName: string;
  partnerRole: "lawyer" | "client";
  partnerEmail: string;
  partnerPhone: string;
  partnerAvatar: string;
  matterSubject: string;
  specialization: string;
  consultationType: string;
  date: string;
  timeSlot: string;
  status: string;
  barNumber?: string;
  rate?: number;
}

interface MessageItem {
  id: string;
  conversation_key: string;
  sender_role: "lawyer" | "client";
  sender_name: string;
  text: string;
  time: string;
  status: "sent" | "delivered" | "read";
  created_at?: string;
  attachment?: { name: string; size: string; type: string };
}

export default function BookedAllotmentSecureChat() {
  // Current active persona: "lawyer" (Adv. Sarah Jenkins) or "client" (John Doe)
  const [activePersona, setActivePersona] = useState<"lawyer" | "client">("lawyer");
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Allotments loaded from live appointments (strictly booked consultations)
  const [allotments, setAllotments] = useState<ChatAllotment[]>([]);
  const [selectedAllotmentId, setSelectedAllotmentId] = useState<string>("lawyer-1_client-2");

  // Messages loaded from shared backend (/api/messages)
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [inputText, setInputText] = useState("");
  const [sending, setSending] = useState(false);
  const [showProfileDrawer, setShowProfileDrawer] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. Check logged-in user and determine initial persona
  useEffect(() => {
    fetchAPI("/auth/me")
      .then((me) => {
        if (me) {
          setCurrentUser(me);
          if (me.role === "client") {
            setActivePersona("client");
          } else {
            setActivePersona("lawyer");
          }
        }
      })
      .catch((e) => console.error(e));
  }, []);

  // 2. Fetch live booked appointments & construct strictly allotted chats
  useEffect(() => {
    const loadAllotments = async () => {
      try {
        const apps = await fetchAPI("/appointments/me");
        if (apps && apps.length > 0) {
          const mapped: ChatAllotment[] = apps.map((a: any) => {
            const lawyerId = a.lawyer_id || (a.lawyer?.id || 1);
            const clientId = a.client_id || (a.client?.id || 2);
            const convKey = `lawyer-${lawyerId}_client-${clientId}`;

            // If active persona is Lawyer, the chat partner is the Client
            // If active persona is Client, the chat partner is the Lawyer
            if (activePersona === "lawyer") {
              return {
                id: convKey,
                appointmentId: a.id,
                partnerId: clientId,
                partnerName: a.client?.full_name || "John Doe",
                partnerRole: "client" as const,
                partnerEmail: a.client?.email || "john@example.com",
                partnerPhone: a.client?.phone || "+1 555-019-2831",
                partnerAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&auto=format&fit=crop",
                matterSubject: a.brief_subject || "Commercial Lease & Breach of Contract Advisory",
                specialization: a.specialization || "Commercial & Corporate Law",
                consultationType: a.consultation_type || "Video Call",
                date: a.date || "2026-11-04",
                timeSlot: a.time_slot || "10:00 AM",
                status: a.status || "confirmed"
              };
            } else {
              return {
                id: convKey,
                appointmentId: a.id,
                partnerId: lawyerId,
                partnerName: a.lawyer?.full_name || "Adv. Sarah Jenkins",
                partnerRole: "lawyer" as const,
                partnerEmail: a.lawyer?.email || "sarah.jenkins@thelawgo.com",
                partnerPhone: a.lawyer?.phone || "+1 212-555-0143",
                partnerAvatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=150&auto=format&fit=crop",
                matterSubject: a.brief_subject || "Child Custody & Agreement Review",
                specialization: a.specialization || "Family & Marriage Law",
                consultationType: a.consultation_type || "Video Call",
                date: a.date || "2026-11-04",
                timeSlot: a.time_slot || "10:00 AM",
                status: a.status || "confirmed",
                barNumber: "NY-984210",
                rate: 150
              };
            }
          });

          setAllotments(mapped);
          if (mapped.length > 0) {
            setSelectedAllotmentId(mapped[0].id);
          }
        } else {
          // Default confirmed allotment between Adv. Sarah Jenkins and John Doe
          const defaultKey = "lawyer-1_client-2";
          if (activePersona === "lawyer") {
            setAllotments([
              {
                id: defaultKey,
                appointmentId: 1,
                partnerId: 2,
                partnerName: "John Doe",
                partnerRole: "client",
                partnerEmail: "john@example.com",
                partnerPhone: "+1 555-019-2831",
                partnerAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&auto=format&fit=crop",
                matterSubject: "Commercial Lease & Breach of Contract Advisory",
                specialization: "Corporate & Contracts",
                consultationType: "Video Call",
                date: "2026-11-04",
                timeSlot: "10:00 AM",
                status: "confirmed"
              }
            ]);
          } else {
            setAllotments([
              {
                id: defaultKey,
                appointmentId: 1,
                partnerId: 1,
                partnerName: "Adv. Sarah Jenkins",
                partnerRole: "lawyer",
                partnerEmail: "sarah.jenkins@thelawgo.com",
                partnerPhone: "+1 212-555-0143",
                partnerAvatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=150&auto=format&fit=crop",
                matterSubject: "Commercial Lease & Contract Advisory",
                specialization: "Family & Commercial Law",
                consultationType: "Video Call",
                date: "2026-11-04",
                timeSlot: "10:00 AM",
                status: "confirmed",
                barNumber: "NY-984210",
                rate: 150
              }
            ]);
          }
          setSelectedAllotmentId(defaultKey);
        }
      } catch (err) {
        console.error("Failed to load booked allotments", err);
      }
    };

    loadAllotments();
  }, [activePersona]);

  // 3. Fetch messages from shared server API (/api/messages)
  const fetchMessages = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/messages?conversation_key=${selectedAllotmentId}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchMessages();
    // Poll every 2.5 seconds to pass messages live between both parties!
    const timer = setInterval(fetchMessages, 2500);
    return () => clearInterval(timer);
  }, [selectedAllotmentId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 4. Send Message to the shared server store
  const handleSendMessage = async (e?: React.FormEvent, customText?: string) => {
    if (e) e.preventDefault();
    const textToSend = customText || inputText;
    if (!textToSend.trim() || sending) return;

    setSending(true);
    setInputText("");

    const senderName = activePersona === "lawyer" ? "Adv. Sarah Jenkins" : "John Doe";
    const appointmentId = currentAllotment?.appointmentId || 1;

    try {
      const res = await fetch(`${API_BASE}/api/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversation_key: selectedAllotmentId,
          appointment_id: appointmentId,
          sender_role: activePersona,
          sender_name: senderName,
          text: textToSend.trim(),
        }),
      });

      if (res.ok) {
        const newMsg = await res.json();
        setMessages((prev) => [...prev, newMsg]);
      }
    } catch (err) {
      console.error("Error sending message", err);
    } finally {
      setSending(false);
    }
  };

  const currentAllotment = allotments.find((a) => a.id === selectedAllotmentId) || allotments[0];

  return (
    <div className="h-full w-full bg-[#111b21] text-slate-100 flex flex-col md:flex-row overflow-hidden font-sans select-none">
      
      {/* ================= LEFT SIDEBAR (BOOKED ALLOTMENT LIST ONLY) ================= */}
      <aside className={`w-full md:w-96 lg:w-[400px] bg-[#111b21] border-r border-[#222e35] flex flex-col shrink-0 h-full ${showProfileDrawer ? 'hidden lg:flex' : 'flex'}`}>
        
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
                {activePersona === "lawyer" ? "SJ" : "JD"}
              </div>
              <div>
                <h2 className="font-semibold text-sm text-slate-100 leading-tight">
                  {activePersona === "lawyer" ? "Adv. Sarah Jenkins" : "John Doe"}
                </h2>
                <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
                  {activePersona === "lawyer" ? "Practitioner View" : "Client View"}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Persona Switcher Button (Allows instant switching to verify conversation from both ends!) */}
          <button
            onClick={() => {
              const next = activePersona === "lawyer" ? "client" : "lawyer";
              setActivePersona(next);
            }}
            className="text-[11px] bg-[#111b21] hover:bg-[#2a3942] text-gold border border-gold/40 px-2.5 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 shadow-xs"
            title="Switch between Lawyer and Client views to see the message sent & received live!"
          >
            <ArrowRightLeft className="h-3.5 w-3.5" />
            <span>Switch to {activePersona === "lawyer" ? "Client View" : "Lawyer View"}</span>
          </button>
        </div>

        {/* Section Notice: Strictly Booked Consultations Only */}
        <div className="p-3 bg-[#182229] border-b border-[#222e35] flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-amber-300 font-bold text-[11px]">
            <ShieldCheck className="h-4 w-4 text-gold shrink-0" />
            <span>
              {activePersona === "lawyer"
                ? `Booked Client Consultations (${allotments.length})`
                : `Booked Attorney Consultations (${allotments.length})`}
            </span>
          </div>
          <button 
            onClick={fetchMessages}
            className="text-gray-400 hover:text-white p-1 rounded" 
            title="Refresh Live Messages"
          >
            <RefreshCw className="h-3 w-3" />
          </button>
        </div>

        {/* Allotted Contacts List (NO UNBOOKED/RANDOM PROFILES) */}
        <div className="flex-1 overflow-y-auto divide-y divide-[#202c33]/50">
          {allotments.map((allotment) => {
            const isSelected = allotment.id === selectedAllotmentId;
            const lastMsg = messages.length > 0 ? messages[messages.length - 1].text : "Consultation allotment confirmed.";

            return (
              <div 
                key={allotment.id}
                onClick={() => setSelectedAllotmentId(allotment.id)}
                className={`flex items-center gap-3 px-4 py-3.5 cursor-pointer transition-colors select-none ${
                  isSelected ? "bg-[#2a3942]" : "hover:bg-[#202c33]"
                }`}
              >
                {/* Avatar with Status */}
                <div className="relative shrink-0">
                  <img 
                    src={allotment.partnerAvatar} 
                    alt={allotment.partnerName} 
                    className="w-12 h-12 rounded-full object-cover border-2 border-emerald-500/80"
                  />
                  <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-[#111b21] rounded-full"></div>
                </div>

                {/* Details snippet */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 truncate">
                      <h3 className="font-semibold text-sm text-slate-100 truncate">
                        {allotment.partnerName}
                      </h3>
                      {/* Explicit Role Tag */}
                      <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded shrink-0 border ${
                        allotment.partnerRole === "lawyer"
                          ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                          : "bg-blue-500/20 text-blue-300 border-blue-500/40"
                      }`}>
                        {allotment.partnerRole === "lawyer" ? "Attorney" : "Booked Client"}
                      </span>
                    </div>
                    <span className="text-[10px] text-emerald-400 font-semibold shrink-0">
                      Confirmed
                    </span>
                  </div>

                  <p className="text-xs text-gray-400 truncate mt-1">
                    {lastMsg}
                  </p>

                  <div className="flex items-center gap-2 mt-1.5 text-[10px] text-gray-400">
                    <span className="px-2 py-0.5 rounded-full bg-[#111b21] border border-[#2a3942] truncate max-w-[210px]">
                      {allotment.matterSubject}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Banner */}
        <div className="p-3 bg-[#111b21] border-t border-[#222e35] text-[11px] text-gray-400 flex items-center justify-between">
          <span className="flex items-center gap-1 text-emerald-400">
            <Lock className="h-3 w-3" /> Privileged Case Channel
          </span>
          <span className="text-gray-500 font-medium">Allotment Verified</span>
        </div>
      </aside>

      {/* ================= RIGHT MAIN (WHATSAPP CHAT CONVERSATION) ================= */}
      <main className="flex-1 flex flex-col h-full bg-[#0b141a] relative overflow-hidden">
        
        {/* WhatsApp Top Header Bar */}
        <header className="bg-[#202c33] px-4 py-3 flex items-center justify-between border-b border-[#2a3942] shrink-0 z-10 shadow-xs">
          {currentAllotment ? (
            <div 
              onClick={() => setShowProfileDrawer(!showProfileDrawer)}
              className="flex items-center gap-3 cursor-pointer group"
              title="Click to view full allotment details"
            >
              <div className="relative shrink-0">
                <img 
                  src={currentAllotment.partnerAvatar} 
                  alt={currentAllotment.partnerName} 
                  className="w-10 h-10 rounded-full object-cover border-2 border-emerald-500 group-hover:ring-2 group-hover:ring-emerald-400 transition"
                />
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-[#202c33] rounded-full"></div>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-bold text-slate-100 text-base leading-tight group-hover:text-emerald-400 transition">
                    {currentAllotment.partnerName}
                  </h2>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase border ${
                    currentAllotment.partnerRole === "lawyer"
                      ? "bg-amber-950/80 text-amber-300 border-amber-800"
                      : "bg-blue-950/80 text-blue-300 border-blue-800"
                  }`}>
                    {currentAllotment.partnerRole === "lawyer" ? "Verified Attorney" : "Booked Client"}
                  </span>
                </div>
                <p className="text-xs text-gray-400 group-hover:text-gray-200 transition flex items-center gap-1 mt-0.5">
                  <span className="truncate max-w-[320px]">{currentAllotment.matterSubject}</span>
                  <span className="text-emerald-400 text-[10px] underline ml-1 font-medium">
                    • Details
                  </span>
                </p>
              </div>
            </div>
          ) : (
            <div className="text-sm font-semibold text-gray-400">Loading Allotment...</div>
          )}

          {/* Action buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button 
              onClick={() => alert(`Starting encrypted voice call with ${currentAllotment?.partnerName} (${currentAllotment?.partnerPhone})...`)}
              className="p-2.5 text-gray-300 hover:text-white hover:bg-[#2a3942] rounded-full transition"
              title="Encrypted Voice Call"
            >
              <Phone className="h-4 w-4" />
            </button>

            <button 
              onClick={() => alert(`Launching verified video consultation for: ${currentAllotment?.matterSubject}`)}
              className="p-2.5 text-gray-300 hover:text-white hover:bg-[#2a3942] rounded-full transition"
              title="Encrypted Video Call"
            >
              <Video className="h-4 w-4" />
            </button>

            <button 
              onClick={() => setShowProfileDrawer(!showProfileDrawer)}
              className={`p-2.5 rounded-full transition ${showProfileDrawer ? 'bg-emerald-600 text-slate-950' : 'text-gray-300 hover:text-white hover:bg-[#2a3942]'}`}
              title="Toggle Allotment Profile Drawer"
            >
              <User className="h-4 w-4" />
            </button>
          </div>
        </header>

        {/* Live Messages Area with WhatsApp Patterned Background */}
        <div 
          className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4"
          style={{
            backgroundImage: `radial-gradient(#1f2c34 1px, transparent 1px)`,
            backgroundSize: "24px 24px"
          }}
        >
          {/* Privilege & Allotment Safeguard Banner */}
          <div className="max-w-md mx-auto text-center my-1">
            <span className="bg-[#182229] border border-[#222e35] text-amber-300 text-[11px] font-medium px-4 py-1.5 rounded-lg inline-flex items-center gap-1.5 shadow-sm">
              <Lock className="h-3 w-3 text-gold" />
              Direct Attorney-Client Communication • Privileged & Encrypted
            </span>
          </div>

          <div className="text-center my-2">
            <span className="bg-[#182229] text-gray-400 text-[10px] font-semibold uppercase tracking-wider px-3 py-1 rounded-md shadow-xs">
              Live Session
            </span>
          </div>

          {/* Render Real Synchronized Messages */}
          {messages.map((msg) => {
            // Outgoing if the sender_role matches the active persona!
            // i.e. When activePersona is 'lawyer' and sender_role is 'lawyer' -> it's my sent message (right).
            // When activePersona is 'client' and sender_role is 'client' -> it's my sent message (right).
            const isOutgoing = msg.sender_role === activePersona;

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
                  {/* Notice: Clean WhatsApp bubbles with NO redundant lawyer/client headers inside individual bubbles */}

                  {/* Attachment if present */}
                  {msg.attachment && (
                    <div className="mb-2 bg-[#111b21]/70 border border-white/10 rounded-xl p-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-9 h-9 rounded-lg bg-emerald-600/20 text-emerald-400 flex items-center justify-center shrink-0">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-xs text-white truncate">{msg.attachment.name}</p>
                          <p className="text-[10px] text-gray-400">{msg.attachment.size} • Privileged File</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => alert(`Downloading verified document: ${msg.attachment?.name}`)}
                        className="p-1.5 hover:bg-white/10 rounded-lg text-emerald-400 transition shrink-0"
                        title="Download Document"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                    </div>
                  )}

                  {/* Message Content */}
                  <p className="leading-relaxed whitespace-pre-wrap select-text">{msg.text}</p>

                  {/* Timestamp & Double Checkmarks (✓✓) */}
                  <div className="flex items-center justify-end gap-1 mt-1 text-[10px] text-gray-300/80">
                    <span>{msg.time}</span>
                    {isOutgoing && (
                      <span className="text-[#53bdeb]" title="Delivered and Read">
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

        {/* Quick Suggestion Chips Inside Chat */}
        <div className="bg-[#202c33]/70 px-4 py-2 border-t border-[#2a3942] flex items-center gap-2 overflow-x-auto text-xs shrink-0">
          <span className="text-[11px] text-gray-400 font-semibold shrink-0">Quick Responses:</span>
          {activePersona === "lawyer" ? (
            <>
              <button 
                onClick={() => handleSendMessage(undefined, "Hi John, I have reviewed your case details and we are on track.")}
                className="bg-[#111b21] hover:bg-[#2a3942] text-gray-300 px-3 py-1 rounded-full whitespace-nowrap text-xs transition border border-[#2a3942]"
              >
                "Hi John, I have reviewed your case..."
              </button>
              <button 
                onClick={() => handleSendMessage(undefined, "I have confirmed your consultation schedule. Please have your agreement draft ready.")}
                className="bg-[#111b21] hover:bg-[#2a3942] text-gray-300 px-3 py-1 rounded-full whitespace-nowrap text-xs transition border border-[#2a3942]"
              >
                "Confirmed your consultation schedule..."
              </button>
              <button 
                onClick={() => handleSendMessage(undefined, "Hi, let me know if you have any questions before our call.")}
                className="bg-[#111b21] hover:bg-[#2a3942] text-gray-300 px-3 py-1 rounded-full whitespace-nowrap text-xs transition border border-[#2a3942]"
              >
                "Hi, let me know if you have questions..."
              </button>
            </>
          ) : (
            <>
              <button 
                onClick={() => handleSendMessage(undefined, "Hi Counselor, thank you for following up. When can we discuss the next steps?")}
                className="bg-[#111b21] hover:bg-[#2a3942] text-gray-300 px-3 py-1 rounded-full whitespace-nowrap text-xs transition border border-[#2a3942]"
              >
                "Hi Counselor, when can we discuss next steps?"
              </button>
              <button 
                onClick={() => handleSendMessage(undefined, "Hi, I have sent over the documents you requested.")}
                className="bg-[#111b21] hover:bg-[#2a3942] text-gray-300 px-3 py-1 rounded-full whitespace-nowrap text-xs transition border border-[#2a3942]"
              >
                "Hi, I have sent the requested documents."
              </button>
            </>
          )}
        </div>

        {/* WhatsApp Message Input Bar */}
        <div className="bg-[#202c33] p-3 border-t border-[#2a3942] shrink-0">
          <form onSubmit={handleSendMessage} className="flex items-center gap-2 max-w-5xl mx-auto">
            <button 
              type="button" 
              onClick={() => alert("Attach case document, contract redline, or evidence file (PDF, DOCX).")}
              className="p-2.5 text-gray-400 hover:text-emerald-400 hover:bg-[#2a3942] rounded-full transition"
              title="Attach File"
            >
              <Paperclip className="h-5 w-5" />
            </button>

            <input 
              type="text" 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`Message ${currentAllotment?.partnerName || "counsel"} (Type 'Hi' and send)...`}
              className="flex-1 bg-[#2a3942] text-[#e9edef] placeholder-gray-400 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />

            <button 
              type="submit" 
              disabled={!inputText.trim() || sending}
              className="p-2.5 bg-emerald-600 text-slate-950 font-bold rounded-full hover:bg-emerald-500 transition-colors disabled:opacity-40 disabled:hover:bg-emerald-600 shadow-sm"
              title="Send Message"
            >
              <Send className="h-5 w-5" />
            </button>
          </form>
        </div>
      </main>

      {/* ================= SLIDE-OVER ALLOTMENT PROFILE DRAWER ================= */}
      {showProfileDrawer && currentAllotment && (
        <aside className="w-full md:w-80 lg:w-96 bg-[#111b21] border-l border-[#222e35] flex flex-col shrink-0 h-full overflow-y-auto animate-fadeIn z-20">
          <div className="bg-[#202c33] p-4 flex items-center justify-between border-b border-[#2a3942]">
            <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
              <User className="h-4 w-4 text-emerald-400" /> Allotment Profile Details
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
              src={currentAllotment.partnerAvatar} 
              alt={currentAllotment.partnerName} 
              className="w-24 h-24 rounded-full object-cover mx-auto border-4 border-emerald-500 shadow-md"
            />
            <h2 className="text-lg font-bold text-slate-100 mt-3">{currentAllotment.partnerName}</h2>
            <p className="text-xs text-emerald-400 font-semibold">{currentAllotment.specialization}</p>
            <span className="inline-block uppercase text-[10px] font-extrabold px-3 py-1 mt-2 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
              {currentAllotment.partnerRole === "lawyer" ? "Verified Attorney" : "Allotted Client"}
            </span>
          </div>

          <div className="p-4 space-y-4">
            {/* Consultation Allotment Summary */}
            <div className="bg-[#202c33] rounded-xl p-4 space-y-2 border border-[#2a3942]">
              <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider">Booked Legal Matter</h4>
              <p className="text-xs text-slate-200 font-medium leading-relaxed">
                {currentAllotment.matterSubject}
              </p>
              <div className="pt-2 border-t border-[#2a3942] flex items-center justify-between text-[11px] text-gray-400">
                <span className="flex items-center gap-1"><Calendar className="h-3 w-3 text-gold" /> {currentAllotment.date}</span>
                <span className="flex items-center gap-1"><Clock className="h-3 w-3 text-gold" /> {currentAllotment.timeSlot}</span>
              </div>
            </div>

            {/* Contact Details */}
            <div className="bg-[#202c33] rounded-xl p-4 space-y-3 border border-[#2a3942]">
              <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider">Contact Information</h4>
              <div className="flex items-center gap-2.5 text-xs text-gray-300">
                <Mail className="h-4 w-4 text-emerald-400 shrink-0" />
                <span className="truncate">{currentAllotment.partnerEmail}</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-gray-300">
                <Phone className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>{currentAllotment.partnerPhone}</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-gray-300">
                <MapPin className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>United States (Active Docket)</span>
              </div>
            </div>

            {/* Quick Actions */}
            <button 
              onClick={() => alert(`Starting direct consultation with ${currentAllotment.partnerName}...`)}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold p-3 rounded-xl text-xs flex items-center justify-center gap-2 transition shadow-sm"
            >
              <Video className="h-4 w-4" /> Start Consultation Session
            </button>
          </div>
        </aside>
      )}

    </div>
  );
}
