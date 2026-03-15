export const runtime = "edge";
import { NextRequest, NextResponse } from "next/server";
import { BASE_URL } from "../../constants";

export async function GET(req: NextRequest) {
  try {
    // URL에서 직접 경로 추출 (더 안전함)
    const url = new URL(req.url);
    const pathname = url.pathname;
    // /hls/... 부분만 추출
    const path = pathname.replace(/^\/hls\//, "");
    const targetUrl = `${BASE_URL}/hls/${path}`;

    const response = await fetch(targetUrl, {
      method: "GET",
      cache: "no-store",
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => response.statusText);
      console.error("[OTT] HLS proxy failed:", response.status, errorText);
      return new NextResponse(errorText, { 
        status: response.status,
        headers: {
          "content-type": response.headers.get("content-type") || "text/plain",
        },
      });
    }

    // HLS 파일은 스트리밍이므로 body를 그대로 전달
    const contentType = response.headers.get("content-type") || "application/vnd.apple.mpegurl";
    
    return new NextResponse(response.body, {
      status: response.status,
      headers: {
        "content-type": contentType,
        "cache-control": "public, max-age=0",
        "access-control-allow-origin": "*",
        "access-control-allow-methods": "GET, HEAD, OPTIONS",
        "access-control-allow-headers": "*",
      },
    });
  } catch (error) {
    console.error("[OTT] HLS proxy error:", error);
    return NextResponse.json({ error: "HLS proxy failed" }, { status: 500 });
  }
}

export async function HEAD(req: NextRequest) {
  try {
    // URL에서 직접 경로 추출 (더 안전함)
    const url = new URL(req.url);
    const pathname = url.pathname;
    // /hls/... 부분만 추출
    const path = pathname.replace(/^\/hls\//, "");
    const targetUrl = `${BASE_URL}/hls/${path}`;

    const response = await fetch(targetUrl, {
      method: "HEAD",
      cache: "no-store",
    });

    return new NextResponse(null, {
      status: response.status,
      headers: {
        "content-type": response.headers.get("content-type") || "application/vnd.apple.mpegurl",
        "content-length": response.headers.get("content-length") || "0",
        "access-control-allow-origin": "*",
        "access-control-allow-methods": "GET, HEAD, OPTIONS",
        "access-control-allow-headers": "*",
      },
    });
  } catch (error) {
    console.error("[OTT] HLS proxy HEAD error:", error);
    return NextResponse.json({ error: "HLS proxy failed" }, { status: 500 });
  }
}
