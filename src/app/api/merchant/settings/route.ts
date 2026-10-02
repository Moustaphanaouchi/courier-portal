export const dynamic = "force-dynamic";
export const revalidate = 0;
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

// GET: Fetch merchant settings and profile
export async function GET() {
  try {
    const session = await getSession();
    if (!session?.merchantId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const merchant = await prisma.merchant.findUnique({
      where: { id: session.merchantId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    if (!merchant) {
      return NextResponse.json({ success: false, error: "Merchant not found" }, { status: 404 });
    }

    let payoutPreferences = {
      method: "CASH",
      accountHolder: "",
      accountNumberOrPhone: "",
      notes: "",
    };

    if (merchant.defaultNote) {
      try {
        const parsed = JSON.parse(merchant.defaultNote);
        if (parsed && typeof parsed === "object") {
          payoutPreferences = { ...payoutPreferences, ...parsed };
        }
      } catch {
        payoutPreferences.notes = merchant.defaultNote;
      }
    }

    return NextResponse.json({
      success: true,
      merchant: {
        id: merchant.id,
        companyName: merchant.companyName,
        pickupCity: merchant.pickupCity,
        pickupAddress: merchant.pickupAddress,
        contactName: merchant.user.name,
        contactEmail: merchant.user.email,
        contactPhone: merchant.user.phone,
        payoutPreferences,
      },
    });
  } catch (error: any) {
    console.error("Merchant settings GET error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PATCH: Update merchant details, warehouse address & payout preferences
export async function PATCH(req: Request) {
  try {
    const session = await getSession();
    if (!session?.merchantId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      companyName,
      contactName,
      contactPhone,
      pickupCity,
      pickupAddress,
      payoutPreferences,
    } = body;

    if (!companyName || !pickupCity) {
      return NextResponse.json(
        { success: false, error: "Company name and pickup city are required" },
        { status: 400 }
      );
    }

    const updated = await prisma.$transaction(async (tx) => {
      // Update merchant
      const m = await tx.merchant.update({
        where: { id: session.merchantId! },
        data: {
          companyName: companyName.trim(),
          pickupCity: pickupCity.trim(),
          pickupAddress: (pickupAddress || "").trim(),
          defaultNote: payoutPreferences ? JSON.stringify(payoutPreferences) : undefined,
        },
      });

      // Update user name/phone
      if (contactName || contactPhone) {
        await tx.user.update({
          where: { id: session.userId },
          data: {
            ...(contactName && { name: contactName.trim() }),
            ...(contactPhone && { phone: contactPhone.trim() }),
          },
        });
      }

      return m;
    });

    return NextResponse.json({ success: true, merchant: updated });
  } catch (error: any) {
    console.error("Merchant settings PATCH error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
