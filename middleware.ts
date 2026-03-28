import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * 인증이 필요한 경로 보호.
 * auth_token 쿠키가 없으면 로그인 페이지로 리다이렉트.
 */

const PROTECTED_PATHS = [
  "/watch",      // 동영상 재생
  "/my-list",    // 내 목록
  "/profile",    // 프로필
  "/settings",   // 설정
  "/studio",     // 스튜디오
];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // API 라우트, 정적 파일, Next.js 내부 경로는 통과
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon")
  ) {
    return NextResponse.next();
  }

  // 보호 경로 확인
  const isProtected = PROTECTED_PATHS.some((p) => pathname.startsWith(p));
  if (!isProtected) return NextResponse.next();

  // httpOnly 쿠키는 미들웨어에서 읽을 수 있음
  const token = req.cookies.get("auth_token")?.value;
  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/watch/:path*",
    "/my-list",
    "/profile",
    "/settings",
    "/studio/:path*",
  ],
};
