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

// GET /api/creator/contents?lang=...&limit=...
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const lang = searchParams.get("lang") ?? "en";
    const limit = searchParams.get("limit") ?? "";

    console.log("[OTT] creator contents GET proxy");

    const url = new URL(`${base}/api/app/creator/contents`);
    url.searchParams.set("lang", lang);
    if (limit) url.searchParams.set("limit", limit);

    const r = await fetch(url.toString(), {
      headers: forwardHeaders(req),
      cache: "no-store",
    });

    const text = await r.text();
    if (!r.ok) {
      console.error("[OTT] creator contents GET error:", r.status, text);
    }
    return new NextResponse(text, { status: r.status });
  } catch (e) {
    console.error("[OTT] creator contents GET error:", e);
    return NextResponse.json(
      { error: "creator contents proxy failed" },
      { status: 500 }
    );
  }
}

// POST /api/creator/contents
export async function POST(req: Request) {
  try {
    const body = await req.text();

    console.log("[OTT] creator contents POST proxy");

    const r = await fetch(`${base}/api/app/creator/contents`, {
      method: "POST",
      headers: forwardHeaders(req),
      body,
    });

    const text = await r.text();
    if (!r.ok) {
      console.error("[OTT] creator contents POST error:", r.status, text);
    }
    return new NextResponse(text, { status: r.status });
  } catch (e) {
    console.error("[OTT] creator contents POST error:", e);
    return NextResponse.json(
      { error: "creator contents proxy failed" },
      { status: 500 }
    );
  }
}
