"use client";

import React from "react";
import { MessageSquareShare } from "lucide-react";
import { generateWhatsAppReceiptUrl, ParcelReceiptData } from "@/lib/whatsapp-link";

interface Props {
  phone: string;
  parcel: ParcelReceiptData;
  label?: string;
  variant?: "button" | "icon";
}

export function WhatsAppReceiptButton({
  phone,
  parcel,
  label = "Share on WhatsApp",
  variant = "button",
}: Props) {
  const url = generateWhatsAppReceiptUrl(phone, parcel);

  if (variant === "icon") {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        title="Send WhatsApp confirmation"
        className="p-1.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors inline-flex items-center"
      >
        <MessageSquareShare className="w-4 h-4" />
      </a>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-medium rounded-xl text-sm transition-all shadow-sm shadow-emerald-200"
    >
      <MessageSquareShare className="w-4 h-4" />
      <span>{label}</span>
    </a>
  );
}