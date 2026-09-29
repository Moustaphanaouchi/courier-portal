import { sendTelegramOrderAlert } from '@/lib/telegram';
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import {
  sendCustomerOrderNotification,
  sendMerchantBookingAlert,
  sendAdminNewOrderAlert,
} from "@/lib/whatsapp";
import { sendAdminOrderEmail, sendMerchantOrderEmail } from "@/lib/email";

async function getUserFromSession() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("courier_session")?.value;

  if (!sessionCookie) return null;

  try {
    const parsed = JSON.parse(sessionCookie);
    const userId = parsed.userId || parsed.id;
    if (!userId) return null;

    return await prisma.user.findUnique({
      where: { id: userId },
      include: { merchantProfile: true, driverProfile: true },
    });
  } catch (e) {
    return null;
  }
}

export async function GET(req: Request) {
  try {
    const user = await getUserFromSession();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const merchantScope = searchParams.get("merchantOnly");

    // Strict multi-tenant query filter
    let whereClause: any = {};

    if (user.role === "MERCHANT" || merchantScope === "true") {
      const merchantId = user.merchantProfile?.id;
      if (!merchantId) {
        // Logged-in user is marked as merchant but has no valid profile -> return empty array immediately
        return NextResponse.json({ parcels: [] });
      }
      whereClause.merchantId = merchantId;
    } else if (user.role === "DRIVER") {
      const driverId = user.driverProfile?.id;
      if (!driverId) {
        return NextResponse.json({ parcels: [] });
      }
      whereClause.driverId = driverId;
    } else if ((user.role as string) !== "COURIER_ADMIN" && (user.role as string) !== "ADMIN") {
      // Any unknown or unauthorized role cannot browse all parcels
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const parcels = await prisma.parcel.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      include: {
        merchant: { include: { user: { select: { name: true, phone: true } } } },
        driver: { include: { user: { select: { name: true, phone: true } } } },
      },
    });

    return NextResponse.json({ parcels });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getUserFromSession();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const {
      recipientName,
      recipientPhone,
      recipientAltPhone,
      address,
      detailedAddress,
      governorate,
      city,
      landmark,
      deliveryFee,
      notes,
      codAmount,
      codCurrency,
      packageDescription,
      } = body;
    let requestedMerchantId = body.merchantId;

    // Resolve or auto-provision the Merchant profile
    let targetMerchant = null;

    // Strict multi-tenant security: Merchants cannot forge another store's ID
    if (user.role === "MERCHANT") {
      requestedMerchantId = user.merchantProfile?.id;
    }
    if (requestedMerchantId) {
      // Check if requestedMerchantId is a Merchant.id or a User.id
      targetMerchant = await prisma.merchant.findUnique({
        where: { id: requestedMerchantId },
        include: { user: true },
      });
      if (!targetMerchant) {
        targetMerchant = await prisma.merchant.findUnique({
          where: { userId: requestedMerchantId },
          include: { user: true },
        });
      }
    }

    if (!targetMerchant) {
      targetMerchant = await prisma.merchant.findUnique({
        where: { userId: user.id },
        include: { user: true },
      });
    }



    if (!targetMerchant) {
      // Create a merchant record for this user
      targetMerchant = await prisma.merchant.create({
        data: {
          userId: user.id,
          companyName: user.name || "Express Merchant",
          pickupAddress: "Hamra Main Street, Beirut",
          pickupCity: "Beirut",
        },
        include: { user: true },
      });
    }

    const randSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
    const trackingNumber = `LB-${new Date().getFullYear()}-${randSuffix}`;

    const finalDetailedAddress = detailedAddress || address || "Lebanon Destination Address";
    const mergedNotes = [notes, packageDescription].filter(Boolean).join(" | ") || null;

    const parcel = await prisma.parcel.create({
      data: {
        trackingNumber,
        recipientName: recipientName || "Customer",
        recipientPhone: recipientPhone || "+9613448482",
        recipientAltPhone: recipientAltPhone || null,
        detailedAddress: finalDetailedAddress,
        governorate: governorate || "Beirut",
        city: city || "Beirut",
        landmark: landmark || null,
        deliveryFee: deliveryFee ? parseFloat(deliveryFee) : 3.5,
        notes: mergedNotes,
        codAmount: parseFloat(codAmount) || 0,
        codCurrency: (codCurrency as "USD" | "LBP") || "USD",
        merchantId: targetMerchant.id,
      },
      include: {
        merchant: {
          include: { user: true },
        },
      },
    });

    const merchantUser = parcel.merchant.user;
    const adminUser = await prisma.user.findFirst({
      where: { role: "COURIER_ADMIN" },
      select: { phone: true, email: true },
    });

    const adminPhone = process.env.ADMIN_WHATSAPP_PHONE || adminUser?.phone || "+9613448482";
    const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || adminUser?.email || "mnaouchi@outlook.com";

    const notificationPayload = {
      recipientName: parcel.recipientName,
      recipientPhone: parcel.recipientPhone,
      trackingNumber: parcel.trackingNumber,
      city: parcel.city,
      codAmount: Number(parcel.codAmount),
      codCurrency: parcel.codCurrency as "USD" | "LBP",
      merchantName: parcel.merchant.companyName || merchantUser.name,
      pickupAddress: parcel.merchant.pickupAddress || "Hamra Hub, Beirut",
    };

    // Dispatch Twilio WhatsApp and SendGrid concurrently
    Promise.allSettled([
      sendCustomerOrderNotification(notificationPayload),
      sendMerchantBookingAlert(merchantUser.phone, merchantUser.name, notificationPayload),
      sendAdminNewOrderAlert(adminPhone, notificationPayload, notificationPayload.pickupAddress),
        sendTelegramOrderAlert(notificationPayload),
      sendAdminOrderEmail({ ...notificationPayload, pickupAddress: notificationPayload.pickupAddress }),
      merchantUser.email ? sendMerchantOrderEmail(merchantUser.email, notificationPayload) : Promise.resolve(),
    ]).catch((err) => {
      console.error("[NOTIFICATION DISPATCH ERROR]:", err);
    });

    return NextResponse.json({ parcel }, { status: 201 });
  } catch (err: any) {
    console.error("Failed to create parcel:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}