"use client";
import API_BASE from "@/lib/api";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, Scale, User, LogOut, LayoutDashboard, Shield } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<{ full_name: string; email: string; role: string } | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Find a Lawyer", href: "/lawyers" },
    { name: "Legal Resources", href: "/resources" },
    { name: "News & Insights", href: "/news" },
    { name: "AI Assistant", href: "/ai" },
  ];

  const checkAuth = async () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      setUser(null);
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const userData = await res.json();
        setUser(userData);
      } else {
        localStorage.removeItem("token");
        setUser(null);
      }
    } catch {
      // Backend might be restarting
    }
  };

  useEffect(() => {
    checkAuth();
    window.addEventListener("storage", checkAuth);
    return () => window.removeEventListener("storage", checkAuth);
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    router.push("/");
  };

  const toggleMenu = () => setIsOpen(!isOpen);
  const isActive = (path: string) => pathname === path;

  return (
    <nav className="bg-primary text-white sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <Scale className="h-8 w-8 text-gold" />
              <div className="flex flex-col">
                <span className="font-serif font-bold text-xl tracking-wider leading-none">THE LAW GO</span>
                <span className="text-[10px] text-gold tracking-widest uppercase">Logical Opinion</span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`${
                  isActive(link.href) ? "text-gold font-semibold" : "text-gray-200"
                } hover:text-white transition-colors text-sm font-medium`}
              >
                {link.name}
              </Link>
            ))}

            {/* Quick Admin Portal Link if admin */}
            {user?.role === "admin" && (
              <Link
                href="/admin"
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 shadow-sm transition"
              >
                <Shield className="h-3.5 w-3.5" />
                <span>Admin Panel</span>
              </Link>
            )}

            <div className="flex items-center space-x-3 ml-4 pl-4 border-l border-blue-900">
              {user ? (
                <div className="flex items-center gap-3">
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-2 bg-blue-900/60 hover:bg-blue-800 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border border-blue-700/50"
                  >
                    <LayoutDashboard className="h-4 w-4 text-gold" />
                    <span>{user.full_name}</span>
                    <span className="text-[10px] uppercase bg-gold text-primary font-bold px-1.5 py-0.5 rounded">
                      {user.role}
                    </span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    title="Sign Out"
                    className="text-gray-300 hover:text-red-400 p-1.5 rounded-md transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <>
                  <Link href="/auth/login" className="text-sm font-medium text-gray-200 hover:text-gold transition-colors">
                    Login
                  </Link>
                  <Link
                    href="/auth/register"
                    className="bg-gold hover:bg-gold-light text-primary font-semibold px-4 py-2 rounded-md text-sm transition-colors shadow-sm"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-200 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-gold"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden bg-primary-dark border-t border-blue-900">
          <div className="px-3 pt-2 pb-4 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`${
                  isActive(link.href) ? "bg-primary text-gold font-bold" : "text-gray-200 hover:bg-primary hover:text-white"
                } block px-3 py-2 rounded-md text-base font-medium`}
              >
                {link.name}
              </Link>
            ))}

            {user?.role === "admin" && (
              <Link
                href="/admin"
                onClick={() => setIsOpen(false)}
                className="bg-amber-500 text-slate-950 font-bold block px-3 py-2 rounded-md text-base mt-2"
              >
                Admin Panel (Remove Lawyers & Edit Documents)
              </Link>
            )}

            <div className="pt-4 border-t border-blue-900 mt-2">
              {user ? (
                <div className="space-y-2">
                  <Link
                    href="/dashboard"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-between px-3 py-2 bg-blue-900 rounded-md text-white text-base font-medium"
                  >
                    <span>{user.full_name} ({user.role})</span>
                    <LayoutDashboard className="h-5 w-5 text-gold" />
                  </Link>
                  <button
                    onClick={() => { setIsOpen(false); handleLogout(); }}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 text-red-300 hover:bg-primary rounded-md text-base font-medium"
                  >
                    <LogOut className="h-5 w-5" /> Sign Out
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Link
                    href="/auth/login"
                    onClick={() => setIsOpen(false)}
                    className="text-gray-200 hover:bg-primary hover:text-white block px-3 py-2 rounded-md text-base font-medium"
                  >
                    Login
                  </Link>
                  <Link
                    href="/auth/register"
                    onClick={() => setIsOpen(false)}
                    className="bg-gold text-primary block px-3 py-2 rounded-md text-base font-semibold text-center"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}


