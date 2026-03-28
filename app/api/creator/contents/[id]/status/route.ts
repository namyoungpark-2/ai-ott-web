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

// PATCH /api/creator/contents/[id]/status?status=...
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") ?? "";

    console.log("[OTT] creator contents status PATCH proxy", id, status);

    const r = await fetch(
      `${base}/api/app/creator/contents/${id}/status?status=${encodeURIComponent(status)}`,
      {
        method: "PATCH",
        headers: forwardHeaders(req),
      }
    );

    const text = await r.text();
    if (!r.ok) {
      console.error(
        "[OTT] creator contents status PATCH error:",
        r.status,
        text
      );
    }
    return new NextResponse(text, { status: r.status });
  } catch (e) {
    console.error("[OTT] creator contents status PATCH error:", e);
    return NextResponse.json(
      { error: "creator contents status proxy failed" },
      { status: 500 }
    );
  }
}
