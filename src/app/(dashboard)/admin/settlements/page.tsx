"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  ArrowLeft, 
  DollarSign, 
  CheckCircle2, 
  RefreshCw, 
  Truck, 
  ShieldCheck, 
  Receipt, 
  Loader2, 
  Clock 
} from "lucide-react";

interface ParcelSummary {
  id: string;
  trackingNumber: string;
  recipientName: string;
  city: string;
  codAmount: number | string;
  codCurrency: "USD" | "LBP";
  deliveredAt: string | null;
  merchant: { companyName: string };
}

interface SettlementLog {
  id: string;
  totalCollectedUsd: number | string;
  totalCollectedLbp: number | string;
  adminNote: string | null;
  createdAt: string;
}

interface DriverWithParcels {
  id: string;
  vehicleType: string | null;
  plateNumber: string | null;
  user: { name: string; phone: string };
  assignedParcels: ParcelSummary[];
  dailySettlements: SettlementLog[];
}

export default function AdminSettlementsPage() {
  const [drivers, setDrivers] = useState<DriverWithParcels[]>([]);
  const [selectedDriverId, setSelectedDriverId] = useState<string>("");
  const [adminNote, setAdminNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  async function loadData() {
    setLoading(true);
    try {
      const res = await fetch("/api/settlements");
      const data = await res.json();
      if (data.success) {
        setDrivers(data.drivers);
        if (data.drivers.length > 0 && !selectedDriverId) {
          setSelectedDriverId(data.drivers[0].id);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const activeDriver = drivers.find((d) => d.id === selectedDriverId);

  const parcels = activeDriver?.assignedParcels || [];
  const totalUsd = parcels
    .filter((p) => p.codCurrency === "USD")
    .reduce((sum, p) => sum + Number(p.codAmount), 0);

  const totalLbp = parcels
    .filter((p) => p.codCurrency === "LBP")
    .reduce((sum, p) => sum + Number(p.codAmount), 0);

  async function handleSettle() {
    if (!selectedDriverId || (totalUsd === 0 && totalLbp === 0)) return;

    setSubmitting(true);
    setSuccessMessage(null);

    try {
      const res = await fetch("/api/settlements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          driverId: selectedDriverId,
          totalUsd,
          totalLbp,
          adminNote: adminNote || "Verified physical cash at hub desk",
          parcelIds: parcels.map((p) => p.id),
        }),
      });

      const data = await res.json();
      if (data.success) {
        const name = activeDriver?.user?.name || "Driver";
        setSuccessMessage("Settlement recorded! Handover verified for " + name);
        setAdminNote("");
        await loadData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 gap-4 border-b border-slate-200">
          <div>
            <Link href="/" className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-900 mb-2">
              <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Operations Hub
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
                <Receipt className="w-4 h-4" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900">Driver Cash Settlement</h1>
            </div>
          </div>

          <button
            onClick={loadData}
            disabled={loading}
            className="p-2 border border-slate-200 bg-white rounded-lg hover:bg-slate-50 text-slate-600 self-start sm:self-auto"
            title="Refresh list"
          >
            <RefreshCw className={"w-4 h-4 " + (loading ? "animate-spin" : "")} />
          </button>
        </div>

        {successMessage && (
          <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        <div className="mt-6 flex items-center gap-2 overflow-x-auto pb-2">
          {drivers.map((driver) => {
            const isSelected = driver.id === selectedDriverId;
            const count = driver.assignedParcels.length;

            return (
              <button
                key={driver.id}
                onClick={() => setSelectedDriverId(driver.id)}
                className={"flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition shrink-0 " +
                  (isSelected
                    ? "bg-slate-900 text-white shadow-sm"
                    : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50")}
              >
                <Truck className="w-3.5 h-3.5" />
                <span>{driver.user.name}</span>
                <span className={"px-1.5 py-0.5 rounded-full text-[10px] font-bold " +
                  (isSelected ? "bg-slate-800 text-slate-200" : "bg-slate-100 text-slate-600")}>
                  {count} delivered
                </span>
              </button>
            );
          })}
        </div>

        {loading ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 text-xs mt-6">
            Loading settlement balances...
          </div>
        ) : activeDriver ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">
                      Delivered Parcels Pending Cash Closeout
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Handover items for {activeDriver.user.name} ({activeDriver.vehicleType || "Driver"})
                    </p>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-500 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200">
                    {parcels.length} Items
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-600">
                    <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase font-semibold text-[10px] tracking-wider">
                      <tr>
                        <th className="p-3">Tracking / Merchant</th>
                        <th className="p-3">Customer & Area</th>
                        <th className="p-3">Delivered At</th>
                        <th className="p-3 text-right">Cash Collected</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {parcels.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="p-8 text-center text-slate-400">
                            <CheckCircle2 className="w-6 h-6 mx-auto mb-1 text-emerald-500" />
                            All collected cash for this driver is fully settled!
                          </td>
                        </tr>
                      ) : (
                        parcels.map((parcel) => (
                          <tr key={parcel.id} className="hover:bg-slate-50/50">
                            <td className="p-3 font-mono">
                              <span className="font-bold text-slate-900 block">
                                {parcel.trackingNumber}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                {parcel.merchant.companyName}
                              </span>
                            </td>
                            <td className="p-3">
                              <div className="font-medium text-slate-800">{parcel.recipientName}</div>
                              <div className="text-[10px] text-slate-400">{parcel.city}</div>
                            </td>
                            <td className="p-3 text-[11px] text-slate-500">
                              {parcel.deliveredAt
                                ? new Date(parcel.deliveredAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                : "Today"}
                            </td>
                            <td className="p-3 text-right font-black text-slate-900 font-mono">
                              {parcel.codCurrency === "USD"
                                ? `$${parcel.codAmount}`
                                : `${Number(parcel.codAmount).toLocaleString()} LBP`}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" /> Recent Settlement History
                </h3>
                {activeDriver.dailySettlements.length === 0 ? (
                  <p className="text-xs text-slate-400">No prior settlements recorded for this driver.</p>
                ) : (
                  <div className="divide-y divide-slate-100 text-xs">
                    {activeDriver.dailySettlements.map((log) => (
                      <div key={log.id} className="py-2.5 flex items-center justify-between">
                        <div>
                          <span className="font-semibold text-slate-800">
                            {new Date(log.createdAt).toLocaleDateString()}
                          </span>
                          <span className="text-[11px] text-slate-400 block mt-0.5">
                            {log.adminNote || "Verified by hub controller"}
                          </span>
                        </div>
                        <div className="text-right font-mono font-bold text-slate-900">
                          <div>${Number(log.totalCollectedUsd).toLocaleString()}</div>
                          <div className="text-[11px] text-slate-500">
                            {Number(log.totalCollectedLbp).toLocaleString()} LBP
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <h3 className="font-bold text-slate-900 text-sm">Tally Verification</h3>
                </div>

                <div className="space-y-3">
                  <div className="bg-emerald-50 border border-emerald-100 p-3.5 rounded-xl">
                    <span className="text-[10px] uppercase font-bold text-emerald-700">Total USD Cash Due</span>
                    <p className="text-2xl font-black text-emerald-950 mt-1 font-mono">
                      ${totalUsd.toLocaleString()}
                    </p>
                  </div>

                  <div className="bg-blue-50 border border-blue-100 p-3.5 rounded-xl">
                    <span className="text-[10px] uppercase font-bold text-blue-700">Total LBP Cash Due</span>
                    <p className="text-2xl font-black text-blue-950 mt-1 font-mono">
                      {totalLbp.toLocaleString()} <span className="text-xs font-normal">LBP</span>
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Hub Note / Safe Deposit Ref
                  </label>
                  <textarea
                    rows={2}
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                    placeholder="e.g. Received envelope #12. Verified by Steve."
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <button
                  onClick={handleSettle}
                  disabled={submitting || (totalUsd === 0 && totalLbp === 0)}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center justify-center gap-2 disabled:opacity-40"
                >
                  {submitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Confirm & Close Run</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}