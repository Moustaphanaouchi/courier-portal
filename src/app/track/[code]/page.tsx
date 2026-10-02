"use client";

import { useLanguage } from "@/context/LanguageContext";
import { useParams, useRouter } from "next/navigation";
import { Package, Truck, CheckCircle2, MapPin, ArrowLeft, ArrowRight, Search, Clock } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function TrackingResultPage() {
  const { t, isRtl } = useLanguage();
  const params = useParams();
  const router = useRouter();
  const code = (params.code as string)?.toUpperCase();
  const [newCode, setNewCode] = useState("");

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (newCode.trim()) {
      router.push(`/track/${newCode.trim().toUpperCase()}`);
    }
  }

  // Mock data for the perfect UI demonstration
  const status = "IN_TRANSIT"; // PENDING, IN_TRANSIT, DELIVERED
  
  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-blue-600 selection:text-white" dir={isRtl ? "rtl" : "ltr"}>
      
      {/* Minimal Header */}
      <header className="bg-white border-b border-slate-200/80 sticky top-0 z-20">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-slate-800 hover:text-blue-600 transition-colors">
            {isRtl ? <ArrowRight className="w-5 h-5" /> : <ArrowLeft className="w-5 h-5" />}
            <span className="font-bold text-sm">{t("brandName")}</span>
          </Link>
          <div className="text-xs font-bold bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full border border-blue-100">
            {t("liveTracker")}
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 sm:py-12 space-y-8">
        
        {/* Tracking Input Bar */}
        <form onSubmit={handleSearch} className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl blur opacity-10 group-hover:opacity-20 transition duration-500"></div>
          <div className="relative flex items-center bg-white rounded-2xl border border-slate-200 shadow-sm p-1">
            <Search className={`w-5 h-5 absolute text-slate-400 pointer-events-none ${isRtl ? "right-4" : "left-4"}`} />
            <input
              type="text"
              value={newCode}
              onChange={(e) => setNewCode(e.target.value)}
              placeholder={t("trackingNumber")}
              className={`w-full py-3.5 text-base bg-transparent focus:outline-none text-slate-900 font-bold placeholder:font-medium placeholder:text-slate-400 ${
                isRtl ? "pr-12 pl-32 text-right" : "pl-12 pr-32 text-left"
              }`}
              dir="ltr"
            />
            <button
              type="submit"
              className={`absolute top-1 bottom-1 px-6 bg-slate-900 hover:bg-blue-600 text-white font-bold text-sm rounded-xl transition-all duration-300 shadow-md ${
                isRtl ? "left-1" : "right-1"
              }`}
            >
              {t("trackBtn")}
            </button>
          </div>
        </form>

        {/* Status Hero Card */}
        <div className="bg-white rounded-[2rem] border border-slate-200/80 shadow-lg shadow-slate-200/40 overflow-hidden relative">
          
          {/* Animated Gradient Top Bar */}
          <div className="h-2 w-full bg-linear-to-r from-blue-500 via-indigo-500 to-blue-500 bg-[length:200%_100%] animate-pulse"></div>
          
          <div className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{t("trackingNumber")}</p>
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{code}</h1>
              </div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 font-bold shadow-inner">
                <Truck className="w-5 h-5" />
                {t("outForDelivery")}
              </div>
            </div>

            <div className="h-px w-full bg-slate-100 mb-8"></div>

            {/* Premium Vertical Timeline */}
            <div className="relative pl-4 sm:pl-8 rtl:pr-4 sm:rtl:pr-8 rtl:pl-0">
              {/* Vertical Track Line */}
              <div className={`absolute top-2 bottom-2 w-0.5 bg-slate-100 ${isRtl ? 'right-6 sm:right-10' : 'left-6 sm:left-10'}`}></div>
              
              {/* Step 1: Created */}
              <div className="relative flex items-start gap-6 mb-10 group">
                <div className="absolute top-0 w-5 h-5 rounded-full bg-blue-600 border-4 border-white shadow-sm z-10 flex-shrink-0" style={{ [isRtl ? 'right' : 'left']: '-10px' }}></div>
                <div className={`flex-1 ${isRtl ? 'mr-6' : 'ml-6'}`}>
                  <h3 className="text-lg font-bold text-slate-900">{t("parcelRegistered") || "Parcel Registered"}</h3>
                  <p className="text-sm text-slate-500 mt-1 flex items-center gap-1.5"><MapPin className="w-4 h-4"/> Beirut Hub</p>
                  <p className="text-xs font-bold text-slate-400 mt-2 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5"/> Oct 24, 09:30 AM</p>
                </div>
              </div>

              {/* Step 2: Out for Delivery (Active) */}
              <div className="relative flex items-start gap-6 mb-10 group">
                <div className="absolute top-0 w-5 h-5 rounded-full bg-amber-500 border-4 border-white shadow-sm z-10 flex-shrink-0" style={{ [isRtl ? 'right' : 'left']: '-10px' }}>
                  <div className="absolute -inset-2 bg-amber-500/20 rounded-full animate-ping"></div>
                </div>
                <div className={`flex-1 ${isRtl ? 'mr-6' : 'ml-6'}`}>
                  <h3 className="text-lg font-extrabold text-amber-600">{t("outForDelivery")}</h3>
                  <p className="text-sm font-medium text-slate-600 mt-1 flex items-center gap-1.5"><Truck className="w-4 h-4"/> Driver: Hassan M.</p>
                  <p className="text-xs font-bold text-slate-400 mt-2 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5"/> Today, 08:15 AM</p>
                </div>
              </div>

              {/* Step 3: Delivered (Pending) */}
              <div className="relative flex items-start gap-6 group opacity-40">
                <div className="absolute top-0 w-5 h-5 rounded-full bg-slate-200 border-4 border-white shadow-sm z-10 flex-shrink-0" style={{ [isRtl ? 'right' : 'left']: '-10px' }}></div>
                <div className={`flex-1 ${isRtl ? 'mr-6' : 'ml-6'}`}>
                  <h3 className="text-lg font-bold text-slate-500">{t("delivered")}</h3>
                  <p className="text-sm text-slate-400 mt-1 flex items-center gap-1.5"><MapPin className="w-4 h-4"/> {t("destination")}</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}