interface OrderNotificationData {
  recipientName: string;
  recipientPhone: string;
  trackingNumber: string;
  city: string;
  codAmount: number | string;
  codCurrency: "USD" | "LBP";
  merchantName: string;
  pickupAddress?: string;
}

function cleanPhone(rawPhone: string): string {
  let cleaned = rawPhone.replace(/\D/g, "");
  if (cleaned.startsWith("00")) cleaned = cleaned.substring(2);

  if (cleaned.startsWith("90")) return `+${cleaned}`;
  if (cleaned.startsWith("5") && cleaned.length === 10) return `+90${cleaned}`;
  if (cleaned.startsWith("05") && cleaned.length === 11) return `+90${cleaned.substring(1)}`;

  if (cleaned.startsWith("961")) return `+${cleaned}`;
  if (cleaned.startsWith("0")) return `+961${cleaned.substring(1)}`;
  if (!cleaned.startsWith("+")) return `+${cleaned}`;
  return `+${cleaned}`;
}

async function sendTwilioMessage({
  to,
  bodyText,
  tag,
  preferChannel = "whatsapp",
}: {
  to: string;
  bodyText: string;
  tag: string;
  preferChannel?: "whatsapp" | "sms";
}) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const rawSender = process.env.TWILIO_WHATSAPP_NUMBER || "+14155238886";
  const smsSender = process.env.TWILIO_PHONE_NUMBER || "+17372508034";

  if (!accountSid || !authToken) {
    console.warn(`[TWILIO - ${tag}] Skipping: Missing TWILIO_ACCOUNT_SID or TWILIO_AUTH_TOKEN in environment.`);
    return { success: false, reason: "No credentials configured" };
  }

  const normalizedPhone = cleanPhone(to);
  const cleanSender = rawSender.replace(/^whatsapp:/, "");

  const endpoint = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
  const authHeader = "Basic " + Buffer.from(`${accountSid}:${authToken}`).toString("base64");

  const fromTarget = preferChannel === "whatsapp" ? `whatsapp:${cleanSender}` : cleanSender;
  const toTarget = preferChannel === "whatsapp" ? `whatsapp:${normalizedPhone}` : normalizedPhone;

  try {
    const params = new URLSearchParams();
    params.append("From", fromTarget);
    params.append("To", toTarget);
    params.append("Body", bodyText);

    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    const data = await res.json();

    if (res.ok) {
      console.log(`[TWILIO SUCCESS - ${tag}] Message sent to ${toTarget} (SID: ${data.sid})`);
      return { success: true, sid: data.sid };
    }

    // Fallback to direct SMS if WhatsApp channel was rejected
    if (preferChannel === "whatsapp") {
      console.warn(`[TWILIO RETRY - ${tag}] WhatsApp failed (${data.message || data.code}). Retrying via SMS to ${normalizedPhone}...`);

      const smsParams = new URLSearchParams();
      smsParams.append("From", smsSender);
      smsParams.append("To", normalizedPhone);
      smsParams.append("Body", bodyText.replace(/\*/g, ""));

      const smsRes = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: authHeader,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: smsParams.toString(),
      });

      const smsData = await smsRes.json();
      if (smsRes.ok) {
        console.log(`[TWILIO SUCCESS - ${tag}] SMS delivered to ${normalizedPhone} (SID: ${smsData.sid})`);
        return { success: true, sid: smsData.sid };
      }
    }

    console.warn(`[TWILIO NOTICE - ${tag}] Delivery skipped/failed for ${to}: ${data.message}`);
    return { success: false, error: data.message };
  } catch (err: any) {
    console.error(`[TWILIO EXCEPTION - ${tag}]:`, err.message);
    return { success: false, error: err.message };
  }
}

export async function sendCustomerOrderNotification(data: OrderNotificationData) {
  const appBaseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const codText =
    data.codCurrency === "USD"
      ? `$${data.codAmount} USD`
      : `${Number(data.codAmount).toLocaleString()} LBP`;

  const msg =
    `📦 *Order Confirmed - Cedex Logistics*\n\n` +
    `Hello ${data.recipientName},\n` +
    `Your delivery from *${data.merchantName}* to ${data.city} has been booked.\n\n` +
    `• *Tracking:* ${data.trackingNumber}\n` +
    `• *Amount Due (COD):* ${codText}\n\n` +
    `📍 Track live: ${appBaseUrl}/track/${data.trackingNumber}`;

  return sendTwilioMessage({ to: data.recipientPhone, bodyText: msg, tag: "Customer Order" });
}

export async function sendMerchantBookingAlert(merchantPhone: string, merchantName: string, data: OrderNotificationData) {
  const codText =
    data.codCurrency === "USD"
      ? `$${data.codAmount} USD`
      : `${Number(data.codAmount).toLocaleString()} LBP`;

  const msg =
    `📋 *Waybill Recorded - Cedex Logistics*\n\n` +
    `Hello ${merchantName},\n` +
    `Shipment *${data.trackingNumber}* for ${data.recipientName} (${data.city}) is registered.\n` +
    `• Expected COD: ${codText}`;

  return sendTwilioMessage({ to: merchantPhone, bodyText: msg, tag: "Merchant Booking" });
}

export async function sendAdminNewOrderAlert(adminPhone: string, data: OrderNotificationData, pickupAddress?: string) {
  const codText =
    data.codCurrency === "USD"
      ? `$${data.codAmount} USD`
      : `${Number(data.codAmount).toLocaleString()} LBP`;

  const msg =
    `🚨 *Hub Dispatch Alert - Cedex Logistics*\n\n` +
    `• *Waybill:* ${data.trackingNumber}\n` +
    `• *Merchant:* ${data.merchantName}\n` +
    `• *Pickup Location:* ${pickupAddress || "Standard Hub"}\n` +
    `• *Destination:* ${data.recipientName} (${data.city})\n` +
    `• *COD:* ${codText}`;

  return sendTwilioMessage({ to: adminPhone, bodyText: msg, tag: "Admin Hub Alert" });
}

export async function sendOutForDeliveryAlert(data: {
  recipientName: string;
  recipientPhone: string;
  trackingNumber: string;
  driverName: string;
  driverPhone: string;
  codAmount: number | string;
  codCurrency: "USD" | "LBP";
}) {
  const appBaseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const codText =
    data.codCurrency === "USD"
      ? `$${data.codAmount} USD`
      : `${Number(data.codAmount).toLocaleString()} LBP`;

  const msg =
    `🚚 *Out for Delivery - Cedex Logistics*\n\n` +
    `Hello ${data.recipientName},\n` +
    `Your parcel *${data.trackingNumber}* is out with courier ${data.driverName} (${data.driverPhone}).\n\n` +
    `• *Amount Due:* ${codText}\n` +
    `Please have exact cash ready.\n\n` +
    `📍 Track live: ${appBaseUrl}/track/${data.trackingNumber}`;

  return sendTwilioMessage({ to: data.recipientPhone, bodyText: msg, tag: "Out for Delivery" });
}

export const sendOutForDeliveryWhatsApp = sendOutForDeliveryAlert;
