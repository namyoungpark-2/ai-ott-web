export const runtime = "edge";
import { NextResponse } from 'next/server';
import { BASE_URL } from '@/app/constants';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const lang = searchParams.get('lang') ?? 'en';
    const q = searchParams.get('q') ?? '';
    const category = searchParams.get('category');
    const limit = searchParams.get('limit') ?? '24';
    const offset = searchParams.get('offset') ?? '0';

    const params = new URLSearchParams({ lang, q, limit, offset });
    if (category) params.set('category', category);

    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    const authHeader = req.headers.get('authorization');
    const cookie = req.headers.get('cookie');
    if (authHeader) headers['authorization'] = authHeader;
    if (cookie) headers['cookie'] = cookie;

    const r = await fetch(`${BASE_URL}/api/app/catalog/search?${params.toString()}`, {
      headers,
      cache: 'no-store',
    });

    return new NextResponse(await r.text(), { status: r.status });
  } catch {
    return NextResponse.json({ error: 'catalog search proxy failed' }, { status: 500 });
  }
}
