export const runtime = "edge";
import { NextResponse } from "next/server";
import { BASE_URL, BACKEND_HEADERS } from "@/app/constants";

// DELETE /api/me/watchlist/[contentId]
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ contentId: string }> }
) {
  const { contentId } = await params;
  try {
    const headers: HeadersInit = { ...BACKEND_HEADERS };
    const auth = req.headers.get("authorization");
    const cookie = req.headers.get("cookie");
    if (auth) headers["authorization"] = auth;
    if (cookie) headers["cookie"] = cookie;

    const r = await fetch(`${BASE_URL}/api/app/me/watchlist/${contentId}`, {
      method: "DELETE",
      headers,
    });
    return new NextResponse(await r.text(), { status: r.status });
  } catch {
    return NextResponse.json({ error: "watchlist remove failed" }, { status: 503 });
  }
}
