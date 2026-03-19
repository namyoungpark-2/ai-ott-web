export const runtime = "edge";
import { NextResponse } from "next/server";
import { BASE_URL } from "@/app/constants";

export async function POST(req: Request) {
  // 백엔드에 로그아웃 알림 (실패해도 쿠키는 제거)
  try {
    const cookie = req.headers.get("cookie");
    await fetch(`${BASE_URL}/auth/logout`, {
      method: "POST",
      headers: cookie ? { cookie } : {},
    });
  } catch {
    // 백엔드 연결 실패해도 쿠키 제거는 계속 진행
  }

  const isProduction = process.env.NODE_ENV === "production";
  const res = NextResponse.json({ ok: true });

  // auth_token과 auth_user 쿠키 모두 제거
  res.cookies.set("auth_token", "", {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  res.cookies.set("auth_user", "", {
    httpOnly: false,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return res;
}
