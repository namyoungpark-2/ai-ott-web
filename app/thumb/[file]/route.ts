import { BASE_URL } from "@/app/constants";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ file: string }> }
) {
  const { file } = await params;
  const res = await fetch(`${BASE_URL}/thumb/${file}`, {
    method: "GET",
    cache: "no-store",
  });

  // 그대로 스트리밍
  return new Response(res.body, {
    status: res.status,
    headers: {
      "content-type": res.headers.get("content-type") ?? "image/jpeg",
      "cache-control": "public, max-age=60",
    },
  });
}
