import { NextResponse } from "next/server";
import { BASE_URL, BACKEND_HEADERS } from "@/app/constants";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { plan?: string };
    const cookie = req.headers.get("cookie") ?? "";

    const r = await fetch(`${BASE_URL}/api/app/payments/checkout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        cookie,
        ...BACKEND_HEADERS,
      },
      body: JSON.stringify({ plan: body.plan }),
      credentials: "include",
    });

    const data = await r.json();
    return NextResponse.json(data, { status: r.status });
  } catch {
    return NextResponse.json({ error: "결제 서버에 연결할 수 없습니다." }, { status: 503 });
  }
}
