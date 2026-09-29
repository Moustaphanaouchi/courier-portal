export interface ParcelReceiptData {
  trackingNumber: string;
  recipientName: string;
  recipientPhone: string;
  city: string;
  codAmount: number | string;
  codCurrency: "USD" | "LBP";
  notes?: string | null;
  merchantName?: string;
}

export function generateWhatsAppReceiptUrl(phone: string, parcel: ParcelReceiptData): string {
  // Clean phone number: remove non-digits
  const cleanPhone = phone.replace(/\D/g, "");

  const codFormatted =
    parcel.codCurrency === "USD"
      ? `$${parcel.codAmount} USD`
      : `${Number(parcel.codAmount).toLocaleString()} LBP`;

  const appBaseUrl =
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const trackingUrl = `${appBaseUrl}/parcels/${parcel.trackingNumber}/track`;

  const message = [
    `✅ *ORDER CONFIRMATION RECEIPT*`,
    `━━━━━━━━━━━━━━━━━━━━`,
    `📦 *Waybill:* ${parcel.trackingNumber}`,
    `👤 *Customer:* ${parcel.recipientName} (${parcel.recipientPhone})`,
    `📍 *Destination:* ${parcel.city}`,
    `💵 *COD Amount:* ${codFormatted}`,
    parcel.notes ? `📝 *Notes:* ${parcel.notes}` : null,
    `━━━━━━━━━━━━━━━━━━━━`,
    `🔍 *Track live:* ${trackingUrl}`,
  ]
    .filter(Boolean)
    .join("\n");

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}