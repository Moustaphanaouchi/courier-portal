"use client";

import { useLanguage } from "@/context/LanguageContext";
import { User, MapPin, Banknote, Package, ArrowRight, ChevronDown } from "lucide-react";

export default function NewParcelPage() {
  const { t, isRtl } = useLanguage();

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 sm:p-6 lg:p-10 font-sans selection:bg-blue-600 selection:text-white" dir={isRtl ? "rtl" : "ltr"}>
      <div className="max-w-4xl mx-auto space-y-6 md:space-y-8">
        
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {t("createNewDeliveryOrder")}
          </h1>
          <p className="text-sm font-medium text-slate-500 mt-2">
            {t("generateWaybillSubtitle")}
          </p>
        </div>

        <form className="space-y-8">
          
          {/* Section 1: Recipient Info */}
          <div className="bg-white rounded-[2rem] p-6 sm:p-8 border border-slate-200/80 shadow-sm relative overflow-hidden group hover:border-blue-200 transition-colors">
            <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity left-0"></div>
            
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-inner">
                <User className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">{t("recipientInfo")}</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">{t("customerName")}</label>
                <input type="text" placeholder={t("customerNamePlaceholder")} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-medium focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none transition-all placeholder:text-slate-400" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">{t("phone")}</label>
                <input type="text" placeholder={t("phonePlaceholder")} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-medium focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none transition-all placeholder:text-slate-400" dir="ltr" />
              </div>
            </div>
          </div>

          {/* Section 2: Destination */}
          <div className="bg-white rounded-[2rem] p-6 sm:p-8 border border-slate-200/80 shadow-sm relative overflow-hidden group hover:border-amber-200 transition-colors">
            <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-amber-400 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity left-0"></div>
            
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-inner">
                <MapPin className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">{t("destinationDetails")}</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">{t("governorate")}</label>
                <div className="relative">
                  <select className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-amber-500 focus:bg-white outline-none appearance-none transition-all">
                    <option value="">{t("reg_beirut")}</option>
                    <option value="mount_lebanon">{t("reg_mount_lebanon")}</option>
                    <option value="north">{t("reg_north")}</option>
                    <option value="south">{t("reg_south")}</option>
                  </select>
                  <ChevronDown className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none ${isRtl ? 'left-4' : 'right-4'}`} />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">{t("city")}</label>
                <input type="text" placeholder="..." className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-medium focus:ring-2 focus:ring-amber-500 focus:bg-white outline-none transition-all" />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">{t("address")}</label>
                <input type="text" placeholder={t("addressPlaceholder")} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-medium focus:ring-2 focus:ring-amber-500 focus:bg-white outline-none transition-all placeholder:text-slate-400" />
              </div>
            </div>
          </div>

          {/* Section 3: COD & Finance */}
          <div className="bg-white rounded-[2rem] p-6 sm:p-8 border border-slate-200/80 shadow-sm relative overflow-hidden group hover:border-emerald-200 transition-colors">
            <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-teal-500 opacity-0 group-hover:opacity-100 transition-opacity left-0"></div>
            
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-inner">
                  <Banknote className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-bold text-slate-900">{t("codTariff")}</h2>
              </div>
              <span className="hidden sm:inline-block px-3 py-1 bg-slate-100 text-slate-500 text-xs font-bold rounded-lg border border-slate-200">
                {t("courierMatrixBadge")}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">{t("codAmount")}</label>
                <div className="flex gap-2">
                  <input type="number" placeholder="0.00" className="flex-1 bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-lg font-black text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none transition-all" dir="ltr" />
                  <select className="w-24 bg-slate-100 border border-slate-200 rounded-xl py-3 px-2 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-emerald-500 outline-none text-center">
                    <option value="USD">USD</option>
                    <option value="LBP">LBP</option>
                  </select>
                </div>
              </div>
              
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col justify-center">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-bold text-slate-600">{t("deliveryFee")}</span>
                  <span className="font-black text-slate-900">$3.00</span>
                </div>
                <div className="flex justify-between items-center text-xs text-slate-400 mt-1">
                  <span>{t("fixedTariff")}</span>
                  <span>{t("standardWeightHint")}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-4">
            <button type="button" className="w-full bg-slate-900 hover:bg-blue-600 text-white rounded-2xl py-4 sm:py-5 font-bold text-base sm:text-lg shadow-xl shadow-blue-900/10 active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-3">
              <Package className="w-5 h-5" />
              {t("submitOrder")}
              <ArrowRight className={`w-5 h-5 opacity-70 ${isRtl ? 'rotate-180' : ''}`} />
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}