import { NextResponse } from "next/server";
import { BASE_URL, BACKEND_HEADERS } from "@/app/constants";

// POST /api/auth/forgot-password — request password reset (public)
export async function POST(req: Request) {
  console.log("[POST /api/auth/forgot-password] requesting password reset");
  try {
    const body = await req.json();
    const r = await fetch(`${BASE_URL}/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...BACKEND_HEADERS },
      body: JSON.stringify(body),
      cache: "no-store",
    });
    return new NextResponse(await r.text(), { status: r.status });
  } catch (err) {
    console.error("[POST /api/auth/forgot-password] error:", err);
    return NextResponse.json({ error: "forgot password request failed" }, { status: 500 });
  }
}
