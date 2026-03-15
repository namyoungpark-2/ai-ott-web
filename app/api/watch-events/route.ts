export const runtime = "edge";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.text(); // 그대로 전달(검증은 백엔드)
    const base = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

    // 원본 요청의 헤더를 백엔드로 전달 (인증 헤더 포함)
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

    const r = await fetch(`${base}/api/app/watch-events`, {
      method: "POST",
      headers,
      body,
    });

    const text = await r.text();
    return new NextResponse(text, { status: r.status });
  } catch (e) {
    return NextResponse.json({ error: "watch-events proxy failed" }, { status: 500 });
  }
}
