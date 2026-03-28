import { NextResponse } from "next/server";

export async function PATCH(req: Request) {
  try {
    const base = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

    console.log("[OTT] channel handle change proxy");

    const headers: HeadersInit = { "Content-Type": "application/json" };
    const authHeader = req.headers.get("authorization");
    if (authHeader) headers["authorization"] = authHeader;
    const cookie = req.headers.get("cookie");
    if (cookie) headers["cookie"] = cookie;

    const body = await req.text();

    const r = await fetch(`${base}/api/app/creator/channel/handle`, {
      method: "PATCH",
      headers,
      body,
    });

    const text = await r.text();
    if (!r.ok) {
      console.error("[OTT] channel handle proxy error:", r.status, text);
    }
    return new NextResponse(text, { status: r.status });
  } catch (e) {
    console.error("[OTT] channel handle proxy error:", e);
    return NextResponse.json(
      { error: "channel handle proxy failed" },
      { status: 500 },
    );
  }
}
