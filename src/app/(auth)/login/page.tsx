"use client";

import { useLanguage } from "@/context/LanguageContext";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Package, Lock, Mail, ArrowRight, Loader2 } from "lucide-react";

export default function LoginPage() {
  const { t, isRtl } = useLanguage();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to sign in");
      }

      if (data.user.role === "COURIER_ADMIN") {
        router.push("/admin/dispatch");
      } else if (data.user.role === "DRIVER") {
        router.push("/driver/run");
      } else {
        router.push("/merchant/parcels/new");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function fillDemo(demoEmail: string) {
    setEmail(demoEmail);
    setPassword("Password123!");
  }

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50 px-4 py-8">
      {/* Top spacer for balance */}
      <div className="h-4" />

      {/* Main Login Card */}
      <div className="max-w-md w-full mx-auto space-y-6 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
        <div className="text-center">
          <div className="mx-auto w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center mb-3 shadow-md">
            <Package className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Cedex Logistics
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {t("loginSubtitle")}
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("emailPlaceholder")}
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t("passwordPlaceholder")}
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-lg flex items-center justify-center gap-2 transition disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>{t("signIn")}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Quick-fill demo credentials */}
        <div className="border-t border-slate-100 pt-4">
          <p className="text-[11px] font-medium text-slate-400 mb-2 text-center uppercase tracking-wider">
            {t("quickFillDemo")} (Password123!)
          </p>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <button
              type="button"
              onClick={() => fillDemo("merchant@demo.com")}
              className="px-2 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-700 font-medium text-center transition"
            >
              Merchant
            </button>
            <button
              type="button"
              onClick={() => fillDemo("driver@demo.com")}
              className="px-2 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-700 font-medium text-center transition"
            >
              Driver
            </button>
            <button
              type="button"
              onClick={() => fillDemo("admin@demo.com")}
              className="px-2 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-700 font-medium text-center transition"
            >
              Hub Admin
            </button>
          </div>
        </div>

        {/* Merchant Onboarding Link */}
        <div className="border-t border-slate-100 pt-4 text-center">
          <p className="text-xs text-slate-500">
            {t("registerMerchantPrompt")}{" "}
            <Link href="/register" className="font-bold text-blue-600 hover:text-blue-700 hover:underline">
              {t("registerAsMerchant")}
            </Link>
          </p>
        </div>
      </div>

      {/* Clean Bottom Legal Footer */}
      <footer className="w-full text-center py-4">
        <div className="flex justify-center items-center gap-6 text-xs text-slate-400">
          <Link href="/about" className="hover:text-slate-600 transition">About</Link>
          <span>•</span>
          <Link href="/privacy" className="hover:text-slate-600 transition">Privacy Policy</Link>
          <span>•</span>
          <Link href="/terms" className="hover:text-slate-600 transition">Terms of Service</Link>
        </div>
        <p className="text-[11px] text-slate-400 mt-1">© 2026 Cedex Logistics. All rights reserved.</p>
      </footer>
    </div>
  );
}