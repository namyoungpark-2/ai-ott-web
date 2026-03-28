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

// PUT /api/creator/contents/[id]/metadata
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.text();

    console.log("[OTT] creator contents metadata PUT proxy", id);

    const r = await fetch(
      `${base}/api/app/creator/contents/${id}/metadata`,
      {
        method: "PUT",
        headers: forwardHeaders(req),
        body,
      }
    );

    const text = await r.text();
    if (!r.ok) {
      console.error(
        "[OTT] creator contents metadata PUT error:",
        r.status,
        text
      );
    }
    return new NextResponse(text, { status: r.status });
  } catch (e) {
    console.error("[OTT] creator contents metadata PUT error:", e);
    return NextResponse.json(
      { error: "creator contents metadata proxy failed" },
      { status: 500 }
    );
  }
}
