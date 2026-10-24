"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Video, Phone, Paperclip, Send, Shield, Lock, FileText, Download } from "lucide-react";

export default function SecureChatPage() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "lawyer",
      text: "Hello John, I've reviewed the preliminary details you submitted for our consultation tomorrow.",
      time: "10:30 AM"
    },
    {
      id: 2,
      sender: "lawyer",
      text: "Could you please upload a copy of the related contract if you have it available? It will help us make the most of our time.",
      time: "10:31 AM"
    }
  ]);
  const [newMessage, setNewMessage] = useState("");

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    
    setMessages([...messages, {
      id: Date.now(),
      sender: "user",
      text: newMessage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]);
    setNewMessage("");
  };

  return (
    <div className="bg-ivory min-h-screen flex flex-col md:flex-row">
      {/* Quick Sidebar for Navigation back to Dashboard - Hidden on very small screens if needed, but keeping simple here */}
      <div className="hidden md:flex flex-col w-20 bg-primary text-white items-center py-6 border-r border-primary-dark">
        <Link href="/dashboard" className="p-3 hover:bg-primary-dark rounded-xl mb-4 transition-colors" title="Back to Dashboard">
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <div className="w-10 h-10 bg-white text-primary rounded-full flex items-center justify-center font-bold text-sm mb-4">
          JD
        </div>
      </div>

      <main className="flex-1 flex flex-col h-screen max-h-screen">
        {/* Chat Header */}
        <header className="bg-white border-b border-gray-200 p-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="md:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=100&auto=format&fit=crop" 
                alt="Adv. Sarah Jenkins" 
                className="w-10 h-10 rounded-full object-cover"
              />
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
            </div>
            <div>
              <h2 className="font-bold text-slate-900 leading-tight">Adv. Sarah Jenkins</h2>
              <p className="text-xs text-primary font-medium flex items-center gap-1">
                <Lock className="h-3 w-3" /> End-to-End Encrypted (Prototype)
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button className="p-2.5 text-slate-700 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors" title="Voice Call">
              <Phone className="h-5 w-5" />
            </button>
            <button className="p-2.5 text-white bg-primary hover:bg-primary-dark rounded-full transition-colors flex items-center gap-2 px-4" title="Start Video Consultation">
              <Video className="h-5 w-5" />
              <span className="hidden sm:inline font-medium text-sm">Join Call</span>
            </button>
          </div>
        </header>

        {/* Security Notice */}
        <div className="bg-yellow-50 text-center py-2 text-xs text-yellow-700 border-b border-yellow-100 shrink-0 flex justify-center items-center gap-1">
          <Shield className="h-3 w-3" /> Note: Encryption, recording, and transcription are prototype features only.
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 bg-slate-50 space-y-6">
          <div className="text-center">
            <span className="text-xs font-medium text-gray-400 bg-gray-100 px-3 py-1 rounded-full uppercase tracking-wider">Today</span>
          </div>

          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] ${msg.sender === 'user' ? 'bg-primary text-white rounded-l-2xl rounded-tr-2xl' : 'bg-white border border-gray-200 text-slate-800 rounded-r-2xl rounded-tl-2xl'} p-4 shadow-sm relative group`}>
                <p className="text-sm">{msg.text}</p>
                <span className={`text-[10px] mt-2 block ${msg.sender === 'user' ? 'text-blue-200' : 'text-gray-400'}`}>
                  {msg.time}
                </span>
              </div>
            </div>
          ))}

          {/* System Message example */}
          <div className="flex justify-center">
             <div className="bg-white border border-gray-200 rounded-lg p-3 max-w-sm w-full shadow-sm flex items-start gap-3">
               <div className="bg-blue-50 p-2 rounded-lg text-primary">
                 <FileText className="h-5 w-5" />
               </div>
               <div className="flex-1">
                 <p className="text-sm font-semibold text-slate-900">Consultation_Transcript_Oct20.pdf</p>
                 <p className="text-xs text-gray-500">Auto-generated record • 1.2 MB</p>
               </div>
               <button className="text-gray-400 hover:text-primary transition-colors p-1">
                 <Download className="h-4 w-4" />
               </button>
             </div>
          </div>
        </div>

        {/* Input Area */}
        <div className="bg-white border-t border-gray-200 p-4 shrink-0">
          <form onSubmit={handleSend} className="flex items-center gap-2 max-w-4xl mx-auto">
            <button type="button" className="p-3 text-gray-400 hover:text-primary bg-gray-50 rounded-xl transition-colors">
              <Paperclip className="h-5 w-5" />
            </button>
            <input 
              type="text" 
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a secure message..."
              className="flex-1 border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
            <button 
              type="submit" 
              disabled={!newMessage.trim()}
              className="p-3 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors disabled:opacity-50"
            >
              <Send className="h-5 w-5" />
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
