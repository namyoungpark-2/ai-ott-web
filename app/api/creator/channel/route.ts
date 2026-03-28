import { NextResponse } from "next/server";

const base = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

function forwardHeaders(req: Request): HeadersInit {
  const headers: HeadersInit = { "Content-Type": "application/json" };
  const authHeader = req.headers.get("authorization");
  const cookie = req.headers.get("cookie") ?? "";
  if (authHeader) {
    headers["authorization"] = authHeader;
  } else {
    const match = cookie.match(/(?:^|;\s*)auth_token=([^;]+)/);
    if (match?.[1]) headers["authorization"] = `Bearer ${match[1]}`;
  }
  if (cookie) headers["cookie"] = cookie;
  const userAgent = req.headers.get("user-agent");
  if (userAgent) headers["user-agent"] = userAgent;
  return headers;
}

// GET /api/creator/channel?lang=...
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const lang = searchParams.get("lang") ?? "en";

    console.log("[OTT] creator channel GET proxy");

    const r = await fetch(
      `${base}/api/app/creator/channel?lang=${encodeURIComponent(lang)}`,
      {
        headers: forwardHeaders(req),
        cache: "no-store",
      }
    );

    const text = await r.text();
    if (!r.ok) {
      console.error("[OTT] creator channel GET error:", r.status, text);
    }
    return new NextResponse(text, { status: r.status });
  } catch (e) {
    console.error("[OTT] creator channel GET error:", e);
    return NextResponse.json(
      { error: "creator channel proxy failed" },
      { status: 500 }
    );
  }
}

// PUT /api/creator/channel
export async function PUT(req: Request) {
  try {
    const body = await req.text();

    console.log("[OTT] creator channel PUT proxy");

    const r = await fetch(`${base}/api/app/creator/channel`, {
      method: "PUT",
      headers: forwardHeaders(req),
      body,
    });

    const text = await r.text();
    if (!r.ok) {
      console.error("[OTT] creator channel PUT error:", r.status, text);
    }
    return new NextResponse(text, { status: r.status });
  } catch (e) {
    console.error("[OTT] creator channel PUT error:", e);
    return NextResponse.json(
      { error: "creator channel proxy failed" },
      { status: 500 }
    );
  }
}
