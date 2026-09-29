import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const startTime = Date.now();
  const checks: Record<string, { status: "up" | "down" | "degraded"; latencyMs?: number; message?: string }> = {};

  let isHealthy = true;

  // 1. Database Check
  try {
    const dbStart = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    const dbLatency = Date.now() - dbStart;

    checks.database = {
      status: dbLatency > 1500 ? "degraded" : "up",
      latencyMs: dbLatency,
    };
  } catch (error: any) {
    isHealthy = false;
    checks.database = {
      status: "down",
      message: error?.message || "Failed to query database",
    };
  }

  // 2. Messaging / Telephony Configuration Check
  const hasTwilioCreds = Boolean(
    process.env.TWILIO_ACCOUNT_SID &&
    process.env.TWILIO_AUTH_TOKEN &&
    process.env.TWILIO_PHONE_NUMBER
  );

  checks.telephony = {
    status: hasTwilioCreds ? "up" : "degraded",
    message: hasTwilioCreds ? "Twilio environment configured" : "Twilio credentials missing in environment",
  };

  const totalDuration = Date.now() - startTime;
  const memoryUsage = process.memoryUsage();

  const responsePayload = {
    status: isHealthy ? "healthy" : "unhealthy",
    timestamp: new Date().toISOString(),
    service: "cedex-logistics-portal",
    uptimeSeconds: Math.floor(process.uptime()),
    responseTimeMs: totalDuration,
    memory: {
      rssMb: Math.round((memoryUsage.rss / 1024 / 1024) * 100) / 100,
      heapUsedMb: Math.round((memoryUsage.heapUsed / 1024 / 1024) * 100) / 100,
    },
    checks,
  };

  return NextResponse.json(responsePayload, {
    status: isHealthy ? 200 : 503,
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate",
    },
  });
}
