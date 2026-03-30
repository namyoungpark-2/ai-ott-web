import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") ?? "";
    const lang = searchParams.get("lang") ?? "ko";
    const limit = searchParams.get("limit") ?? "24";
    const offset = searchParams.get("offset") ?? "0";

    const base =
      process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";
    console.log("[OTT] channels search proxy, q=", q);

    const headers: HeadersInit = { "Content-Type": "application/json" };
    const authHeader = req.headers.get("authorization");
    if (authHeader) headers["authorization"] = authHeader;
    const cookie = req.headers.get("cookie");
    if (cookie) headers["cookie"] = cookie;

    const params = new URLSearchParams({
      q,
      lang,
      limit,
      offset,
    });

    const r = await fetch(
      `${base}/api/app/channels/search?${params.toString()}`,
      { headers, cache: "no-store" },
    );

    const text = await r.text();
    if (!r.ok) {
      console.error("[OTT] channels search proxy error:", r.status, text);
      if (r.status === 404 || r.status === 405) {
        return NextResponse.json([], { status: 200 });
      }
    }
    return new NextResponse(text, { status: r.status });
  } catch (e) {
    console.error("[OTT] channels search proxy error:", e);
    return NextResponse.json([], { status: 200 });
  }
}
