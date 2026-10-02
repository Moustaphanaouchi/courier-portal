export const dynamic = "force-dynamic";
export const revalidate = 0;
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { getSession } from "@/lib/session";

// GET: List all drivers with their live load and pocket cash
export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (session?.role !== "COURIER_ADMIN") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
    }

    const drivers = await prisma.driver.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            createdAt: true,
          },
        },
        assignedParcels: {
          where: {
            status: {
              in: ["OUT_FOR_DELIVERY", "DELIVERED"],
            },
          },
          select: {
            id: true,
            status: true,
            codAmount: true,
            codCurrency: true,
            isCodCollected: true,
            settlementId: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const formatted = drivers.map((d) => {
      const activeLoad = d.assignedParcels.filter((p) => p.status === "OUT_FOR_DELIVERY").length;
      const unsettledDelivered = d.assignedParcels.filter(
        (p) => p.status === "DELIVERED" && p.isCodCollected && !p.settlementId
      );

      const pocketUsd = unsettledDelivered
        .filter((p) => p.codCurrency === "USD")
        .reduce((sum, p) => sum + Number(p.codAmount), 0);

      const pocketLbp = unsettledDelivered
        .filter((p) => p.codCurrency === "LBP")
        .reduce((sum, p) => sum + Number(p.codAmount), 0);

      return {
        id: d.id,
        userId: d.userId,
        name: d.user.name,
        email: d.user.email,
        phone: d.user.phone,
        vehicleType: d.vehicleType || "Motorcycle",
        plateNumber: d.plateNumber || "N/A",
        isActive: d.isActive,
        activeLoad,
        pocketUsd,
        pocketLbp,
        createdAt: d.createdAt,
      };
    });

    return NextResponse.json({ success: true, drivers: formatted });
  } catch (error: any) {
    console.error("Admin drivers list error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST: Provision a new courier driver account
export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (session?.role !== "COURIER_ADMIN") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const { name, email, phone, password, vehicleType, plateNumber } = body;

    if (!name || !email || !phone || !password) {
      return NextResponse.json(
        { success: false, error: "Name, email, phone, and password are required." },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();
    const existing = await prisma.user.findFirst({
      where: {
        OR: [{ email: cleanEmail }, { phone: phone.trim() }],
      },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: "A user with this email or phone already exists." },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: name.trim(),
          email: cleanEmail,
          phone: phone.trim(),
          passwordHash,
          role: "DRIVER",
        },
      });

      const driver = await tx.driver.create({
        data: {
          userId: user.id,
          vehicleType: vehicleType?.trim() || "Motorcycle",
          plateNumber: plateNumber?.trim() || null,
          isActive: true,
        },
      });

      return { user, driver };
    });

    return NextResponse.json({ success: true, driver: result.driver });
  } catch (error: any) {
    console.error("Create driver error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PATCH: Toggle active status or update driver details
export async function PATCH(req: Request) {
  try {
    const session = await getSession();
    if (session?.role !== "COURIER_ADMIN") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const { driverId, isActive, vehicleType, plateNumber } = body;

    if (!driverId) {
      return NextResponse.json({ success: false, error: "Driver ID required" }, { status: 400 });
    }

    const updated = await prisma.driver.update({
      where: { id: driverId },
      data: {
        ...(typeof isActive === "boolean" && { isActive }),
        ...(vehicleType && { vehicleType }),
        ...(plateNumber !== undefined && { plateNumber }),
      },
    });

    return NextResponse.json({ success: true, driver: updated });
  } catch (error: any) {
    console.error("Update driver error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
