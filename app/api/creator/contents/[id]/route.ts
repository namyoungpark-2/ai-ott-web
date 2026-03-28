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

// DELETE /api/creator/contents/[id]
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    console.log("[OTT] creator contents DELETE proxy", id);

    const r = await fetch(`${base}/api/app/creator/contents/${id}`, {
      method: "DELETE",
      headers: forwardHeaders(req),
    });

    const text = await r.text();
    if (!r.ok) {
      console.error("[OTT] creator contents DELETE error:", r.status, text);
    }
    return new NextResponse(text, { status: r.status });
  } catch (e) {
    console.error("[OTT] creator contents DELETE error:", e);
    return NextResponse.json(
      { error: "creator contents delete proxy failed" },
      { status: 500 }
    );
  }
}
