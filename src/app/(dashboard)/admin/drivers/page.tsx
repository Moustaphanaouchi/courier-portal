"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import {
  Truck,
  UserPlus,
  Phone,
  Mail,
  ShieldCheck,
  Package,
  Banknote,
  Search,
  CheckCircle2,
  XCircle,
  Loader2,
  AlertCircle,
  Plus,
  X,
  Lock,
} from "lucide-react";

interface DriverRow {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  vehicleType: string;
  plateNumber: string;
  isActive: boolean;
  activeLoad: number;
  pocketUsd: number;
  pocketLbp: number;
  createdAt: string;
}

export default function AdminDriversPage() {
  const { lang, isRtl } = useLanguage();
  const [drivers, setDrivers] = useState<DriverRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // New Driver Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [newDriver, setNewDriver] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    vehicleType: "Motorcycle",
    plateNumber: "",
  });

  async function loadDrivers() {
    try {
      const res = await fetch("/api/admin/drivers");
      const data = await res.json();
      if (data.success) {
        setDrivers(data.drivers);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDrivers();
  }, []);

  async function handleCreateDriver(e: React.FormEvent) {
    e.preventDefault();
    setModalLoading(true);
    setModalError(null);

    try {
      const res = await fetch("/api/admin/drivers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newDriver),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to create driver account");
      }

      setIsModalOpen(false);
      setNewDriver({
        name: "",
        email: "",
        phone: "",
        password: "",
        vehicleType: "Motorcycle",
        plateNumber: "",
      });
      loadDrivers();
    } catch (err: any) {
      setModalError(err.message || "Failed to create driver");
    } finally {
      setModalLoading(false);
    }
  }

  async function toggleStatus(driverId: string, currentStatus: boolean) {
    setUpdatingId(driverId);
    try {
      const res = await fetch("/api/admin/drivers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ driverId, isActive: !currentStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setDrivers((prev) =>
          prev.map((d) => (d.id === driverId ? { ...d, isActive: !currentStatus } : d))
        );
      }
    } catch (e) {
      console.error(e);
    } finally {
      setUpdatingId(null);
    }
  }

  const filtered = drivers.filter(
    (d) =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.phone.includes(search) ||
      d.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={`min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8 font-sans ${isRtl ? "font-cairo" : ""}`} dir={isRtl ? "rtl" : "ltr"}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-wider mb-1">
              <Truck className="w-4 h-4" />
              <span>{lang === "ar" ? "أسطول المناديب والتوصيل" : "Fleet & Driver Operations"}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {lang === "ar" ? "إدارة السائقين والمناديب" : "Driver Management Hub"}
            </h1>
            <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1">
              {lang === "ar"
                ? "إنشاء حسابات السائقين، متابعة الشحنات المسندة إليهم، وحصيلة الكاش المحصل في عهدتهم."
                : "Provision driver logins, monitor current delivery load, and track unremitted pocket cash."}
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-bold shadow-md shadow-blue-600/20 transition active:scale-95 cursor-pointer shrink-0"
          >
            <UserPlus className="w-4 h-4" />
            <span>{lang === "ar" ? "إضافة سائق جديد" : "Provision New Driver"}</span>
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              {lang === "ar" ? "إجمالي المناديب المسجلين" : "Total Provisioned Drivers"}
            </span>
            <p className="text-2xl font-black text-slate-900 mt-1">{drivers.length}</p>
            <span className="text-xs text-emerald-600 font-bold">
              {drivers.filter((d) => d.isActive).length} {lang === "ar" ? "نشط حالياً" : "Active on duty"}
            </span>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              {lang === "ar" ? "الشحنات قيد التوصيل الآن" : "Active Parcels In Transit"}
            </span>
            <p className="text-2xl font-black text-amber-600 mt-1">
              {drivers.reduce((sum, d) => sum + d.activeLoad, 0)}
            </p>
            <span className="text-xs text-slate-500 font-medium">
              {lang === "ar" ? "على خطوط السير" : "Assigned across active runs"}
            </span>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              {lang === "ar" ? "الكاش المعلق بعهدة السائقين" : "Unsettled Pocket Cash"}
            </span>
            <p className="text-2xl font-black text-emerald-700 font-mono mt-1">
              ${drivers.reduce((sum, d) => sum + d.pocketUsd, 0).toFixed(2)}
            </p>
            <span className="text-xs text-blue-600 font-mono font-bold">
              + {drivers.reduce((sum, d) => sum + d.pocketLbp, 0).toLocaleString()} LBP
            </span>
          </div>
        </div>

        {/* Search Bar & Table */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div className="relative">
            <Search className={`w-4 h-4 text-slate-400 absolute top-3.5 ${isRtl ? "right-3.5" : "left-3.5"}`} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={lang === "ar" ? "البحث بالاسم أو رقم الهاتف..." : "Search by driver name, phone, or email..."}
              className={`w-full py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-600 ${
                isRtl ? "pr-10 pl-3 text-right" : "pl-10 pr-3 text-left"
              }`}
            />
          </div>

          {loading ? (
            <div className="p-12 text-center text-slate-400 text-xs">
              <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-600 mb-2" />
              <span>Loading fleet records...</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-2xl">
              {lang === "ar" ? "لا يوجد مناديب مطابقين للبحث." : "No drivers found."}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-start">
                <thead className="bg-slate-50 text-slate-400 font-bold uppercase text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 text-start">{lang === "ar" ? "السائق" : "Driver"}</th>
                    <th className="px-4 py-3 text-start">{lang === "ar" ? "الهاتف" : "Phone"}</th>
                    <th className="px-4 py-3 text-start">{lang === "ar" ? "المركبة" : "Vehicle"}</th>
                    <th className="px-4 py-3 text-center">{lang === "ar" ? "الحمل الحالي" : "Active Load"}</th>
                    <th className="px-4 py-3 text-end">{lang === "ar" ? "الكاش بالعهدة" : "Pocket Cash"}</th>
                    <th className="px-4 py-3 text-center">{lang === "ar" ? "الحالة" : "Status"}</th>
                    <th className="px-4 py-3 text-end">{lang === "ar" ? "الإجراء" : "Action"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((d) => (
                    <tr key={d.id} className="hover:bg-slate-50/50">
                      <td className="px-4 py-3">
                        <span className="font-bold text-slate-900 block">{d.name}</span>
                        <span className="text-[11px] text-slate-400">{d.email}</span>
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-600" dir="ltr">
                        {d.phone}
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-semibold text-slate-800">{d.vehicleType}</span>
                        <span className="text-[10px] text-slate-400 block font-mono">{d.plateNumber}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-block px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-bold border border-amber-200">
                          {d.activeLoad} {lang === "ar" ? "طرد" : "stops"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-end font-mono">
                        <span className="font-bold text-emerald-700 block">${d.pocketUsd.toFixed(2)}</span>
                        {d.pocketLbp > 0 && (
                          <span className="text-[10px] text-blue-600">{d.pocketLbp.toLocaleString()} LBP</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            d.isActive
                              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                              : "bg-rose-50 text-rose-800 border border-rose-200"
                          }`}
                        >
                          {d.isActive ? (lang === "ar" ? "نشط" : "Active") : (lang === "ar" ? "معطل" : "Suspended")}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-end">
                        <button
                          onClick={() => toggleStatus(d.id, d.isActive)}
                          disabled={updatingId === d.id}
                          className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                            d.isActive
                              ? "bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200"
                              : "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200"
                          }`}
                        >
                          {updatingId === d.id ? (
                            "..."
                          ) : d.isActive ? (
                            lang === "ar" ? "تعطيل" : "Suspend"
                          ) : (
                            lang === "ar" ? "تفعيل" : "Activate"
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Provision Driver Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
                  <Truck className="w-4 h-4" />
                </div>
                <h3 className="text-base font-black text-slate-900">
                  {lang === "ar" ? "إنشاء حساب مندوب جديد" : "Provision New Courier Driver"}
                </h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleCreateDriver} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  {lang === "ar" ? "اسم المندوب الكامل *" : "Full Name *"}
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Walid Mansour"
                  value={newDriver.name}
                  onChange={(e) => setNewDriver({ ...newDriver, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    {lang === "ar" ? "البريد الإلكتروني *" : "Login Email *"}
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="driver@cedex.com"
                    value={newDriver.email}
                    onChange={(e) => setNewDriver({ ...newDriver, email: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    {lang === "ar" ? "رقم الهاتف (واتساب) *" : "Phone (WhatsApp) *"}
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+961 70 998877"
                    value={newDriver.phone}
                    onChange={(e) => setNewDriver({ ...newDriver, phone: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  {lang === "ar" ? "كلمة المرور للدخول *" : "Login Password *"}
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={newDriver.password}
                  onChange={(e) => setNewDriver({ ...newDriver, password: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    {lang === "ar" ? "نوع الآلية *" : "Vehicle Type *"}
                  </label>
                  <select
                    value={newDriver.vehicleType}
                    onChange={(e) => setNewDriver({ ...newDriver, vehicleType: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 bg-white"
                  >
                    <option value="Motorcycle">Motorcycle (دراجة نارية)</option>
                    <option value="Van">Van (فان شحن)</option>
                    <option value="Car">Sedan / Car (سيارة)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    {lang === "ar" ? "رقم اللوحة" : "Plate Number"}
                  </label>
                  <input
                    type="text"
                    placeholder="B 123456"
                    value={newDriver.plateNumber}
                    onChange={(e) => setNewDriver({ ...newDriver, plateNumber: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition"
                >
                  {lang === "ar" ? "إلغاء" : "Cancel"}
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-1.5"
                >
                  {modalLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{lang === "ar" ? "إنشاء وتفعيل" : "Create Account"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
