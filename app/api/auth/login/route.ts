import { NextResponse } from "next/server";
import { BASE_URL, BACKEND_HEADERS } from "@/app/constants";

type LoginBody = { username?: string; password?: string };

export async function POST(req: Request) {
  let body: LoginBody = {};
  try {
    body = (await req.json()) as LoginBody;
  } catch {
    return NextResponse.json({ message: "잘못된 요청입니다." }, { status: 400 });
  }

  try {
    const r = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...BACKEND_HEADERS },
      body: JSON.stringify(body),
    });

    if (!r.ok) {
      const text = await r.text().catch(() => "");
      return new NextResponse(text, { status: r.status });
    }

    const data = (await r.json()) as {
      accessToken?: string;
      id?: string;
      username?: string;
      role?: string;
      subscriptionTier?: string;
    };

    const token = data.accessToken;
    if (!token) {
      return NextResponse.json({ message: "로그인에 실패했습니다." }, { status: 500 });
    }

    // JWT는 httpOnly 쿠키에만 저장 (XSS로 토큰 탈취 불가)
    // 비민감 사용자 정보는 일반 쿠키에 저장 (JS에서 읽어 UI 표시용)
    const userInfo = JSON.stringify({
      id: data.id,
      username: data.username,
      role: data.role,
      subscriptionTier: data.subscriptionTier ?? "FREE",
    });

    const isProduction = process.env.NODE_ENV === "production";
    const res = NextResponse.json({
      id: data.id,
      username: data.username,
      role: data.role,
      subscriptionTier: data.subscriptionTier ?? "FREE",
    });

    // 토큰 쿠키 (httpOnly — JS에서 접근 불가)
    res.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24, // 24시간
    });

    // 사용자 정보 쿠키 (비민감 정보 — UI 복원용)
    res.cookies.set("auth_user", userInfo, {
      httpOnly: false,
      secure: isProduction,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24,
    });

    return res;
  } catch {
    if (process.env.MOCK_AUTH_ENABLED === "true") {
      const { username, password } = body;
      if (username === "admin" && password === "admin") {
        const mockUser = { id: "mock-001", username: "admin", role: "ADMIN", subscriptionTier: "FREE" };
        const res = NextResponse.json(mockUser);
        res.cookies.set("auth_user", JSON.stringify(mockUser), { path: "/", maxAge: 86400 });
        return res;
      }
      return NextResponse.json({ message: "아이디 또는 비밀번호가 올바르지 않습니다." }, { status: 401 });
    }
    return NextResponse.json({ message: "서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요." }, { status: 503 });
  }
}
