"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getThumbnailUrl } from "./lib/url";
import { BASE_URL } from "./constants";

type CatalogItem = {
  id: string;
  title: string;
  description?: string | null;
  contentType: string;
  status: string;
  posterUrl?: string | null;
  bannerUrl?: string | null;
  runtimeSeconds?: number | null;
  releaseAt?: string | null;
  seriesId?: string | null;
  seasonId?: string | null;
  episodeNumber?: number | null;
  categories?: string[];
  tags?: string[];
};

type CatalogSection = { key: string; title: string; items: CatalogItem[] };

export default function Home() {
  const [sections, setSections] = useState<CatalogSection[]>([]);
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<CatalogItem[]>([]);

  async function loadBrowse() {
    const res = await fetch('/api/catalog/browse?lang=en&sectionLimit=12', { cache: 'no-store' });
    const data = await res.json();
    setSections(Array.isArray(data?.sections) ? data.sections : []);
  }

  useEffect(() => { loadBrowse().catch(console.error); }, []);

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setSearching(false);
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      const res = await fetch(`/api/catalog/search?lang=en&q=${encodeURIComponent(trimmed)}&limit=24`, { cache: 'no-store' });
      const data = await res.json();
      setSearching(true);
      setSearchResults(Array.isArray(data?.items) ? data.items : []);
    }, 250);
    return () => clearTimeout(timer);
  }, [query]);

  const hero = useMemo(() => (searching ? searchResults[0] : sections[0]?.items?.[0]) ?? null, [sections, searchResults, searching]);
  const visibleSections = searching ? [{ key: 'search', title: `Search results`, items: searchResults }] : sections;

  return (
    <main style={{ minHeight: '100vh' }}>
      <header style={{ position: 'sticky', top: 0, zIndex: 20, backdropFilter: 'blur(16px)', background: 'rgba(11,11,15,.65)', borderBottom: '1px solid var(--line)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: 16, display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{ fontWeight: 900, letterSpacing: .5, fontSize: 22 }}><span style={{ color: 'var(--accent)' }}>AI</span> OTT</div>
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="영화, 시리즈, 태그 검색" style={{ flex: 1, minWidth: 180 }} />
          <Link href="/upload"><button>Upload</button></Link>
          <Link href="/admin"><button>Admin</button></Link>
        </div>
      </header>

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: 20 }}>
        <section style={{ position: 'relative', minHeight: 420, borderRadius: 24, overflow: 'hidden', border: '1px solid var(--line)', background: 'var(--panel)', boxShadow: 'var(--shadow)' }}>
          {hero?.bannerUrl || hero?.posterUrl ? (
            <img src={getThumbnailUrl(hero.bannerUrl || hero.posterUrl, BASE_URL) || ''} alt={hero.title} style={{ width: '100%', height: 420, objectFit: 'cover' }} />
          ) : <div style={{ height: 420, background: 'linear-gradient(135deg, rgba(109,94,252,.35), rgba(0,0,0,.2))' }} />}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(11,11,15,.95) 0%, rgba(11,11,15,.6) 45%, rgba(11,11,15,.15) 100%)' }} />
          <div style={{ position: 'absolute', left: 28, bottom: 28, maxWidth: 520 }}>
            <div style={{ color: 'var(--muted)', fontSize: 13 }}>{hero?.categories?.join(' · ') || 'Featured'}</div>
            <h1 style={{ fontSize: 42, margin: '8px 0 12px', lineHeight: 1.05 }}>{hero?.title || '콘텐츠를 불러오는 중...'}</h1>
            <p style={{ color: 'rgba(255,255,255,.78)', lineHeight: 1.5 }}>{hero?.description || '카테고리·검색·목록형 탐색이 가능한 OTT 홈으로 확장된 버전입니다.'}</p>
            {hero && <div style={{ marginTop: 16, display: 'flex', gap: 10 }}><Link href={`/watch/${hero.id}`}><button>재생</button></Link></div>}
          </div>
        </section>

        <div style={{ display: 'grid', gap: 28, marginTop: 28 }}>
          {visibleSections.map((section) => (
            <section key={section.key}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <h2 style={{ margin: 0, fontSize: 24 }}>{section.title}</h2>
                <span style={{ color: 'var(--muted)', fontSize: 13 }}>{section.items.length} items</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: 16 }}>
                {section.items.map((item) => (
                  <Link key={item.id} href={`/watch/${item.id}`} style={{ border: '1px solid var(--line)', borderRadius: 18, overflow: 'hidden', background: 'rgba(255,255,255,.03)' }}>
                    <div style={{ aspectRatio: '16 / 9', background: '#111' }}>
                      {item.posterUrl ? <img src={getThumbnailUrl(item.posterUrl, BASE_URL) || ''} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : null}
                    </div>
                    <div style={{ padding: 14 }}>
                      <div style={{ fontWeight: 700, marginBottom: 6 }}>{item.title}</div>
                      <div style={{ color: 'var(--muted)', fontSize: 13, minHeight: 36 }}>{item.description?.slice(0, 64) || item.contentType}</div>
                      <div style={{ marginTop: 10, fontSize: 12, color: 'rgba(255,255,255,.7)' }}>{item.categories?.join(' · ')}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
