import { NextResponse } from "next/server";
import { BASE_URL } from "@/app/constants";

type LoginBody = { username?: string; password?: string };

export async function POST(req: Request) {
  let body: LoginBody = {};
  try {
    body = (await req.json()) as LoginBody;
  } catch {
    return NextResponse.json({ message: "잘못된 요청입니다." }, { status: 400 });
  }

  // 백엔드 프록시 시도
  try {
    const r = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return new NextResponse(await r.text(), { status: r.status });
  } catch {
    // 백엔드 미연결 시 개발 전용 목 로그인
    // 실제 백엔드 연결 후에는 MOCK_AUTH_ENABLED=false 로 설정
    if (process.env.MOCK_AUTH_ENABLED === "true") {
      const { username, password } = body;
      if (username === "admin" && password === "admin") {
        return NextResponse.json({
          id: "mock-admin-001",
          username: "admin",
          role: "ADMIN",
        });
      }
      return NextResponse.json(
        { message: "아이디 또는 비밀번호가 올바르지 않습니다." },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { message: "서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요." },
      { status: 503 }
    );
  }
}
