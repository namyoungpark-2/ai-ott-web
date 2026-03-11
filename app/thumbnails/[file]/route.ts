import { NextResponse } from "next/server";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ file: string }> }
) {
  try {
    const { file } = await params;

    const base = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";
    const url = `${base}/thumbnails/${file}`;

    const res = await fetch(url, {
      method: "GET",
      cache: "no-store",
    });

    if (!res.ok) {
      return new NextResponse(res.statusText, { status: res.status });
    }

    // 이미지를 그대로 스트리밍
    return new NextResponse(res.body, {
      status: res.status,
      headers: {
        "content-type": res.headers.get("content-type") ?? "image/jpeg",
        "cache-control": "public, max-age=60",
        "access-control-allow-origin": "*",
      },
    });
  } catch (error) {
    console.error("[OTT] thumbnail proxy error:", error);
    return NextResponse.json({ error: "Thumbnail proxy failed" }, { status: 500 });
  }
}
