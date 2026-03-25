export const runtime = "edge";
export async function POST(req: Request) {
  const formData = await req.formData();

  const base = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";
  const res = await fetch(`${base}/api/upload`, {
    method: "POST",
    body: formData,
  });

  const text = await res.text();
  return new Response(text, {
    status: res.status,
    headers: {
      "content-type": res.headers.get("content-type") ?? "application/json",
    },
  });
}
