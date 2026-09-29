"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {  ArrowLeft, Printer, Truck, CheckSquare, Square, RefreshCw, AlertCircle, ShieldAlert, Check , FileText } from "lucide-react";

interface ParcelItem {
  id: string;
  trackingNumber: string;
  recipientName: string;
  recipientPhone: string;
  governorate: string;
  city: string;
  detailedAddress: string;
  codAmount: string | number;
  codCurrency: "USD" | "LBP";
  status: string;
  merchant: { companyName: string; pickupCity: string };
  driver: { user: { name: string } } | null;
}

interface DriverItem {
  id: string;
  vehicleType: string | null;
  plateNumber: string | null;
  user: { name: string; phone: string };
}

export default function DispatchBoardPage() {
  const [parcels, setParcels] = useState<ParcelItem[]>([]);
  const [drivers, setDrivers] = useState<DriverItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedDriverId, setSelectedDriverId] = useState<string>("");
  const [filterGov, setFilterGov] = useState<string>("ALL");
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function loadData() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/dispatch");
      const data = await res.json();
      if (data.success) {
        setParcels(data.parcels);
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

  function toggleSelect(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  }

  function toggleSelectAll(filtered: ParcelItem[]) {
    if (selectedIds.length === filtered.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filtered.map((p) => p.id));
    }
  }

  async function handleAssign() {
    if (selectedIds.length === 0 || !selectedDriverId) return;
    setAssigning(true);
    setMessage(null);

    try {
      const res = await fetch("/api/admin/dispatch", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ parcelIds: selectedIds, driverId: selectedDriverId }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage(`Assigned ${data.count} parcels to driver! Sent ${data.whatsappNotified || data.count} WhatsApp tracking notifications.`);
        setSelectedIds([]);
        loadData();
      } else {
        setMessage(data.error || "Failed to assign parcels");
      }
    } catch (err: any) {
      setMessage(err.message);
    } finally {
      setAssigning(false);
    }
  }

  const governorates = ["ALL", ...Array.from(new Set(parcels.map((p) => p.governorate)))];
  const filteredParcels = filterGov === "ALL" ? parcels : parcels.filter((p) => p.governorate === filterGov);

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 gap-4 border-b border-slate-200">
          <div>
            <Link href="/" className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-900 mb-2">
              <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Operations Hub
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900">Hub Dispatch Board</h1>
            </div>
          </div>

          <div className="flex items-center gap-3"><Link href="/admin/parcels/print-batch" className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"><Printer className="w-3.5 h-3.5" /><span>Batch Print Labels</span></Link>
            <button
              onClick={loadData}
              disabled={loading}
              className="p-2 border border-slate-200 bg-white rounded-lg hover:bg-slate-50 text-slate-600"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {message && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 text-blue-800 text-xs rounded-xl flex items-center gap-2">
            <Check className="w-4 h-4 text-blue-600" />
            <span>{message}</span>
          </div>
        )}

        {/* Dispatch Controls Bar */}
        <div className="mt-6 bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <label className="text-xs font-semibold text-slate-600">Filter Governorate:</label>
            <select
              value={filterGov}
              onChange={(e) => setFilterGov(e.target.value)}
              className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-slate-50"
            >
              {governorates.map((gov) => (
                <option key={gov} value={gov}>{gov}</option>
              ))}
            </select>
            <span className="text-xs text-slate-400">
              Showing {filteredParcels.length} pending
            </span>
          </div>

          <div className="flex items-center gap-3"><Link href="/admin/parcels/print-batch" className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"><Printer className="w-3.5 h-3.5" /><span>Batch Print Labels</span></Link>
            <select
              value={selectedDriverId}
              onChange={(e) => setSelectedDriverId(e.target.value)}
              className="text-xs border border-slate-200 rounded-lg px-3 py-2 bg-white font-medium"
            >
              {drivers.map((d) => (
                <option key={d.id} value={d.id}>
                  🚚 {d.user.name} ({d.vehicleType || "Driver"})
                </option>
              ))}
            </select>

            <button
              onClick={handleAssign}
              disabled={selectedIds.length === 0 || assigning}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-2 transition disabled:opacity-40"
            >
              <Truck className="w-4 h-4" />
              <span>Assign {selectedIds.length > 0 ? `(${selectedIds.length})` : ""}</span>
            </button>

            {selectedDriverId && (
              <Link
                href={`/admin/manifest/${selectedDriverId}`}
                target="_blank"
                className="px-3 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition"
                title="View printable route run-sheet and export CSV for selected driver"
              >
                <FileText className="w-3.5 h-3.5 text-blue-600" />
                <span>Run-Sheet Manifest</span>
              </Link>
            )}
          </div>
        </div>

        {/* Parcels Table */}
        <div className="mt-6 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 uppercase font-semibold text-[10px] tracking-wider">
                <tr>
                  <th className="p-3 w-10 text-center">
                    <button
                      onClick={() => toggleSelectAll(filteredParcels)}
                      className="text-slate-500 hover:text-slate-800"
                    >
                      {selectedIds.length > 0 && selectedIds.length === filteredParcels.length ? (
                        <CheckSquare className="w-4 h-4 text-blue-600" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                  <th className="p-3">Tracking / Merchant</th>
                  <th className="p-3">Recipient & City</th>
                  <th className="p-3">COD Value</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Assigned Driver</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-slate-400">
                      Loading pending shipments...
                    </td>
                  </tr>
                ) : filteredParcels.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-slate-400">
                      <AlertCircle className="w-6 h-6 mx-auto mb-2 text-slate-300" />
                      No pending parcels found.
                    </td>
                  </tr>
                ) : (
                  filteredParcels.map((parcel) => {
                    const isSelected = selectedIds.includes(parcel.id);
                    return (
                      <tr
                        key={parcel.id}
                        className={`hover:bg-slate-50 transition cursor-pointer ${
                          isSelected ? "bg-blue-50/50" : ""
                        }`}
                        onClick={() => toggleSelect(parcel.id)}
                      >
                        <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                          <button onClick={() => toggleSelect(parcel.id)}>
                            {isSelected ? (
                              <CheckSquare className="w-4 h-4 text-blue-600" />
                            ) : (
                              <Square className="w-4 h-4 text-slate-300" />
                            )}
                          </button>
                        </td>
                        <td className="p-3">
                          <span className="font-mono font-bold text-slate-900">
                            {parcel.trackingNumber}
                          </span>
                          <div className="text-[11px] text-slate-400">
                            {parcel.merchant.companyName}
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="font-semibold text-slate-800">{parcel.recipientName}</div>
                          <div className="text-[11px] text-slate-500">
                            {parcel.city}, {parcel.governorate}
                          </div>
                        </td>
                        <td className="p-3">
                          <span className="font-bold text-slate-900">
                            {parcel.codCurrency === "USD" ? `$${parcel.codAmount}` : `${Number(parcel.codAmount).toLocaleString()} LBP`}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            {parcel.status}
                          </span>
                        </td>
                        <td className="p-3 text-slate-500">
                          {parcel.driver?.user.name ? (
                            <span className="font-medium text-emerald-700">
                              🚚 {parcel.driver.user.name}
                            </span>
                          ) : (
                            <span className="text-slate-400 italic">Unassigned</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
