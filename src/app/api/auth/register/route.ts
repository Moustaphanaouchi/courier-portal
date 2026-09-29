import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      companyName,
      name,
      email,
      phone,
      password,
      pickupCity,
      pickupAddress,
    } = body;

    // Validation
    if (!companyName || !name || !email || !phone || !password || !pickupCity) {
      return NextResponse.json(
        { error: "Please fill in all required fields." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    // Check if email already registered
    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existing) {
      return NextResponse.json(
        { error: "An account with this email address already exists." },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Atomically create User and linked Merchant profile
    const result = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email: email.toLowerCase().trim(),
          name: name.trim(),
          phone: phone.trim(),
          passwordHash,
          role: "MERCHANT",
        },
      });

      const newMerchant = await tx.merchant.create({
        data: {
          userId: newUser.id,
          companyName: companyName.trim(),
          pickupCity: pickupCity.trim(),
          pickupAddress: (pickupAddress || "").trim(),
        },
      });

      return { user: newUser, merchant: newMerchant };
    });

    // Generate session payload matching login endpoint
    const sessionData = {
      userId: result.user.id,
      email: result.user.email,
      name: result.user.name,
      role: result.user.role,
      merchantId: result.merchant.id,
      driverId: null,
    };

    // Store session cookie
    const cookieStore = await cookies();
    cookieStore.set("courier_session", JSON.stringify(sessionData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return NextResponse.json({
      success: true,
      user: sessionData,
    });
  } catch (error: any) {
    console.error("Merchant Registration Error:", error);
    return NextResponse.json(
      { error: "Registration failed. Please try again." },
      { status: 500 }
    );
  }
}
