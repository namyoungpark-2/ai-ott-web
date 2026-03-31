import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const base = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

    console.log("[OTT] creator thumbnail upload proxy", id);

    const headers: HeadersInit = {};
    const authHeader = req.headers.get("authorization");
    const cookie = req.headers.get("cookie") ?? "";
    if (authHeader) {
      headers["authorization"] = authHeader;
    } else {
      const match = cookie.match(/(?:^|;\s*)auth_token=([^;]+)/);
      if (match?.[1]) headers["authorization"] = `Bearer ${match[1]}`;
    }
    if (cookie) headers["cookie"] = cookie;

    const body = await req.arrayBuffer();
    const contentType = req.headers.get("content-type");
    if (contentType) headers["content-type"] = contentType;

    const r = await fetch(
      `${base}/api/app/creator/contents/${encodeURIComponent(id)}/thumbnail`,
      { method: "POST", headers, body },
    );

    const text = await r.text();
    if (!r.ok) {
      console.error("[OTT] creator thumbnail proxy error:", r.status, text);
    }
    return new NextResponse(text, { status: r.status });
  } catch (e) {
    console.error("[OTT] creator thumbnail proxy error:", e);
    return NextResponse.json({ error: "thumbnail proxy failed" }, { status: 500 });
  }
}
