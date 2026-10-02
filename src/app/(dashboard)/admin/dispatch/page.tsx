"use client";

import { useState, useEffect, useMemo } from "react";
import { useLanguage } from "@/context/LanguageContext";
import {
  Truck,
  MapPin,
  Search,
  Package,
  Filter,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
  Phone,
  UserCheck,
  Send,
  Navigation,
} from "lucide-react";

interface DriverItem {
  id: string;
  vehicleType?: string | null;
  plateNumber?: string | null;
  user: {
    name: string;
    phone: string;
    email: string;
  };
}

interface ParcelItem {
  id: string;
  trackingNumber: string;
  recipientName: string;
  recipientPhone: string;
  governorate: string;
  city: string;
  detailedAddress: string;
  codAmount: number | string;
  codCurrency: "USD" | "LBP";
  status: string;
  driverId?: string | null;
  merchant: {
    id: string;
    companyName: string;
    pickupCity?: string | null;
  };
  driver?: {
    id: string;
    user: {
      name: string;
      phone: string;
    };
  } | null;
}

export default function AdminDispatchPage() {
  const { isRtl, lang } = useLanguage();
  const [parcels, setParcels] = useState<ParcelItem[]>([]);
  const [drivers, setDrivers] = useState<DriverItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Tabs: READY (Unassigned) vs OUT_FOR_DELIVERY (Active Runs)
  const [activeTab, setActiveTab] = useState<"READY" | "ACTIVE">("READY");
  const [search, setSearch] = useState("");
  const [selectedGovernorate, setSelectedGovernorate] = useState("ALL");

  // Selection state
  const [selectedParcelIds, setSelectedParcelIds] = useState<string[]>([]);
  const [bulkDriverId, setBulkDriverId] = useState("");
  const [rowDriverIds, setRowDriverIds] = useState<Record<string, string>>({});
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [bulkSubmitting, setBulkSubmitting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);

  async function loadDispatchData() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/dispatch");
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to load dispatch data");
      }
      setParcels(data.parcels || []);
      setDrivers(data.drivers || []);
    } catch (err: any) {
      setError(err.message || "Failed to load unassigned parcels");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDispatchData();
  }, []);

  // Split into Ready vs Active Runs
  const unassignedParcels = useMemo(
    () => parcels.filter((p) => p.status !== "OUT_FOR_DELIVERY"),
    [parcels]
  );

  const activeRunsParcels = useMemo(
    () => parcels.filter((p) => p.status === "OUT_FOR_DELIVERY"),
    [parcels]
  );

  const currentPool = activeTab === "READY" ? unassignedParcels : activeRunsParcels;

  // Filter by governorate & search
  const filteredParcels = useMemo(() => {
    return currentPool.filter((p) => {
      const matchesGov =
        selectedGovernorate === "ALL" ||
        p.governorate?.toLowerCase() === selectedGovernorate.toLowerCase();
      const q = search.toLowerCase();
      const matchesSearch =
        !search ||
        p.trackingNumber.toLowerCase().includes(q) ||
        p.recipientName.toLowerCase().includes(q) ||
        p.recipientPhone.includes(q) ||
        p.city.toLowerCase().includes(q) ||
        p.merchant.companyName.toLowerCase().includes(q) ||
        (p.driver?.user?.name && p.driver.user.name.toLowerCase().includes(q));

      return matchesGov && matchesSearch;
    });
  }, [currentPool, selectedGovernorate, search]);

  // Handle single parcel assignment / reassignment
  async function handleAssignSingle(parcelId: string) {
    const driverId = rowDriverIds[parcelId];
    if (!driverId) {
      setFeedbackMsg({
        text: lang === "ar" ? "يرجى اختيار سائق أولاً" : "Please select a driver first",
        type: "error",
      });
      return;
    }

    setSubmittingId(parcelId);
    try {
      const res = await fetch("/api/admin/dispatch", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ parcelIds: [parcelId], driverId }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Assignment failed");
      }

      setFeedbackMsg({
        text:
          lang === "ar"
            ? "تم تعيين الطرد للسائق وإرسال التنبيه بنجاح!"
            : "Parcel successfully dispatched to driver!",
        type: "success",
      });
      setTimeout(() => setFeedbackMsg(null), 4000);
      loadDispatchData();
      setSelectedParcelIds((prev) => prev.filter((id) => id !== parcelId));
    } catch (err: any) {
      setFeedbackMsg({ text: err.message, type: "error" });
    } finally {
      setSubmittingId(null);
    }
  }

  // Handle bulk assignment
  async function handleBulkAssign() {
    if (selectedParcelIds.length === 0 || !bulkDriverId) return;

    setBulkSubmitting(true);
    try {
      const res = await fetch("/api/admin/dispatch", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ parcelIds: selectedParcelIds, driverId: bulkDriverId }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Bulk assignment failed");
      }

      setFeedbackMsg({
        text:
          lang === "ar"
            ? `تم تعيين ${data.count} طرود بنجاح للسائق!`
            : `Assigned ${data.count} parcels to driver successfully!`,
        type: "success",
      });
      setTimeout(() => setFeedbackMsg(null), 4000);
      setSelectedParcelIds([]);
      setBulkDriverId("");
      loadDispatchData();
    } catch (err: any) {
      setFeedbackMsg({ text: err.message, type: "error" });
    } finally {
      setBulkSubmitting(false);
    }
  }

  function toggleSelectAll() {
    if (selectedParcelIds.length === filteredParcels.length) {
      setSelectedParcelIds([]);
    } else {
      setSelectedParcelIds(filteredParcels.map((p) => p.id));
    }
  }

  function toggleSelect(id: string) {
    setSelectedParcelIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }

  return (
    <div
      className={`min-h-screen bg-slate-50/50 p-4 sm:p-6 lg:p-8 font-sans ${isRtl ? "font-cairo" : ""}`}
      dir={isRtl ? "rtl" : "ltr"}
    >
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-wider mb-1">
                <Truck className="w-4 h-4" />
                <span>{lang === "ar" ? "لوحة التوزيع والترحيل" : "Hub Dispatch Operations"}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {lang === "ar" ? "إدارة خطوط التوزيع وسائقي التوصيل" : "Driver Assignment & Dispatch Board"}
              </h1>
              <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1 max-w-xl">
                {lang === "ar"
                  ? "توجيه الطرود الجاهزة، مراقبة الرحلات النشطة، وإعادة تعيين السائقين حسب المحافظات."
                  : "Dispatch ready parcels, monitor live out-for-delivery runs, and reassign routes dynamically."}
              </p>
            </div>

            {/* Quick Stats */}
            <div className="flex items-center gap-3">
              <div className="bg-amber-50/80 border border-amber-200 rounded-2xl px-5 py-3 text-center min-w-[120px]">
                <p className="text-2xl font-black text-amber-700">{unassignedParcels.length}</p>
                <p className="text-[10px] font-bold text-amber-900 uppercase tracking-wider mt-0.5">
                  {lang === "ar" ? "بانتظار التوزيع" : "Ready to Dispatch"}
                </p>
              </div>

              <div className="bg-blue-50/80 border border-blue-200 rounded-2xl px-5 py-3 text-center min-w-[120px]">
                <p className="text-2xl font-black text-blue-700">{activeRunsParcels.length}</p>
                <p className="text-[10px] font-bold text-blue-900 uppercase tracking-wider mt-0.5">
                  {lang === "ar" ? "قيد التوصيل الآن" : "Active Out Runs"}
                </p>
              </div>

              <button
                onClick={loadDispatchData}
                disabled={loading}
                className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl transition"
                title="Refresh List"
              >
                <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Feedback Alert */}
        {feedbackMsg && (
          <div
            className={`p-4 rounded-2xl text-xs font-bold flex items-center justify-between shadow-sm animate-in fade-in duration-200 ${
              feedbackMsg.type === "success"
                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                : "bg-rose-50 text-rose-800 border border-rose-200"
            }`}
          >
            <div className="flex items-center gap-2">
              {feedbackMsg.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{feedbackMsg.text}</span>
            </div>
            <button onClick={() => setFeedbackMsg(null)} className="text-slate-400 hover:text-slate-600">✕</button>
          </div>
        )}

        {/* Toolbar: Operational Tabs + Search + Region Filter */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
          <div className="flex flex-col sm:flex-row gap-3 justify-between items-center">
            {/* Tabs */}
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl w-full sm:w-auto">
              <button
                onClick={() => {
                  setActiveTab("READY");
                  setSelectedParcelIds([]);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  activeTab === "READY"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                <span>{lang === "ar" ? "طرود جاهزة في المستودع" : "Ready at Hub"}</span>
                {unassignedParcels.length > 0 && (
                  <span className="bg-amber-100 text-amber-800 text-[10px] px-1.5 py-0.2 rounded-full font-black">
                    {unassignedParcels.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => {
                  setActiveTab("ACTIVE");
                  setSelectedParcelIds([]);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  activeTab === "ACTIVE"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                <Navigation className="w-3 h-3" />
                <span>{lang === "ar" ? "رحلات السائقين الجارية" : "Live Out-for-Delivery Runs"}</span>
                <span className="bg-white text-blue-700 text-[10px] px-1.5 py-0.2 rounded-full font-black">
                  {activeRunsParcels.length}
                </span>
              </button>
            </div>

            {/* Region Filter & Search */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 ${isRtl ? "right-3" : "left-3"}`} />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={lang === "ar" ? "ابحث برقم البوليصة، الزبون..." : "Search tracking #, name..."}
                  className={`w-full bg-slate-50 border border-slate-200 rounded-xl py-2 text-xs font-medium focus:ring-2 focus:ring-blue-600 outline-none ${
                    isRtl ? "pr-9 pl-3" : "pl-9 pr-3"
                  }`}
                />
              </div>

              <select
                value={selectedGovernorate}
                onChange={(e) => setSelectedGovernorate(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-bold text-slate-700 focus:ring-2 focus:ring-blue-600 outline-none cursor-pointer"
              >
                <option value="ALL">{lang === "ar" ? "جميع المحافظات" : "All Governorates"}</option>
                <option value="Beirut">Beirut</option>
                <option value="Mount Lebanon">Mount Lebanon</option>
                <option value="North Lebanon">North Lebanon</option>
                <option value="South Lebanon">South Lebanon</option>
                <option value="Bekaa">Bekaa</option>
                <option value="Akkar">Akkar</option>
                <option value="Nabatieh">Nabatieh</option>
              </select>
            </div>
          </div>

          {/* Bulk Dispatch Bar */}
          {selectedParcelIds.length > 0 && (
            <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 bg-blue-50/60 p-3 rounded-xl border border-blue-100">
              <span className="text-xs font-bold text-blue-900">
                {lang === "ar"
                  ? `تم تحديد ${selectedParcelIds.length} طرد`
                  : `Selected ${selectedParcelIds.length} parcel(s)`}
              </span>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <select
                  value={bulkDriverId}
                  onChange={(e) => setBulkDriverId(e.target.value)}
                  className="bg-white border border-blue-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value="">{lang === "ar" ? "اختر السائق للتعيين..." : "Select Driver for Batch..."}</option>
                  {drivers.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.user.name} ({d.user.phone})
                    </option>
                  ))}
                </select>

                <button
                  onClick={handleBulkAssign}
                  disabled={!bulkDriverId || bulkSubmitting}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2 rounded-xl shadow transition flex items-center gap-1.5 disabled:opacity-50"
                >
                  {bulkSubmitting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <UserCheck className="w-3.5 h-3.5" />}
                  <span>{lang === "ar" ? "تعيين الدفعة دفعة واحدة" : "Dispatch Selected"}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Parcels List */}
        {loading ? (
          <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center">
            <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-3" />
            <p className="text-xs font-bold text-slate-600">
              {lang === "ar" ? "جاري جلب الطرود والسائقين..." : "Fetching dispatch board data..."}
            </p>
          </div>
        ) : filteredParcels.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-2">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto opacity-70" />
            <h3 className="text-base font-bold text-slate-800">
              {activeTab === "READY"
                ? lang === "ar"
                  ? "المستودع خالٍ! لا توجد طرود بانتظار التوزيع"
                  : "All Caught Up! No Parcels Waiting for Initial Dispatch"
                : lang === "ar"
                ? "لا توجد رحلات نشطة قيد التوصيل حالياً"
                : "No Active Out-for-Delivery Runs Right Now"}
            </h3>
            <p className="text-xs text-slate-400">
              {activeTab === "READY"
                ? "كل الطرود المسجلة إما خرجت مع السائقين أو تم تسليمها بنجاح."
                : "All dispatched parcels have either returned or reached their destination."}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Table Header / Select All Bar */}
            <div className="flex items-center justify-between px-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filteredParcels.length > 0 && selectedParcelIds.length === filteredParcels.length}
                  onChange={toggleSelectAll}
                  className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                />
                <span>{lang === "ar" ? "تحديد الكل" : "Select All"}</span>
              </label>
              <span>{filteredParcels.length} {lang === "ar" ? "طرد معروض" : "parcels listed"}</span>
            </div>

            {filteredParcels.map((parcel) => {
              const isSelected = selectedParcelIds.includes(parcel.id);
              const isSubmitting = submittingId === parcel.id;
              const selectedDriver = rowDriverIds[parcel.id] || "";

              return (
                <div
                  key={parcel.id}
                  className={`bg-white rounded-2xl border p-4 sm:p-5 shadow-sm transition-all duration-200 ${
                    isSelected
                      ? "border-blue-500 bg-blue-50/20 ring-1 ring-blue-500/30"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Left: Checkbox + Identity */}
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelect(parcel.id)}
                        className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 mt-1.5 cursor-pointer"
                      />

                      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 text-slate-600">
                        <Package className="w-5 h-5 text-blue-600" />
                      </div>

                      <div>
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="font-mono text-xs font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                            {parcel.trackingNumber}
                          </span>
                          <span className="text-[11px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                            {parcel.governorate}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {parcel.merchant.companyName}
                          </span>
                          {parcel.driver && (
                            <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                              Driver: {parcel.driver.user.name}
                            </span>
                          )}
                        </div>

                        <h3 className="font-bold text-slate-900 text-sm">
                          {parcel.recipientName}
                        </h3>

                        <div className="flex items-center gap-3 text-xs text-slate-500 mt-1 flex-wrap">
                          <span className="flex items-center gap-1 font-medium">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            {parcel.city} • {parcel.detailedAddress}
                          </span>
                          <span className="flex items-center gap-1 font-mono text-[11px] text-slate-600" dir="ltr">
                            <Phone className="w-3 h-3 text-slate-400" />
                            {parcel.recipientPhone}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: COD & Assign Controls */}
                    <div className="flex items-center justify-between lg:justify-end gap-4 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                      {/* Financials */}
                      <div className={isRtl ? "text-right lg:text-left" : "text-left lg:text-right"}>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          {lang === "ar" ? "التحصيل (COD)" : "COD Amount"}
                        </span>
                        <span className="text-base font-black font-mono text-emerald-600">
                          {parcel.codCurrency === "USD"
                            ? `$${Number(parcel.codAmount).toFixed(2)}`
                            : `${Number(parcel.codAmount).toLocaleString()} LBP`}
                        </span>
                      </div>

                      {/* Driver select dropdown & Re-assign Button */}
                      <div className="flex items-center gap-2">
                        <select
                          value={selectedDriver || parcel.driverId || ""}
                          onChange={(e) =>
                            setRowDriverIds((prev) => ({
                              ...prev,
                              [parcel.id]: e.target.value,
                            }))
                          }
                          className="bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl py-2 px-3 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
                        >
                          <option value="">{lang === "ar" ? "اختر السائق..." : "Select Driver..."}</option>
                          {drivers.map((d) => (
                            <option key={d.id} value={d.id}>
                              {d.user.name} ({d.user.phone})
                            </option>
                          ))}
                        </select>

                        <button
                          onClick={() => handleAssignSingle(parcel.id)}
                          disabled={!selectedDriver || isSubmitting}
                          className="bg-slate-900 hover:bg-blue-600 text-white font-bold text-xs py-2 px-3.5 rounded-xl shadow transition flex items-center gap-1.5 disabled:opacity-40"
                        >
                          {isSubmitting ? (
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Send className="w-3.5 h-3.5" />
                          )}
                          <span>
                            {parcel.driverId
                              ? lang === "ar"
                                ? "إعادة تعيين"
                                : "Reassign"
                              : lang === "ar"
                              ? "تعيين"
                              : "Assign"}
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}