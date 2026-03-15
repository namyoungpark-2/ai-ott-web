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
    const text = await r.text();
    if (r.status === 409) {
      return NextResponse.json({ message: "이미 사용 중인 아이디입니다." }, { status: 409 });
    }
    return new NextResponse(text, { status: r.status });
  } catch {
    return NextResponse.json(
      { message: "서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요." },
      { status: 503 }
    );
  }
}
