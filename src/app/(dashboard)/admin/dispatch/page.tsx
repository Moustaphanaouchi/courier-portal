"use client";

import { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { Truck, Map, Search, Package, Filter, ArrowRight } from "lucide-react";

export default function AdminDispatchPage() {
  const { t, isRtl } = useLanguage();

  // Mock unassigned parcels for UI layout
  const unassigned = [
    { id: "CDX-882194", recipient: "Mazen Daher", region: "Beirut", address: "Hamra, Bliss St, Al Noor Bldg", cod: "45", currency: "USD" },
    { id: "CDX-993021", recipient: "Nour Kassir", region: "Mount Lebanon", address: "Jounieh - Highway", cod: "3,500,000", currency: "LBP" },
    { id: "CDX-774110", recipient: "Ahmad Traboulsi", region: "North Lebanon", address: "Mina, Tripoli Corniche", cod: "20", currency: "USD" }
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 sm:p-6 lg:p-10 font-sans selection:bg-blue-600 selection:text-white" dir={isRtl ? "rtl" : "ltr"}>
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Premium Header Card */}
        <div className="bg-white rounded-[2rem] p-8 border border-slate-200/80 shadow-sm relative overflow-hidden">
          <div className="absolute -right-10 -top-10 opacity-[0.03] pointer-events-none">
            <Truck className="w-64 h-64" />
          </div>
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {t("hubDispatchBoard") || "Hub Dispatch & Assignment"}
              </h1>
              <p className="text-sm font-medium text-slate-500 mt-2 max-w-xl">
                {t("hubDispatchSubtitle") || "Route parcels to drivers based on Lebanese governorates."}
              </p>
            </div>
            
            {/* Live Stats */}
            <div className="flex items-center gap-4">
              <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-4 text-center min-w-[140px] shadow-inner">
                <p className="text-3xl font-black text-blue-600">{unassigned.length}</p>
                <p className="text-xs font-bold text-blue-800 uppercase tracking-wider mt-1">
                  {t("unassignedParcels") || "Unassigned"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="relative w-full sm:w-[24rem]">
            <Search className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 ${isRtl ? 'right-4' : 'left-4'}`} />
            <input 
              type="text" 
              placeholder={t("searchPlaceholder")}
              className={`w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 text-sm font-medium focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all placeholder:text-slate-400 ${isRtl ? 'pr-10 pl-4 text-right' : 'pl-10 pr-4 text-left'}`}
            />
          </div>
          
          <div className="relative w-full sm:w-auto min-w-[200px]">
            <Filter className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none ${isRtl ? 'right-4' : 'left-4'}`} />
            <select 
              className={`w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-600 appearance-none cursor-pointer transition-colors ${isRtl ? 'pr-10 pl-8' : 'pl-10 pr-8'}`}
            >
              <option value="ALL">{t("filterByRegion") || "Filter by Region"}</option>
              <option value="Beirut">{t("reg_beirut")}</option>
              <option value="Mount Lebanon">{t("reg_mount_lebanon")}</option>
              <option value="North">{t("reg_north")}</option>
              <option value="South">{t("reg_south")}</option>
              <option value="Bekaa">{t("reg_bekaa")}</option>
            </select>
          </div>
        </div>

        {/* Parcels Dispatch List */}
        <div className="space-y-4">
          {unassigned.map((parcel) => (
            <div key={parcel.id} className="bg-white rounded-[1.5rem] border border-slate-200/80 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 p-5 flex flex-col xl:flex-row xl:items-center justify-between gap-6 group">
              
              {/* Parcel Identity */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100 shadow-inner group-hover:scale-105 transition-transform">
                  <Package className="w-5 h-5 text-slate-400 group-hover:text-blue-500 transition-colors" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-xs font-black text-slate-800 bg-slate-100 px-2.5 py-1 rounded-md tracking-widest border border-slate-200/50">
                      {parcel.id}
                    </span>
                    <span className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-md">
                      {parcel.region}
                    </span>
                  </div>
                  <h3 className="text-lg font-extrabold text-slate-900">{parcel.recipient}</h3>
                  <div className="flex items-center gap-1.5 mt-1 text-slate-500">
                    <Map className="w-3.5 h-3.5" />
                    <p className="text-sm font-medium">{parcel.address}</p>
                  </div>
                </div>
              </div>

              {/* COD & Assignment Controls */}
              <div className="flex flex-col sm:flex-row items-center gap-4 xl:w-auto w-full border-t xl:border-t-0 border-slate-100 pt-4 xl:pt-0">
                
                {/* Financials */}
                <div className={`text-center sm:text-right ${isRtl ? 'sm:text-left' : ''} min-w-[120px]`}>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                    {t("codAmount")}
                  </p>
                  <p className="text-xl font-black text-emerald-600 tracking-tight">
                    {parcel.cod} <span className="text-sm font-bold text-emerald-500">{parcel.currency}</span>
                  </p>
                </div>

                <div className="h-10 w-px bg-slate-200 hidden sm:block"></div>

                {/* Assignment Dropdown */}
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <select className="flex-1 sm:w-56 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl py-3 px-4 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-600 outline-none cursor-pointer transition-colors shadow-inner">
                    <option value="">{t("selectDriver") || "Select Driver..."}</option>
                    <option value="driver1">Ahmad K. (Beirut Route)</option>
                    <option value="driver2">Hassan M. (North Route)</option>
                    <option value="driver3">Ali S. (Mount Lebanon)</option>
                  </select>
                  
                  <button className="bg-slate-900 hover:bg-blue-600 text-white p-3 rounded-xl transition-all shadow-md cursor-pointer group-hover:scale-105 duration-200 flex items-center justify-center">
                    <ArrowRight className={`w-5 h-5 ${isRtl ? 'rotate-180' : ''}`} />
                  </button>
                </div>
              </div>
              
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}