import { NextResponse } from "next/server";
import { BASE_URL, BACKEND_HEADERS } from "@/app/constants";

function forwardHeaders(req: Request): HeadersInit {
  const headers: HeadersInit = { "Content-Type": "application/json", ...BACKEND_HEADERS };
  const authHeader = req.headers.get("authorization");
  const cookie = req.headers.get("cookie") ?? "";
  if (authHeader) {
    headers["authorization"] = authHeader;
  } else {
    const match = cookie.match(/(?:^|;\s*)auth_token=([^;]+)/);
    if (match?.[1]) headers["authorization"] = `Bearer ${match[1]}`;
  }
  if (cookie) headers["cookie"] = cookie;
  return headers;
}

// PUT /api/me/password — change password
export async function PUT(req: Request) {
  console.log("[PUT /api/me/password] changing password");
  try {
    const body = await req.json();
    const r = await fetch(`${BASE_URL}/api/app/me/password`, {
      method: "PUT",
      headers: forwardHeaders(req),
      body: JSON.stringify(body),
      cache: "no-store",
    });
    return new NextResponse(await r.text(), { status: r.status });
  } catch (err) {
    console.error("[PUT /api/me/password] error:", err);
    return NextResponse.json({ error: "password change failed" }, { status: 500 });
  }
}
