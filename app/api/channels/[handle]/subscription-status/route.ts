import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ handle: string }> }
) {
  try {
    const { handle } = await params;
    const base = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

    console.log("[OTT] subscription-status proxy", handle);

    const headers: HeadersInit = { "Content-Type": "application/json" };
    const authHeader = req.headers.get("authorization");
    if (authHeader) headers["authorization"] = authHeader;
    const cookie = req.headers.get("cookie");
    if (cookie) headers["cookie"] = cookie;

    const r = await fetch(
      `${base}/api/app/channels/${encodeURIComponent(handle)}/subscription-status`,
      { headers, cache: "no-store" }
    );

    const text = await r.text();
    if (!r.ok) {
      console.error("[OTT] subscription-status proxy error:", r.status, text);
    }
    return new NextResponse(text, { status: r.status });
  } catch (e) {
    console.error("[OTT] subscription-status proxy error:", e);
    return NextResponse.json({ error: "subscription-status proxy failed" }, { status: 500 });
  }
}
