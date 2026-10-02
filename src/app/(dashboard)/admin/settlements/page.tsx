"use client";

import { useLanguage } from "@/context/LanguageContext";
import { Receipt, CheckCircle, UserCircle, Banknote, Package, Search } from "lucide-react";

export default function AdminSettlementsPage() {
  const { t, isRtl } = useLanguage();

  // Mock data representing drivers returning to the hub to hand over cash
  const pendingSettlements = [
    { id: "drv-001", name: "Ahmad K.", route: "Beirut Central", expectedUsd: 145, expectedLbp: "8,500,000", parcels: 12 },
    { id: "drv-002", name: "Hassan M.", route: "North Highway", expectedUsd: 80, expectedLbp: "4,000,000", parcels: 7 },
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 sm:p-6 lg:p-10 font-sans selection:bg-emerald-600 selection:text-white" dir={isRtl ? "rtl" : "ltr"}>
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Premium Header Card */}
        <div className="bg-white rounded-[2rem] p-8 border border-slate-200/80 shadow-sm relative overflow-hidden">
          <div className="absolute -right-10 -top-10 opacity-[0.03] pointer-events-none">
            <Receipt className="w-64 h-64" />
          </div>
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {t("settlementsTitle") || "Cash Settlements"}
              </h1>
              <p className="text-sm font-medium text-slate-500 mt-2 max-w-xl">
                {t("settlementsSubtitle") || "Verify physical cash collected by drivers."}
              </p>
            </div>
            
            {/* Action/Search */}
            <div className="relative w-full md:w-64">
              <Search className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 ${isRtl ? 'right-4' : 'left-4'}`} />
              <input 
                type="text" 
                placeholder={t("searchPlaceholder")}
                className={`w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 text-sm font-medium focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 transition-all placeholder:text-slate-400 ${isRtl ? 'pr-10 pl-4 text-right' : 'pl-10 pr-4 text-left'}`}
              />
            </div>
          </div>
        </div>

        {/* Settlements Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {pendingSettlements.length === 0 ? (
            <div className="col-span-full bg-white rounded-2xl p-10 text-center border border-slate-200 shadow-sm">
              <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-4 opacity-50" />
              <p className="text-slate-500 font-medium">{t("noPendingSettlements")}</p>
            </div>
          ) : (
            pendingSettlements.map((driver) => (
              <div key={driver.id} className="bg-white rounded-[1.5rem] border border-slate-200/80 shadow-sm hover:shadow-xl hover:shadow-emerald-900/5 hover:-translate-y-1 transition-all duration-300 p-6 flex flex-col justify-between group">
                
                {/* Driver Info */}
                <div className="flex items-center justify-between mb-6 pb-6 border-b border-slate-100">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200 text-slate-500">
                      <UserCircle className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">{driver.name}</h3>
                      <p className="text-xs font-semibold text-slate-500">{driver.route}</p>
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200/60">
                    <Package className="w-4 h-4 text-slate-400" />
                    <span className="text-sm font-bold text-slate-700">{driver.parcels} {t("collectedParcels")}</span>
                  </div>
                </div>

                {/* Cash Expected */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-emerald-50/50 rounded-xl p-4 border border-emerald-100 shadow-inner">
                    <p className="text-[10px] font-bold text-emerald-600/80 uppercase tracking-wider mb-1">
                      {t("expectedUSD")}
                    </p>
                    <p className="text-2xl font-black text-emerald-700">${driver.expectedUsd}</p>
                  </div>
                  <div className="bg-slate-50/50 rounded-xl p-4 border border-slate-100 shadow-inner">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      {t("expectedLBP")}
                    </p>
                    <p className="text-xl font-bold text-slate-800 tracking-tight">{driver.expectedLbp} <span className="text-xs">LBP</span></p>
                  </div>
                </div>

                {/* Action */}
                <button className="w-full bg-slate-900 hover:bg-emerald-600 text-white rounded-xl py-3.5 font-bold text-sm shadow-md active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2">
                  <Banknote className="w-4 h-4" />
                  {t("actionReconcile")}
                </button>

              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}