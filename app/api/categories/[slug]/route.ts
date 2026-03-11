import { NextResponse } from "next/server";
import { BASE_URL } from "@/app/constants";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(req.url);
    const lang = searchParams.get("lang") ?? "en";
    const page = searchParams.get("page") ?? "0";
    const size = searchParams.get("size") ?? "24";

    const headers: HeadersInit = { "Content-Type": "application/json" };
    const authHeader = req.headers.get("authorization");
    const cookie = req.headers.get("cookie");
    if (authHeader) headers["authorization"] = authHeader;
    if (cookie) headers["cookie"] = cookie;

    const url = `${BASE_URL}/api/app/categories/${encodeURIComponent(slug)}?lang=${encodeURIComponent(lang)}&page=${page}&size=${size}`;
    const r = await fetch(url, { headers, cache: "no-store" });

    return new NextResponse(await r.text(), { status: r.status });
  } catch {
    return NextResponse.json(
      { error: "category proxy failed" },
      { status: 500 }
    );
  }
}
