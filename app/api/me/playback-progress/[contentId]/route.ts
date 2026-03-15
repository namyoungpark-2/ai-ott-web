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

// GET /api/me/playback-progress/[contentId]
export async function GET(
  req: Request,
  { params }: { params: Promise<{ contentId: string }> }
) {
  const { contentId } = await params;
  try {
    const r = await fetch(
      `${BASE_URL}/api/app/me/playback-progress/${contentId}`,
      { headers: forwardHeaders(req), cache: "no-store" }
    );
    return new NextResponse(await r.text(), { status: r.status });
  } catch {
    return NextResponse.json({ error: "playback-progress fetch failed" }, { status: 503 });
  }
}

// POST /api/me/playback-progress/[contentId]  { positionMs }
export async function POST(
  req: Request,
  { params }: { params: Promise<{ contentId: string }> }
) {
  const { contentId } = await params;
  let body: { positionMs?: number } = {};
  try {
    body = (await req.json()) as { positionMs?: number };
  } catch {
    return NextResponse.json({ message: "잘못된 요청입니다." }, { status: 400 });
  }
  try {
    const r = await fetch(
      `${BASE_URL}/api/app/me/playback-progress/${contentId}`,
      {
        method: "POST",
        headers: forwardHeaders(req),
        body: JSON.stringify(body),
      }
    );
    return new NextResponse(await r.text(), { status: r.status });
  } catch {
    return NextResponse.json({ error: "playback-progress save failed" }, { status: 503 });
  }
}
