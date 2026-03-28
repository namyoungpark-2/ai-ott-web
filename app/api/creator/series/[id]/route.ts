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

// PUT /api/creator/series/[id]
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.text();

    console.log("[OTT] creator series PUT proxy", id);

    const r = await fetch(`${base}/api/app/creator/series/${id}`, {
      method: "PUT",
      headers: forwardHeaders(req),
      body,
    });

    const text = await r.text();
    if (!r.ok) {
      console.error("[OTT] creator series PUT error:", r.status, text);
    }
    return new NextResponse(text, { status: r.status });
  } catch (e) {
    console.error("[OTT] creator series PUT error:", e);
    return NextResponse.json(
      { error: "creator series proxy failed" },
      { status: 500 }
    );
  }
}
