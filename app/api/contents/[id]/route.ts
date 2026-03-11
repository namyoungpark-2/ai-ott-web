import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const { searchParams } = new URL(req.url);
    const lang = searchParams.get("lang") ?? "en";

    // Next.js 15+에서는 params가 Promise일 수 있음
    const resolvedParams = await Promise.resolve(params);
    const id = resolvedParams.id;

    const base = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";
    console.log("[OTT] contents proxy", id);

    // 원본 요청의 헤더를 백엔드로 전달 (인증 헤더 포함)
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    // Authorization 헤더 전달
    const authHeader = req.headers.get("authorization");
    if (authHeader) {
      headers["authorization"] = authHeader;
    }

    // Cookie 전달
    const cookie = req.headers.get("cookie");
    if (cookie) {
      headers["cookie"] = cookie;
    }

    // 기타 필요한 헤더 전달
    const userAgent = req.headers.get("user-agent");
    if (userAgent) {
      headers["user-agent"] = userAgent;
    }

    const r = await fetch(`${base}/api/app/contents/${id}?lang=${encodeURIComponent(lang)}`, {
      headers,
      cache: "no-store",
    });

    const text = await r.text();
    
    // 에러 응답 로깅
    if (!r.ok) {
      console.error("[OTT] contents proxy error:", r.status, r.statusText, text);
      console.error("[OTT] Request headers:", JSON.stringify(headers, null, 2));
    }
    
    return new NextResponse(text, { status: r.status });
  } catch (e) {
    console.error("[OTT] contents proxy error:", e);
    return NextResponse.json({ error: "contents proxy failed" }, { status: 500 });
  }
}
