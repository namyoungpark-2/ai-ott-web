export const runtime = "edge";
import { NextResponse } from "next/server";
import { BASE_URL } from "@/app/constants";

// GET /api/me/continue-watching
export async function GET(req: Request) {
  try {
    const headers: HeadersInit = { "Content-Type": "application/json" };
    const auth = req.headers.get("authorization");
    const cookie = req.headers.get("cookie");
    if (auth) headers["authorization"] = auth;
    if (cookie) headers["cookie"] = cookie;

    const r = await fetch(`${BASE_URL}/api/app/me/continue-watching`, {
      headers,
      cache: "no-store",
    });
    return new NextResponse(await r.text(), { status: r.status });
  } catch {
    return NextResponse.json({ error: "continue-watching fetch failed" }, { status: 503 });
  }
}
