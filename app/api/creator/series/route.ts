import { NextResponse } from "next/server";

const base = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

function forwardHeaders(req: Request): HeadersInit {
  const headers: HeadersInit = { "Content-Type": "application/json" };
  const authHeader = req.headers.get("authorization");
  if (authHeader) headers["authorization"] = authHeader;
  const cookie = req.headers.get("cookie");
  if (cookie) headers["cookie"] = cookie;
  const userAgent = req.headers.get("user-agent");
  if (userAgent) headers["user-agent"] = userAgent;
  return headers;
}

// GET /api/creator/series?lang=...
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const lang = searchParams.get("lang") ?? "en";

    console.log("[OTT] creator series GET proxy");

    const r = await fetch(
      `${base}/api/app/creator/series?lang=${encodeURIComponent(lang)}`,
      {
        headers: forwardHeaders(req),
        cache: "no-store",
      }
    );

    const text = await r.text();
    if (!r.ok) {
      console.error("[OTT] creator series GET error:", r.status, text);
    }
    return new NextResponse(text, { status: r.status });
  } catch (e) {
    console.error("[OTT] creator series GET error:", e);
    return NextResponse.json(
      { error: "creator series proxy failed" },
      { status: 500 }
    );
  }
}

// POST /api/creator/series
export async function POST(req: Request) {
  try {
    const body = await req.text();

    console.log("[OTT] creator series POST proxy");

    const r = await fetch(`${base}/api/app/creator/series`, {
      method: "POST",
      headers: forwardHeaders(req),
      body,
    });

    const text = await r.text();
    if (!r.ok) {
      console.error("[OTT] creator series POST error:", r.status, text);
    }
    return new NextResponse(text, { status: r.status });
  } catch (e) {
    console.error("[OTT] creator series POST error:", e);
    return NextResponse.json(
      { error: "creator series proxy failed" },
      { status: 500 }
    );
  }
}
