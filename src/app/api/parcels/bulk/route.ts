import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateTrackingNumber } from "@/lib/utils";
import { getSession } from "@/lib/session";

interface BulkParcelInput {
  recipientName: string;
  recipientPhone: string;
  recipientAltPhone?: string;
  governorate: string;
  city: string;
  detailedAddress: string;
  landmark?: string;
  codAmount: number;
  codCurrency: "USD" | "LBP";
  deliveryFee?: number;
  notes?: string;
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    const body = await req.json();
    const { merchantId: providedMerchantId, parcels } = body;

    // Strict multi-tenant security
    const merchantId = session?.role === "COURIER_ADMIN" && providedMerchantId 
      ? providedMerchantId 
      : session?.merchantId;
    if (!merchantId) {
      return NextResponse.json({ success: false, error: "Access denied" }, { status: 403 });
    }

    if (!merchantId) {
      return NextResponse.json(
        { success: false, error: "Merchant ID is required" },
        { status: 400 }
      );
    }

    if (!Array.isArray(parcels) || parcels.length === 0) {
      return NextResponse.json(
        { success: false, error: "No parcel records provided" },
        { status: 400 }
      );
    }

    // Prepare structured records with tracking numbers
    const records = parcels.map((item: BulkParcelInput) => ({
      trackingNumber: generateTrackingNumber(),
      merchantId,
      recipientName: item.recipientName?.trim(),
      recipientPhone: item.recipientPhone?.trim(),
      recipientAltPhone: item.recipientAltPhone?.trim() || null,
      governorate: item.governorate?.trim() || "Beirut",
      city: item.city?.trim() || "Beirut",
      detailedAddress: item.detailedAddress?.trim() || "Standard Delivery",
      landmark: item.landmark?.trim() || null,
      codAmount: Number(item.codAmount) || 0,
      codCurrency: item.codCurrency === "LBP" ? "LBP" : "USD",
      deliveryFee: Number(item.deliveryFee) || 3.0,
      notes: item.notes?.trim() || null,
      status: "READY_FOR_PICKUP" as const,
    }));

    const result = await prisma.parcel.createMany({
      data: records as any,
    });

    return NextResponse.json({
      success: true,
      count: result.count,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}