"use client";
import API_BASE from "@/lib/api";

import Link from "next/link";
import { Scale, Mail, Lock, LogIn, UserCheck, Shield, Briefcase } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const performLogin = async (loginEmail: string, loginPass: string) => {
    setError("");
    setLoading(true);
    
    try {
      const response = await fetch("${API_BASE}/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          username: loginEmail,
          password: loginPass,
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Invalid email or password");
      }

      const data = await response.json();
      localStorage.setItem("token", data.access_token);
      
      // Notify components of auth state change
      window.dispatchEvent(new Event("storage"));
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    performLogin(email, password);
  };

  const loginAs = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    performLogin(demoEmail, demoPass);
  };

  return (
    <div className="min-h-screen bg-ivory flex items-center justify-center p-4 py-16">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center justify-center mb-6">
            <Scale className="h-10 w-10 text-gold" />
          </Link>
          <h1 className="text-3xl font-serif font-bold text-slate-900">Welcome Back</h1>
          <p className="text-gray-600 mt-2">Log in to your THE LAW GO account</p>
        </div>

        {/* Demo Fast Login Pills */}
        <div className="mb-6 bg-blue-50/80 border border-blue-200 rounded-xl p-4">
          <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
            <UserCheck className="h-4 w-4 text-primary" /> Instant Demo Access (One-Click)
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => loginAs("john@example.com", "password123")}
              className="px-2.5 py-2 text-xs font-semibold bg-white text-primary border border-blue-200 rounded-lg hover:bg-blue-100/60 transition shadow-sm flex flex-col items-center text-center"
            >
              <UserCheck className="h-4 w-4 mb-1 text-primary" />
              <span>Client (John)</span>
            </button>
            <button
              type="button"
              onClick={() => loginAs("sarah.jenkins@thelawgo.com", "password123")}
              className="px-2.5 py-2 text-xs font-semibold bg-white text-primary border border-blue-200 rounded-lg hover:bg-blue-100/60 transition shadow-sm flex flex-col items-center text-center"
            >
              <Briefcase className="h-4 w-4 mb-1 text-primary" />
              <span>Lawyer (Sarah)</span>
            </button>
            <button
              type="button"
              onClick={() => loginAs("admin@thelawgo.com", "admin123")}
              className="px-2.5 py-2 text-xs font-semibold bg-white text-primary border border-blue-200 rounded-lg hover:bg-blue-100/60 transition shadow-sm flex flex-col items-center text-center"
            >
              <Shield className="h-4 w-4 mb-1 text-primary" />
              <span>Admin</span>
            </button>
          </div>
        </div>

        <div className="card p-8">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg text-sm mb-4">
              {error}
            </div>
          )}
          
          <form className="space-y-5" onSubmit={handleLogin}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-sm" 
                  placeholder="name@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <a href="#" className="text-xs font-medium text-primary hover:underline">Forgot password?</a>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-sm" 
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary flex justify-center items-center gap-2 py-3"
            >
              <LogIn className="h-5 w-5" /> {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <Link href="/auth/register" className="font-bold text-primary hover:underline">
              Register here
            </Link>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100 text-center text-sm text-gray-600">
            Are you a legal professional?{' '}
            <Link href="/auth/lawyer-registration" className="font-bold text-gold hover:underline">
              Join our network
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

