import { NextResponse } from "next/server";

function extractToken(req: Request): string | null {
  // 1. Authorization 헤더에서 직접 가져오기
  const authHeader = req.headers.get("authorization");
  if (authHeader) return authHeader.replace(/^Bearer\s+/i, "");
  // 2. httpOnly 쿠키에서 JWT 추출
  const cookie = req.headers.get("cookie") ?? "";
  const match = cookie.match(/(?:^|;\s*)auth_token=([^;]+)/);
  return match?.[1] ?? null;
}

function forwardHeaders(req: Request): HeadersInit {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  const token = extractToken(req);
  if (token) {
    headers["authorization"] = `Bearer ${token}`;
  }

  const cookie = req.headers.get("cookie");
  if (cookie) {
    headers["cookie"] = cookie;
  }

  const userAgent = req.headers.get("user-agent");
  if (userAgent) {
    headers["user-agent"] = userAgent;
  }

  return headers;
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ handle: string }> }
) {
  try {
    const { handle } = await params;

    const base =
      process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";
    const token = extractToken(req);
    console.log("[OTT] channels subscribe POST proxy", handle, "token:", token ? `${token.slice(0, 10)}...` : "NONE", "cookie:", req.headers.get("cookie")?.slice(0, 50) ?? "NONE");

    const headers = forwardHeaders(req);

    const r = await fetch(
      `${base}/api/app/channels/${encodeURIComponent(handle)}/subscribe`,
      {
        method: "POST",
        headers,
        cache: "no-store",
      }
    );

    const text = await r.text();

    if (!r.ok) {
      console.error(
        "[OTT] channels subscribe POST proxy error:",
        r.status,
        r.statusText,
        text
      );
    }

    return new NextResponse(text, { status: r.status });
  } catch (e) {
    console.error("[OTT] channels subscribe POST proxy error:", e);
    return NextResponse.json(
      { error: "channels subscribe proxy failed" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ handle: string }> }
) {
  try {
    const { handle } = await params;

    const base =
      process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";
    console.log("[OTT] channels subscribe DELETE proxy", handle);

    const headers = forwardHeaders(req);

    const r = await fetch(
      `${base}/api/app/channels/${encodeURIComponent(handle)}/subscribe`,
      {
        method: "DELETE",
        headers,
        cache: "no-store",
      }
    );

    const text = await r.text();

    if (!r.ok) {
      console.error(
        "[OTT] channels subscribe DELETE proxy error:",
        r.status,
        r.statusText,
        text
      );
    }

    return new NextResponse(text, { status: r.status });
  } catch (e) {
    console.error("[OTT] channels subscribe DELETE proxy error:", e);
    return NextResponse.json(
      { error: "channels unsubscribe proxy failed" },
      { status: 500 }
    );
  }
}
