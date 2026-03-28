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

// GET /api/me — fetch profile info
export async function GET(req: Request) {
  console.log("[GET /api/me] fetching profile");
  try {
    const r = await fetch(`${BASE_URL}/api/app/me`, {
      headers: forwardHeaders(req),
      cache: "no-store",
    });
    return new NextResponse(await r.text(), { status: r.status });
  } catch (err) {
    console.error("[GET /api/me] error:", err);
    return NextResponse.json({ error: "profile fetch failed" }, { status: 500 });
  }
}

// PUT /api/me — update username
export async function PUT(req: Request) {
  console.log("[PUT /api/me] updating profile");
  try {
    const body = await req.json();
    const r = await fetch(`${BASE_URL}/api/app/me`, {
      method: "PUT",
      headers: forwardHeaders(req),
      body: JSON.stringify(body),
      cache: "no-store",
    });
    return new NextResponse(await r.text(), { status: r.status });
  } catch (err) {
    console.error("[PUT /api/me] error:", err);
    return NextResponse.json({ error: "profile update failed" }, { status: 500 });
  }
}

// DELETE /api/me — delete account
export async function DELETE(req: Request) {
  console.log("[DELETE /api/me] deleting account");
  try {
    const r = await fetch(`${BASE_URL}/api/app/me`, {
      method: "DELETE",
      headers: forwardHeaders(req),
      cache: "no-store",
    });
    return new NextResponse(await r.text(), { status: r.status });
  } catch (err) {
    console.error("[DELETE /api/me] error:", err);
    return NextResponse.json({ error: "account deletion failed" }, { status: 500 });
  }
}
