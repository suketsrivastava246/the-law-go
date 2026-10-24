"use client";
import API_BASE from "@/lib/api";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Send, Bot, User, ShieldAlert, Sparkles, BookOpen, ArrowRight, Lightbulb } from "lucide-react";

type Message = {
  id: string;
  role: "user" | "ai";
  content: string;
  resources?: string[];
};

const suggestedQuestions = [
  "What are tenant rights regarding notice and eviction?",
  "How does child custody work under family law?",
  "What makes a business contract legally binding?",
  "What are my rights if questioned by the police?",
];

export default function AILegalAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "ai",
      content:
        "Hello! I am THE LAW GO AI Assistant. Describe your situation or legal question, and I will summarize key statutory principles, procedural steps, and relevant educational resources.",
      resources: ["Understanding Your Fundamental Rights", "How to Prepare for a Legal Consultation"],
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  // Ref to the SCROLLABLE chat container — we scroll this, NOT the page
  const chatBoxRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll only inside the chat box
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
    setMessages((prev) => [...prev, { id: userMsgId, role: "user", content: query }]);
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
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "ai",
          content:
            "Regarding your question: General legal principles require reviewing your jurisdiction's civil or criminal code and relevant written agreements. We strongly recommend scheduling a consultation with a verified attorney on THE LAW GO to evaluate your specific facts.",
          resources: ["Understanding Your Fundamental Rights"],
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    /*
      KEY FIX: The outer page div no longer uses min-h-screen with flex justify-between.
      Instead we use a fixed-height layout so the chat box is a self-contained scrollable panel
      that never causes the page to scroll when new messages arrive.
    */
    <div className="bg-ivory min-h-screen">
      <div className="max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col" style={{ height: "calc(100vh - 64px)" }}>

        {/* Header */}
        <div className="text-center mb-4 shrink-0">
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 text-primary px-3 py-1 rounded-full text-xs font-semibold mb-2 shadow-sm">
            <Sparkles className="h-3.5 w-3.5 text-gold" /> AI-Powered Preliminary Legal Insights
          </div>
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-slate-900">THE LAW GO AI Assistant</h1>
          <p className="text-gray-600 text-xs md:text-sm mt-1">
            Get instant legal analysis, statutory guidance, and relevant resource citations.
          </p>
        </div>

        {/* Legal Safeguard Disclaimer */}
        <div className="bg-amber-50 border border-amber-200 text-amber-900 px-4 py-2.5 rounded-xl text-xs flex items-center gap-2.5 mb-4 shrink-0">
          <ShieldAlert className="h-4 w-4 text-amber-600 shrink-0" />
          <span>
            <strong>Legal Notice:</strong> This AI provides general educational information only. It does not constitute formal legal advice or create an attorney-client relationship.
          </span>
        </div>

        {/* ── Chat Messages Box ────────────────────────────────────────────────
            overflow-y-auto is on THIS div — only the chat scrolls, page stays fixed
        ───────────────────────────────────────────────────────────────────── */}
        <div
          ref={chatBoxRef}
          className="card flex-1 overflow-y-auto p-4 md:p-6 flex flex-col space-y-4 border border-gray-200 shadow-sm mb-0 rounded-b-none"
          style={{ minHeight: 0 }} // critical: allows flex child to shrink
        >
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-[88%] ${msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-white text-xs ${
                  msg.role === "user" ? "bg-primary" : "bg-gold text-primary font-bold"
                }`}
              >
                {msg.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
              </div>
              <div
                className={`p-4 rounded-2xl text-xs md:text-sm leading-relaxed whitespace-pre-line ${
                  msg.role === "user"
                    ? "bg-primary text-white rounded-tr-none"
                    : "bg-gray-100 text-slate-800 rounded-tl-none border border-gray-200/60"
                }`}
              >
                {msg.content}

                {/* Resource pills */}
                {msg.resources && msg.resources.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-200/80">
                    <p className="text-[11px] font-bold text-primary mb-1.5 flex items-center gap-1">
                      <BookOpen className="h-3 w-3" /> Relevant Legal Resources:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {msg.resources.map((r, i) => (
                        <Link
                          key={i}
                          href="/resources"
                          className="bg-white hover:bg-blue-50 text-slate-700 text-[11px] px-2.5 py-1 rounded-md border border-gray-200 font-medium inline-flex items-center gap-1 transition"
                        >
                          {r} <ArrowRight className="h-2.5 w-2.5 text-primary" />
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* AI typing indicator */}
          {isTyping && (
            <div className="flex gap-3 mr-auto max-w-[88%]">
              <div className="w-8 h-8 rounded-full bg-gold text-primary font-bold flex items-center justify-center shrink-0">
                <Bot className="h-4 w-4" />
              </div>
              <div className="p-4 bg-gray-100 rounded-2xl rounded-tl-none border border-gray-200 flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-primary/40 animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-primary/40 animate-bounce [animation-delay:0.2s]" />
                <div className="w-2 h-2 rounded-full bg-primary/40 animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          )}

          {/* Invisible scroll anchor */}
          <div ref={messagesEndRef} />
        </div>

        {/* ── Bottom Panel: Suggested Questions + Input ────────────────────── */}
        <div className="card border border-gray-200 border-t-0 rounded-t-none shadow-sm p-3 shrink-0">

          {/* Suggested questions — INSIDE the bottom panel, no extra page space */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-bold text-gray-400 self-center mr-1">
              <Lightbulb className="h-3 w-3 text-gold" /> Try:
            </span>
            {suggestedQuestions.map((q, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSend(undefined, q)}
                disabled={isTyping}
                className="text-[11px] bg-blue-50 hover:bg-blue-100 text-primary px-2.5 py-1 rounded-full border border-blue-200 transition font-medium text-left disabled:opacity-50"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input bar */}
          <form onSubmit={handleSend} className="relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Describe your legal question or situation in plain words..."
              className="w-full pl-4 pr-24 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary text-sm shadow-sm"
            />
            <button
              type="submit"
              disabled={isTyping || !input.trim()}
              className="absolute right-2 bg-primary hover:bg-primary-dark disabled:opacity-50 text-white px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition shadow-sm"
            >
              <span>Ask</span>
              <Send className="h-3.5 w-3.5" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}


