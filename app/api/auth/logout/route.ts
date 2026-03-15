export const runtime = "edge";
import { NextResponse } from "next/server";
import { BASE_URL } from "@/app/constants";

export async function POST(req: Request) {
  try {
    const headers: HeadersInit = {};
    const authHeader = req.headers.get("authorization");
    const cookie = req.headers.get("cookie");
    if (authHeader) headers["authorization"] = authHeader;
    if (cookie) headers["cookie"] = cookie;

    await fetch(`${BASE_URL}/api/auth/logout`, { method: "POST", headers });
  } catch {
    // 백엔드 연결 실패해도 클라이언트 세션은 정리하도록 200 반환
  }
  return NextResponse.json({ ok: true });
}
