"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  Package,
  Search,
  Printer,
  ExternalLink,
  ChevronRight,
  Filter,
  X,
  Clock,
  CheckCircle2,
  Truck,
  AlertCircle,
  MapPin,
  Phone,
  DollarSign,
  Plus,
} from "lucide-react";
import { WhatsAppReceiptButton } from "@/components/WhatsAppReceiptButton";

interface Parcel {
  id: string;
  trackingNumber: string;
  recipientName: string;
  recipientPhone: string;
  recipientAltPhone?: string | null;
  city: string;
  address: string;
  codAmount: number | string;
  codCurrency: "USD" | "LBP";
  status: string;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; icon: any }> = {
  PENDING_PICKUP: { label: "Pending Pickup", bg: "bg-amber-50 border-amber-200", text: "text-amber-700", icon: Clock },
  PICKED_UP: { label: "Picked Up", bg: "bg-blue-50 border-blue-200", text: "text-blue-700", icon: Package },
  IN_TRANSIT: { label: "In Transit", bg: "bg-indigo-50 border-indigo-200", text: "text-indigo-700", icon: Truck },
  OUT_FOR_DELIVERY: { label: "Out for Delivery", bg: "bg-purple-50 border-purple-200", text: "text-purple-700", icon: Truck },
  DELIVERED: { label: "Delivered", bg: "bg-emerald-50 border-emerald-200", text: "text-emerald-700", icon: CheckCircle2 },
  FAILED_ATTEMPT: { label: "Failed Attempt", bg: "bg-orange-50 border-orange-200", text: "text-orange-700", icon: AlertCircle },
  RETURNED: { label: "Returned", bg: "bg-rose-50 border-rose-200", text: "text-rose-700", icon: AlertCircle },
  CANCELED: { label: "Canceled", bg: "bg-slate-100 border-slate-200", text: "text-slate-600", icon: X },
};

export default function MerchantParcelsHistoryPage() {
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedParcel, setSelectedParcel] = useState<Parcel | null>(null);

  useEffect(() => {
    fetchParcels();
  }, []);

  const fetchParcels = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/parcels");
      const data = await res.json();
      if (res.ok && data.parcels) {
        setParcels(data.parcels);
      }
    } catch (err) {
      console.error("Failed to load parcels", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredParcels = useMemo(() => {
    return parcels.filter((p) => {
      const matchesSearch =
        p.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.recipientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.recipientPhone.includes(searchTerm) ||
        p.city.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === "ALL" || p.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [parcels, searchTerm, statusFilter]);

  const metrics = useMemo(() => {
    const total = parcels.length;
    const delivered = parcels.filter((p) => p.status === "DELIVERED").length;
    const active = parcels.filter(
      (p) => ["PENDING_PICKUP", "PICKED_UP", "IN_TRANSIT", "OUT_FOR_DELIVERY"].includes(p.status)
    ).length;
    return { total, delivered, active };
  }, [parcels]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Parcel History & Orders</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Track status, audit customer details, and re-print waybills for all registered parcels.
          </p>
        </div>
        <Link
          href="/merchant/parcels/new"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-sm transition"
        >
          <Plus className="w-4 h-4" /> Book New Parcel
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Booked</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{metrics.total}</p>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Package className="w-5 h-5" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active In-Flight</p>
            <p className="text-2xl font-bold text-amber-600 mt-1">{metrics.active}</p>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Truck className="w-5 h-5" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Completed Deliveries</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">{metrics.delivered}</p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by tracking number, recipient name, phone, or city..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 font-medium"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING_PICKUP">Pending Pickup</option>
            <option value="PICKED_UP">Picked Up</option>
            <option value="IN_TRANSIT">In Transit</option>
            <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
            <option value="DELIVERED">Delivered</option>
            <option value="FAILED_ATTEMPT">Failed Attempt</option>
            <option value="RETURNED">Returned</option>
            <option value="CANCELED">Canceled</option>
          </select>
        </div>
      </div>

      {/* Parcels Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm">Loading parcel history...</div>
        ) : filteredParcels.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <Package className="w-10 h-10 mx-auto text-slate-300 mb-3" />
            <p className="font-semibold">No parcels found</p>
            <p className="text-xs text-slate-400 mt-1">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3">Tracking / Date</th>
                  <th className="px-5 py-3">Recipient</th>
                  <th className="px-5 py-3">Destination</th>
                  <th className="px-5 py-3">COD Amount</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredParcels.map((parcel) => {
                  const statusInfo = STATUS_CONFIG[parcel.status] || {
                    label: parcel.status,
                    bg: "bg-slate-50 border-slate-200",
                    text: "text-slate-600",
                    icon: Clock,
                  };
                  const StatusIcon = statusInfo.icon;

                  const formattedCod =
                    parcel.codCurrency === "USD"
                      ? `$${Number(parcel.codAmount).toFixed(2)} USD`
                      : `${Number(parcel.codAmount).toLocaleString()} LBP`;

                  return (
                    <tr
                      key={parcel.id}
                      className="hover:bg-slate-50 transition cursor-pointer"
                      onClick={() => setSelectedParcel(parcel)}
                    >
                      <td className="px-5 py-4">
                        <span className="font-mono font-bold text-blue-600 block hover:underline">
                          {parcel.trackingNumber}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {new Date(parcel.createdAt).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span className="font-semibold text-slate-900 block">{parcel.recipientName}</span>
                        <span className="text-xs text-slate-500 font-mono">{parcel.recipientPhone}</span>
                      </td>

                      <td className="px-5 py-4">
                        <span className="font-medium text-slate-800 block">{parcel.city}</span>
                        <span className="text-xs text-slate-400 truncate max-w-[180px] block">
                          {parcel.address}
                        </span>
                      </td>

                      <td className="px-5 py-4 font-mono font-bold text-slate-900">
                        {Number(parcel.codAmount) > 0 ? (
                          <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-xs">
                            {formattedCod}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400 font-normal">Prepaid</span>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${statusInfo.bg} ${statusInfo.text}`}
                        >
                          <StatusIcon className="w-3 h-3" />
                          {statusInfo.label}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            href={`/parcels/${parcel.trackingNumber}/label`}
                            target="_blank"
                            title="Print 4x6 Waybill"
                            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
                          >
                            <Printer className="w-4 h-4" />
                          </Link>

                          <WhatsAppReceiptButton
                            phone={parcel.recipientPhone}
                            parcel={{
                              trackingNumber: parcel.trackingNumber,
                              recipientName: parcel.recipientName,
                              recipientPhone: parcel.recipientPhone,
                              city: parcel.city,
                              codAmount: parcel.codAmount,
                              codCurrency: parcel.codCurrency,
                              notes: parcel.notes,
                            }}
                            variant="icon"
                          />

                          <button
                            onClick={() => setSelectedParcel(parcel)}
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Slide-over Detail Drawer */}
      {selectedParcel && (
        <div className="fixed inset-0 z-50 bg-black/40 flex justify-end backdrop-blur-sm transition-opacity">
          <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col overflow-y-auto animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <span className="text-xs font-mono text-slate-500 uppercase tracking-wider">Waybill Details</span>
                <h2 className="text-lg font-bold font-mono text-slate-900 mt-0.5">
                  {selectedParcel.trackingNumber}
                </h2>
              </div>
              <button
                onClick={() => setSelectedParcel(null)}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-white rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="p-6 space-y-6 flex-1 text-sm">
              {/* Status Section */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Current Status</p>
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                      STATUS_CONFIG[selectedParcel.status]?.bg || "bg-slate-100"
                    } ${STATUS_CONFIG[selectedParcel.status]?.text || "text-slate-700"}`}
                  >
                    {STATUS_CONFIG[selectedParcel.status]?.label || selectedParcel.status}
                  </span>
                  <span className="text-xs text-slate-400">
                    Updated {new Date(selectedParcel.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>

              {/* Recipient Details */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Recipient Information</h3>
                <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2.5">
                  <div>
                    <span className="text-xs text-slate-400 block">Full Name</span>
                    <span className="font-semibold text-slate-900">{selectedParcel.recipientName}</span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block">Contact Phone</span>
                    <span className="font-mono text-slate-800">{selectedParcel.recipientPhone}</span>
                    {selectedParcel.recipientAltPhone && (
                      <span className="font-mono text-slate-500 text-xs block">
                        Alt: {selectedParcel.recipientAltPhone}
                      </span>
                    )}
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block">Destination City & Address</span>
                    <span className="font-medium text-slate-800 block">📍 {selectedParcel.city}</span>
                    <span className="text-xs text-slate-600 mt-0.5 block">{selectedParcel.address}</span>
                  </div>
                </div>
              </div>

              {/* Financial COD Box */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Financials</h3>
                <div className="bg-emerald-50/70 border border-emerald-200 p-4 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">
                      Cash to Collect (COD)
                    </span>
                    <span className="text-2xl font-black font-mono text-emerald-950 mt-1 block">
                      {selectedParcel.codCurrency === "USD"
                        ? `$${Number(selectedParcel.codAmount).toFixed(2)} USD`
                        : `${Number(selectedParcel.codAmount).toLocaleString()} LBP`}
                    </span>
                  </div>
                  <DollarSign className="w-8 h-8 text-emerald-600/40" />
                </div>
              </div>

              {/* Special Instructions */}
              {selectedParcel.notes && (
                <div className="space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Notes & Package Info</h3>
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700">
                    {selectedParcel.notes}
                  </div>
                </div>
              )}
            </div>

            {/* Drawer Footer Actions */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex flex-col gap-2">
              <Link
                href={`/parcels/${selectedParcel.trackingNumber}/label`}
                target="_blank"
                className="w-full py-2.5 bg-slate-900 hover:bg-black text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition"
              >
                <Printer className="w-4 h-4" /> Print Thermal Sticker (4x6 / A4)
              </Link>
              <WhatsAppReceiptButton
                phone={selectedParcel.recipientPhone}
                parcel={{
                  trackingNumber: selectedParcel.trackingNumber,
                  recipientName: selectedParcel.recipientName,
                  recipientPhone: selectedParcel.recipientPhone,
                  city: selectedParcel.city,
                  codAmount: selectedParcel.codAmount,
                  codCurrency: selectedParcel.codCurrency,
                  notes: selectedParcel.notes,
                }}
                label="Send Waybill to Customer via WhatsApp"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}