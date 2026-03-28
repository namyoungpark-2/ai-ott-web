import { NextResponse } from "next/server";
import { BASE_URL, BACKEND_HEADERS } from "@/app/constants";

// POST /api/auth/reset-password — reset password with token (public)
export async function POST(req: Request) {
  console.log("[POST /api/auth/reset-password] resetting password");
  try {
    const body = await req.json();
    const r = await fetch(`${BASE_URL}/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...BACKEND_HEADERS },
      body: JSON.stringify(body),
      cache: "no-store",
    });
    return new NextResponse(await r.text(), { status: r.status });
  } catch (err) {
    console.error("[POST /api/auth/reset-password] error:", err);
    return NextResponse.json({ error: "password reset failed" }, { status: 500 });
  }
}
