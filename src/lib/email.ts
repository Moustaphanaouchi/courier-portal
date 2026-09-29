interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailOptions) {
  const apiKey = process.env.SENDGRID_API_KEY;
  const fromEmail = process.env.SENDGRID_FROM_EMAIL || "mnaouchi@outlook.com";

  if (!apiKey) {
    console.warn("[EMAIL WARNING] SENDGRID_API_KEY missing in .env. Skipping email dispatch.");
    return { success: false, reason: "Missing API key" };
  }

  const payload = {
    personalizations: [{ to: [{ email: to }] }],
    from: {
      email: fromEmail,
      name: "Courier Express Logistics",
    },
    subject,
    content: [{ type: "text/html", value: html }],
  };

  try {
    const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (res.status === 202) {
      console.log(`[EMAIL DISPATCHED - SENDGRID] Delivered to ${to} (Subject: ${subject})`);
      return { success: true };
    }

    const errBody = await res.text();
    console.error("[SENDGRID ERROR]", res.status, errBody);
    return { success: false, error: errBody };
  } catch (err: any) {
    console.error("[SENDGRID EXCEPTION]:", err.message);
    return { success: false, error: err.message };
  }
}

export async function sendAdminOrderEmail(parcel: {
  trackingNumber: string;
  merchantName: string;
  recipientName: string;
  city: string;
  codAmount: number | string;
  codCurrency: string;
  pickupAddress?: string;
}) {
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || "mnaouchi@outlook.com";
  const appBaseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const codFormatted =
    parcel.codCurrency === "USD"
      ? `$${parcel.codAmount} USD`
      : `${Number(parcel.codAmount).toLocaleString()} LBP`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #0f172a; color: #ffffff; padding: 20px; text-align: center;">
        <h2 style="margin: 0;">Courier Express Hub Alert</h2>
        <p style="margin: 5px 0 0 0; color: #94a3b8;">New Parcel Ready for Dispatch</p>
      </div>
      <div style="padding: 24px; background-color: #ffffff;">
        <p style="font-size: 16px; color: #334155;">A new parcel was registered on the portal:</p>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #f1f5f9; font-weight: bold; color: #64748b;">Waybill / Tracking:</td>
            <td style="padding: 8px; border-bottom: 1px solid #f1f5f9; font-weight: bold; color: #0f172a;">${parcel.trackingNumber}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #f1f5f9; font-weight: bold; color: #64748b;">Shipper / Merchant:</td>
            <td style="padding: 8px; border-bottom: 1px solid #f1f5f9; color: #0f172a;">${parcel.merchantName}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #f1f5f9; font-weight: bold; color: #64748b;">Recipient:</td>
            <td style="padding: 8px; border-bottom: 1px solid #f1f5f9; color: #0f172a;">${parcel.recipientName} (${parcel.city})</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #f1f5f9; font-weight: bold; color: #64748b;">COD Balance:</td>
            <td style="padding: 8px; border-bottom: 1px solid #f1f5f9; font-weight: bold; color: #16a34a;">${codFormatted}</td>
          </tr>
        </table>
        <div style="text-align: center; margin-top: 30px;">
          <a href="${appBaseUrl}/admin/dispatch" style="background-color: #2563eb; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Open Dispatch Board</a>
        </div>
      </div>
    </div>
  `;

  return sendEmail({
    to: adminEmail,
    subject: `🚨 [New Order] ${parcel.trackingNumber} - ${parcel.merchantName} (${parcel.city})`,
    html,
  });
}

export async function sendMerchantOrderEmail(
  toEmail: string,
  parcel: {
    trackingNumber: string;
    merchantName: string;
    recipientName: string;
    city: string;
    codAmount: number | string;
    codCurrency: string;
  }
) {
  const appBaseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const waybillUrl = `${appBaseUrl}/parcels/${parcel.trackingNumber}/waybill`;

  const codFormatted =
    parcel.codCurrency === "USD"
      ? `$${parcel.codAmount} USD`
      : `${Number(parcel.codAmount).toLocaleString()} LBP`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #1e293b; color: #ffffff; padding: 20px; text-align: center;">
        <h2 style="margin: 0;">Parcel Booked Successfully</h2>
        <p style="margin: 5px 0 0 0; color: #38bdf8;">Waybill: ${parcel.trackingNumber}</p>
      </div>
      <div style="padding: 24px; background-color: #ffffff;">
        <p style="font-size: 15px; color: #334155;">Hello <b>${parcel.merchantName}</b>,</p>
        <p style="font-size: 14px; color: #475569;">Your parcel for <b>${parcel.recipientName}</b> in <b>${parcel.city}</b> has been registered for collection.</p>
        <div style="background-color: #f8fafc; padding: 16px; border-radius: 6px; margin: 20px 0;">
          <p style="margin: 0; font-size: 14px; color: #64748b;">COD Collection Amount:</p>
          <p style="margin: 4px 0 0 0; font-size: 20px; font-weight: bold; color: #0f172a;">${codFormatted}</p>
        </div>
        <div style="text-align: center; margin-top: 25px;">
          <a href="${waybillUrl}" style="background-color: #0284c7; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Print 4x6 Thermal Label</a>
        </div>
      </div>
    </div>
  `;

  return sendEmail({
    to: toEmail,
    subject: `✅ Parcel Booked: ${parcel.trackingNumber} (${parcel.recipientName})`,
    html,
  });
}