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
    // auth_token 쿠키에서 JWT 추출하여 Authorization 헤더로 변환
    const authHeader = req.headers.get("authorization");
    const cookie = req.headers.get("cookie") ?? "";
    if (authHeader) {
      headers["authorization"] = authHeader;
    } else {
      const match = cookie.match(/(?:^|;\s*)auth_token=([^;]+)/);
      if (match?.[1]) headers["authorization"] = `Bearer ${match[1]}`;
    }
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
