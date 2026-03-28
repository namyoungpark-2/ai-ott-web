import { NextResponse } from "next/server";

function forwardHeaders(req: Request): HeadersInit {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  const authHeader = req.headers.get("authorization");
  if (authHeader) {
    headers["authorization"] = authHeader;
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

export async function GET(
  req: Request,
  { params }: { params: Promise<{ handle: string }> }
) {
  try {
    const { searchParams } = new URL(req.url);
    const lang = searchParams.get("lang") ?? "en";

    const { handle } = await params;

    const base =
      process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";
    console.log("[OTT] channels proxy", handle);

    const headers = forwardHeaders(req);

    const r = await fetch(
      `${base}/api/app/channels/${encodeURIComponent(handle)}?lang=${encodeURIComponent(lang)}`,
      {
        headers,
        cache: "no-store",
      }
    );

    const text = await r.text();

    if (!r.ok) {
      console.error(
        "[OTT] channels proxy error:",
        r.status,
        r.statusText,
        text
      );
    }

    return new NextResponse(text, { status: r.status });
  } catch (e) {
    console.error("[OTT] channels proxy error:", e);
    return NextResponse.json(
      { error: "channels proxy failed" },
      { status: 500 }
    );
  }
}
