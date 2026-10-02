"use client";

import { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { MapPin, Phone, MessageCircle, QrCode, CheckCircle2 } from "lucide-react";

export default function DriverRunSheet() {
  const { t, isRtl } = useLanguage();
  const [activeTab, setActiveTab] = useState<"pending" | "completed">("pending");

  // Mock data for UI perfection
  const deliveries = [
    { id: "CDX-882194", recipient: "Mazen Daher", phone: "+96170123456", address: "Beirut - Hamra, Bliss St", cod: 45, currency: "USD", status: "PENDING" },
    { id: "CDX-993021", recipient: "Nour Kassir", phone: "+96103987654", address: "Jounieh - Highway", cod: 3500000, currency: "LBP", status: "PENDING" }
  ];

  return (
    <div className="min-h-screen bg-slate-50 pb-20 font-sans selection:bg-blue-600 selection:text-white" dir={isRtl ? "rtl" : "ltr"}>
      {/* Mobile App Header */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-slate-200/80 px-4 pt-6 pb-4 shadow-sm sticky top-0 z-20">
        <div className="flex justify-between items-center mb-5">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">{t("activeRunSheet")}</h1>
            <p className="text-sm font-semibold text-slate-500 mt-1">{t("pendingDeliveries")}: {deliveries.length}</p>
          </div>
          <button className="w-12 h-12 bg-blue-600 text-white rounded-[1.25rem] flex items-center justify-center shadow-lg shadow-blue-600/30 active:scale-90 transition-all duration-200 cursor-pointer">
            <QrCode className="w-5 h-5" />
          </button>
        </div>

        {/* Segmented Control */}
        <div className="flex p-1.5 bg-slate-100 rounded-2xl shadow-inner">
          <button 
            onClick={() => setActiveTab("pending")}
            className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all duration-300 ${activeTab === "pending" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
          >
            {t("pendingPickup")}
          </button>
          <button 
            onClick={() => setActiveTab("completed")}
            className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all duration-300 ${activeTab === "completed" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
          >
            {t("delivered")}
          </button>
        </div>
      </div>

      {/* Delivery Cards */}
      <div className="p-4 space-y-5 mt-2">
        {deliveries.map((parcel) => (
          <div key={parcel.id} className="bg-white rounded-[2rem] border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow overflow-hidden group">
            <div className="p-6 border-b border-slate-100 relative overflow-hidden">
              {/* Subtle watermark */}
              <div className="absolute -right-6 -top-6 opacity-[0.02] pointer-events-none">
                <MapPin className="w-32 h-32" />
              </div>

              <div className="flex justify-between items-start mb-4 relative z-10">
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 text-amber-700 text-xs font-bold border border-amber-200/60 shadow-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  {parcel.id}
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">{t("collectCash")}</p>
                  <p className="text-xl font-extrabold text-emerald-600 tracking-tight">{parcel.cod} <span className="text-sm font-bold text-emerald-500">{parcel.currency}</span></p>
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-slate-900 relative z-10">{parcel.recipient}</h3>
              <div className="flex items-start gap-2.5 mt-2.5 text-slate-500 relative z-10">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-slate-400" />
                <p className="text-sm font-medium leading-relaxed">{parcel.address}</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="p-2.5 bg-slate-50/50 flex gap-2">
              <a href={`tel:${parcel.phone}`} className="flex-1 py-3.5 flex justify-center items-center gap-2 bg-white border border-slate-200/80 text-slate-700 rounded-2xl font-bold text-sm shadow-xs active:bg-slate-100 transition-colors">
                <Phone className="w-4 h-4 text-blue-500" />
                <span className="hidden sm:inline">{t("callCustomer")}</span>
              </a>
              <a href={`https://wa.me/${parcel.phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" className="flex-1 py-3.5 flex justify-center items-center gap-2 bg-white border border-slate-200/80 text-slate-700 rounded-2xl font-bold text-sm shadow-xs active:bg-slate-100 transition-colors">
                <MessageCircle className="w-4 h-4 text-emerald-500" />
                <span className="hidden sm:inline">{t("whatsappCustomer")}</span>
              </a>
              <button className="flex-[2] py-3.5 flex justify-center items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold text-sm shadow-md active:scale-95 transition-all duration-200 cursor-pointer">
                <CheckCircle2 className="w-4 h-4" />
                {t("markDelivered")}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}