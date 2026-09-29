import { cookies } from "next/headers";

export interface SessionUser {
  userId: string;
  email: string;
  name: string;
  role: "COURIER_ADMIN" | "MERCHANT" | "DRIVER";
  merchantId: string | null;
  driverId: string | null;
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("courier_session");

  if (!sessionCookie) return null;

  try {
    return JSON.parse(sessionCookie.value) as SessionUser;
  } catch {
    return null;
  }
}
