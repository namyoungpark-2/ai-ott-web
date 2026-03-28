import { NextResponse } from "next/server";

function forwardHeaders(req: Request): HeadersInit {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  // auth_token 쿠키에서 JWT 추출하여 Authorization 헤더로 변환
  const authHeader = req.headers.get("authorization");
  const cookie = req.headers.get("cookie") ?? "";
  if (authHeader) {
    headers["authorization"] = authHeader;
  } else {
    const match = cookie.match(/(?:^|;\s*)auth_token=([^;]+)/);
    if (match?.[1]) headers["authorization"] = `Bearer ${match[1]}`;
  }

  if (cookie) {
    headers["cookie"] = cookie;
  }

  const userAgent = req.headers.get("user-agent");
  if (userAgent) {
    headers["user-agent"] = userAgent;
  }

  return headers;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const lang = searchParams.get("lang") ?? "en";

    const base =
      process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";
    console.log("[OTT] me subscriptions proxy");

    const headers = forwardHeaders(req);

    const r = await fetch(
      `${base}/api/app/me/subscriptions?lang=${encodeURIComponent(lang)}`,
      {
        headers,
        cache: "no-store",
      }
    );

    const text = await r.text();

    if (!r.ok) {
      console.error(
        "[OTT] me subscriptions proxy error:",
        r.status,
        r.statusText,
        text
      );
    }

    return new NextResponse(text, { status: r.status });
  } catch (e) {
    console.error("[OTT] me subscriptions proxy error:", e);
    return NextResponse.json(
      { error: "me subscriptions proxy failed" },
      { status: 500 }
    );
  }
}
