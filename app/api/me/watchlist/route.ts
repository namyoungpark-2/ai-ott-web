export const runtime = "edge";
import { NextResponse } from "next/server";
import { BASE_URL } from "@/app/constants";

function forwardHeaders(req: Request): HeadersInit {
  const headers: HeadersInit = { "Content-Type": "application/json" };
  const auth = req.headers.get("authorization");
  const cookie = req.headers.get("cookie");
  if (auth) headers["authorization"] = auth;
  if (cookie) headers["cookie"] = cookie;
  return headers;
}

// GET /api/me/watchlist
export async function GET(req: Request) {
  try {
    const r = await fetch(`${BASE_URL}/api/app/me/watchlist`, {
      headers: forwardHeaders(req),
      cache: "no-store",
    });
    return new NextResponse(await r.text(), { status: r.status });
  } catch {
    return NextResponse.json({ error: "watchlist fetch failed" }, { status: 503 });
  }
}

// POST /api/me/watchlist  { contentId }
export async function POST(req: Request) {
  let body: { contentId?: string } = {};
  try {
    body = (await req.json()) as { contentId?: string };
  } catch {
    return NextResponse.json({ message: "잘못된 요청입니다." }, { status: 400 });
  }
  if (!body.contentId) {
    return NextResponse.json({ message: "contentId가 필요합니다." }, { status: 400 });
  }
  try {
    const r = await fetch(`${BASE_URL}/api/app/me/watchlist`, {
      method: "POST",
      headers: forwardHeaders(req),
      body: JSON.stringify(body),
    });
    return new NextResponse(await r.text(), { status: r.status });
  } catch {
    return NextResponse.json({ error: "watchlist add failed" }, { status: 503 });
  }
}
