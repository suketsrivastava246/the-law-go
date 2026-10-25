"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Check if we are on a dedicated full-screen self-contained chat interface:
  // 1. WhatsApp Secure Chat (/dashboard/secure-chat)
  // 2. AI Legal Assistant (/ai)
  // 3. Chat redirect (/chat)
  const isFullScreenChat = 
    pathname.startsWith("/dashboard/secure-chat") || 
    pathname === "/ai" || 
    pathname === "/chat";

  if (isFullScreenChat) {
    return (
      <div className="fixed inset-0 h-[100dvh] w-screen overflow-hidden flex flex-col bg-ivory select-none">
        {children}
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <main className="flex-grow">{children}</main>
      <Footer />
    </>
  );
}
