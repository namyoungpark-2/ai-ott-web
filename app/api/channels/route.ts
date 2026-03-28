import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const lang = searchParams.get("lang") ?? "ko";
    const limit = searchParams.get("limit") ?? "24";
    const offset = searchParams.get("offset") ?? "0";

    const base =
      process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";
    console.log("[OTT] channels list proxy");

    const headers: HeadersInit = { "Content-Type": "application/json" };
    const authHeader = req.headers.get("authorization");
    if (authHeader) headers["authorization"] = authHeader;
    const cookie = req.headers.get("cookie");
    if (cookie) headers["cookie"] = cookie;

    const r = await fetch(
      `${base}/api/app/channels?lang=${encodeURIComponent(lang)}&limit=${encodeURIComponent(limit)}&offset=${encodeURIComponent(offset)}`,
      { headers, cache: "no-store" },
    );

    const text = await r.text();
    if (!r.ok) {
      console.error("[OTT] channels list proxy error:", r.status, text);
    }
    return new NextResponse(text, { status: r.status });
  } catch (e) {
    console.error("[OTT] channels list proxy error:", e);
    return NextResponse.json(
      { error: "channels list proxy failed" },
      { status: 500 },
    );
  }
}
