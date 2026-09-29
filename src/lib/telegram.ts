interface OrderAlertData {
  recipientName: string;
  recipientPhone: string;
  trackingNumber: string;
  city: string;
  codAmount: number | string;
  codCurrency: "USD" | "LBP";
  merchantName: string;
  pickupAddress?: string;
}

export async function sendTelegramOrderAlert(data: OrderAlertData) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    console.warn("[TELEGRAM] Missing bot token or chat ID.");
    return false;
  }

  const codText =
    data.codCurrency === "USD"
      ? `$${data.codAmount} USD`
      : `${Number(data.codAmount).toLocaleString()} LBP`;

  const appBaseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const trackingUrl = `${appBaseUrl}/parcels/${data.trackingNumber}/track`;

  const text =
    `🚨 *NEW PARCEL DISPATCH ALERT*\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `📦 *Tracking:* \`${data.trackingNumber}\`\n` +
    `🏢 *Merchant:* ${data.merchantName}\n` +
    `📍 *Pickup:* ${data.pickupAddress || "Central Hub"}\n` +
    `👤 *Recipient:* ${data.recipientName} (${data.recipientPhone})\n` +
    `🏙 *Destination:* ${data.city}\n` +
    `💵 *COD Due:* *${codText}*\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `🔗 [View Live Tracking](${trackingUrl})`;

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "Markdown",
        disable_web_page_preview: false,
      }),
    });

    const body = await res.json();
    if (body.ok) {
      console.log(`[TELEGRAM SUCCESS] Delivered to chat ${chatId}`);
      return true;
    } else {
      console.error("[TELEGRAM ERROR]:", body.description);
      return false;
    }
  } catch (err: any) {
    console.error("[TELEGRAM EXCEPTION]:", err.message);
    return false;
  }
}