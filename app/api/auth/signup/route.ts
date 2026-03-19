export const runtime = "edge";
import { NextResponse } from "next/server";
import { BASE_URL } from "@/app/constants";

type SignupBody = { username?: string; password?: string };

export async function POST(req: Request) {
  let body: SignupBody = {};
  try {
    body = (await req.json()) as SignupBody;
  } catch {
    return NextResponse.json({ message: "잘못된 요청입니다." }, { status: 400 });
  }

  try {
    const r = await fetch(`${BASE_URL}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (r.status === 409) {
      return NextResponse.json({ message: "이미 사용 중인 아이디입니다." }, { status: 409 });
    }

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
      return NextResponse.json({ message: "회원가입에 실패했습니다." }, { status: 500 });
    }

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

    res.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24,
    });

    res.cookies.set("auth_user", userInfo, {
      httpOnly: false,
      secure: isProduction,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24,
    });

    return res;
  } catch {
    return NextResponse.json({ message: "서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요." }, { status: 503 });
  }
}
