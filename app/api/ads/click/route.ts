import { NextResponse } from "next/server";
import { BASE_URL } from "@/app/constants";
import type { AdClickPayload } from "@/types/ads";

function forwardHeaders(req: Request): HeadersInit {
  const headers: HeadersInit = { "Content-Type": "application/json" };
  const auth = req.headers.get("authorization");
  const cookie = req.headers.get("cookie");
  if (auth) headers["authorization"] = auth;
  if (cookie) headers["cookie"] = cookie;
  return headers;
}

// POST /api/ads/click  { adId, adType, contentId?, occurredAt }
export async function POST(req: Request) {
  let body: Partial<AdClickPayload> = {};
  try {
    body = (await req.json()) as Partial<AdClickPayload>;
  } catch {
    return NextResponse.json({ message: "잘못된 요청입니다." }, { status: 400 });
  }

  if (!body.adId || !body.adType) {
    return NextResponse.json({ message: "adId와 adType은 필수입니다." }, { status: 400 });
  }

  try {
    const r = await fetch(`${BASE_URL}/api/app/ads/click`, {
      method: "POST",
      headers: forwardHeaders(req),
      body: JSON.stringify(body),
    });

    if (!r.ok) {
      console.warn("[ads] click proxy error:", r.status);
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true });
  }
}
