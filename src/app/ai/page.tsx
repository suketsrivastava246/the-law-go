"use client";
import API_BASE from "@/lib/api";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { 
  Send, Bot, User, ShieldAlert, Sparkles, BookOpen, ArrowRight, 
  Lightbulb, ArrowLeft, RefreshCw, Scale, Lock, CheckCircle2 
} from "lucide-react";

type Message = {
  id: string;
  role: "user" | "ai";
  content: string;
  resources?: string[];
  timestamp?: string;
};

const suggestedQuestions = [
  "What are tenant rights regarding notice and eviction?",
  "How does child custody work under family law?",
  "What makes a business contract legally binding?",
  "What are my rights if questioned by law enforcement?",
  "How can I register a trademark for my business?",
];

export default function AILegalAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "ai",
      content:
        "Hello! I am THE LAW GO AI Assistant. Describe your situation or legal question, and I will analyze relevant statutes, legal standards, procedural steps, and recommended resources.",
      resources: ["Understanding Your Fundamental Rights", "How to Prepare for a Legal Consultation"],
      timestamp: "Just now"
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const chatBoxRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollChatToBottom = () => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTo({
        top: chatBoxRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    scrollChatToBottom();
  }, [messages, isTyping]);

  const handleSend = async (e?: React.FormEvent, customMsg?: string) => {
    if (e) e.preventDefault();
    const query = customMsg || input;
    if (!query.trim()) return;

    setInput("");
    const userMsgId = Date.now().toString();
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages((prev) => [
      ...prev, 
      { id: userMsgId, role: "user", content: query, timestamp: timeStr }
    ]);
    setIsTyping(true);

    try {
      const res = await fetch(`${API_BASE}/api/ai/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: query }),
      });

      if (!res.ok) throw new Error("AI service temporarily unavailable");
      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "ai",
          content: data.response,
          resources: data.relevant_resources,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "ai",
          content:
            "Regarding your inquiry: General legal principles require reviewing your specific jurisdiction's civil or criminal code and relevant written agreements. We strongly recommend scheduling a consultation with a verified attorney on THE LAW GO to evaluate your specific facts.",
          resources: ["Understanding Your Fundamental Rights"],
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: "1",
        role: "ai",
        content:
          "Chat session reset. What legal questions or compliance topics would you like to explore today?",
        resources: ["Understanding Your Fundamental Rights"],
        timestamp: "Just now"
      },
    ]);
  };

  return (
    <div className="h-full w-full flex flex-col bg-slate-900 text-slate-100 overflow-hidden font-sans select-none">
      
      {/* ── Top App Bar (Contained Header) ──────────────────────────────── */}
      <header className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between shrink-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <Link 
            href="/dashboard" 
            className="p-2 text-gray-400 hover:text-white hover:bg-slate-800 rounded-lg transition" 
            title="Return to Dashboard"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary text-gold flex items-center justify-center font-bold shadow-xs">
              <Scale className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif font-bold text-sm sm:text-base text-white leading-tight">
                  THE LAW GO AI Legal Assistant
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold uppercase bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Online
                </span>
              </div>
              <p className="text-[11px] text-gray-400">
                Statutory Analysis & Educational Guidance
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleResetChat}
            className="text-xs bg-slate-800 hover:bg-slate-700 text-gray-300 px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition"
            title="Start New Consultation"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">New Chat</span>
          </button>
          
          <Link
            href="/lawyers"
            className="text-xs bg-primary hover:bg-primary-dark text-white px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 shadow-sm transition"
          >
            <span>Find Attorney</span>
          </Link>
        </div>
      </header>

      {/* ── Notice Banner ────────────────────────────────────────────── */}
      <div className="bg-amber-950/40 border-b border-amber-900/40 text-amber-300 px-4 py-2 text-xs flex items-center justify-center gap-2 shrink-0">
        <ShieldAlert className="h-3.5 w-3.5 text-gold shrink-0" />
        <span className="truncate">
          <strong>Notice:</strong> Informational synthesis only. Does not establish formal legal representation.
        </span>
      </div>

      {/* ── Scrollable Chat Messages Feed ────────────────────────────── */}
      <div 
        ref={chatBoxRef}
        className="flex-1 min-h-0 overflow-y-auto p-4 md:p-6 space-y-4 bg-slate-900"
        style={{
          backgroundImage: `radial-gradient(#1e293b 1px, transparent 1px)`,
          backgroundSize: "24px 24px"
        }}
      >
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-[92%] sm:max-w-[80%] ${
                msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
              }`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-white text-xs shadow-xs ${
                  msg.role === "user" 
                    ? "bg-primary text-gold font-bold" 
                    : "bg-gold text-slate-950 font-bold"
                }`}
              >
                {msg.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
              </div>

              {/* Bubble */}
              <div
                className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-wrap select-text shadow-sm ${
                  msg.role === "user"
                    ? "bg-primary text-white rounded-tr-xs"
                    : "bg-slate-800 text-slate-100 rounded-tl-xs border border-slate-700"
                }`}
              >
                <p>{msg.content}</p>

                {/* Resource Links if present */}
                {msg.resources && msg.resources.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-700">
                    <p className="text-[11px] font-bold text-gold mb-1.5 flex items-center gap-1">
                      <BookOpen className="h-3.5 w-3.5" /> Recommended Statutory Library Resources:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {msg.resources.map((r, i) => (
                        <Link
                          key={i}
                          href="/resources"
                          className="bg-slate-900/90 hover:bg-slate-950 text-slate-200 text-[11px] px-2.5 py-1 rounded-md border border-slate-700 font-medium inline-flex items-center gap-1 transition"
                        >
                          {r} <ArrowRight className="h-2.5 w-2.5 text-gold" />
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-end gap-1 mt-1 text-[10px] text-gray-400">
                  <span>{msg.timestamp}</span>
                </div>
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex gap-3 mr-auto max-w-[80%] items-center">
              <div className="w-8 h-8 rounded-full bg-gold text-slate-950 font-bold flex items-center justify-center shrink-0">
                <Bot className="h-4 w-4" />
              </div>
              <div className="p-3 bg-slate-800 rounded-2xl rounded-tl-xs border border-slate-700 flex items-center gap-1.5">
                <span className="text-xs text-gray-400 font-medium mr-1">Analyzing statutory principles</span>
                <div className="w-1.5 h-1.5 rounded-full bg-gold animate-bounce" />
                <div className="w-1.5 h-1.5 rounded-full bg-gold animate-bounce [animation-delay:0.2s]" />
                <div className="w-1.5 h-1.5 rounded-full bg-gold animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* ── Fixed Bottom Panel (Suggestions & Typing Bar Contained Inside) ── */}
      <footer className="bg-slate-950 border-t border-slate-800 p-3 shrink-0 z-10 shadow-lg">
        <div className="max-w-4xl mx-auto space-y-2.5">
          
          {/* Quick Suggestions Chips (Inside the chat container) */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
            <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-bold text-gray-400 shrink-0 mr-1">
              <Lightbulb className="h-3 w-3 text-gold" /> Try Asking:
            </span>
            {suggestedQuestions.map((q, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSend(undefined, q)}
                disabled={isTyping}
                className="text-[11px] bg-slate-900 hover:bg-slate-800 text-slate-200 px-3 py-1 rounded-full border border-slate-700 transition font-medium text-left whitespace-nowrap shrink-0 disabled:opacity-50"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Typing / Search Bar */}
          <form onSubmit={handleSend} className="relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Describe your legal matter, contract clause, or question in plain words..."
              className="w-full pl-4 pr-24 py-3 bg-slate-900 border border-slate-700 text-white placeholder-gray-400 rounded-xl focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold text-xs sm:text-sm shadow-inner"
            />
            <button
              type="submit"
              disabled={isTyping || !input.trim()}
              className="absolute right-2 bg-gold hover:bg-gold-light text-slate-950 disabled:opacity-40 px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
            >
              <span>Ask</span>
              <Send className="h-3.5 w-3.5" />
            </button>
          </form>

          <p className="text-[10px] text-gray-500 text-center">
            Privileged session • End-to-end encrypted within THE LAW GO legal ecosystem.
          </p>

        </div>
      </footer>

    </div>
  );
}
