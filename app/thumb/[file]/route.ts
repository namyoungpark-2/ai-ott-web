export async function GET(
  _req: Request,
  { params }: { params: { file: string } }
) {
  const res = await fetch(`http://localhost:8080/thumb/${params.file}`, {
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
