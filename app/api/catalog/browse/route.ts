export const runtime = "edge";
import { NextResponse } from 'next/server';
import { BASE_URL, BACKEND_HEADERS } from '@/app/constants';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const lang = searchParams.get('lang') ?? 'en';
    const sectionLimit = searchParams.get('sectionLimit') ?? '12';

    const headers: HeadersInit = { 'Content-Type': 'application/json', ...BACKEND_HEADERS };
    const authHeader = req.headers.get('authorization');
    const cookie = req.headers.get('cookie');
    if (authHeader) headers['authorization'] = authHeader;
    if (cookie) headers['cookie'] = cookie;

    const r = await fetch(`${BASE_URL}/api/app/catalog/browse?lang=${encodeURIComponent(lang)}&sectionLimit=${encodeURIComponent(sectionLimit)}`, {
      headers,
      cache: 'no-store',
    });

    return new NextResponse(await r.text(), { status: r.status });
  } catch {
    return NextResponse.json({ error: 'catalog browse proxy failed' }, { status: 500 });
  }
}
