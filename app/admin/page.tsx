"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BASE_URL } from "../constants";

type Category = { id: string; slug: string; label: string; description?: string | null; sortOrder: number; active: boolean };
type ContentSummary = { id: string; title: string; status: string };

export default function AdminPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [contents, setContents] = useState<ContentSummary[]>([]);
  const [form, setForm] = useState({ slug: '', label: '', description: '', sortOrder: 0 });
  const [selectedContentId, setSelectedContentId] = useState('');
  const [meta, setMeta] = useState({ title: '', description: '', releaseAt: '', runtimeSeconds: 0, posterUrl: '', bannerUrl: '', ageRating: '15', featured: false, status: 'PUBLISHED', categorySlugs: '' });

  async function load() {
    const [categoryRes, contentRes] = await Promise.all([
      fetch(`${BASE_URL}/api/admin/categories`, { cache: 'no-store' }),
      fetch(`${BASE_URL}/api/admin/contents?lang=en&limit=50`, { cache: 'no-store' }),
    ]);
    setCategories(await categoryRes.json().catch(() => []));
    setContents(await contentRes.json().catch(() => []));
  }

  useEffect(() => { load().catch(console.error); }, []);

  async function createCategory() {
    await fetch(`${BASE_URL}/api/admin/categories`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, active: true }),
    });
    setForm({ slug: '', label: '', description: '', sortOrder: 0 });
    load();
  }

  async function saveContent() {
    if (!selectedContentId) return;
    await fetch(`${BASE_URL}/api/admin/contents/${selectedContentId}/metadata`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        lang: 'en', title: meta.title, description: meta.description,
        releaseAt: meta.releaseAt || null, runtimeSeconds: Number(meta.runtimeSeconds) || null,
        posterUrl: meta.posterUrl || null, bannerUrl: meta.bannerUrl || null,
        ageRating: meta.ageRating, featured: meta.featured, status: meta.status,
      }),
    });
    await fetch(`${BASE_URL}/api/admin/contents/${selectedContentId}/taxonomy`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ categorySlugs: meta.categorySlugs.split(',').map(v => v.trim()).filter(Boolean), tags: [] }),
    });
    alert('저장되었습니다.');
  }

  return (
    <main style={{ maxWidth: 1100, margin: '0 auto', padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Admin Console</h1>
        <Link href="/"><button>홈으로</button></Link>
      </div>

      <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div style={{ border: '1px solid var(--line)', borderRadius: 18, padding: 18 }}>
          <h2>카테고리 생성</h2>
          <div style={{ display: 'grid', gap: 10 }}>
            <input placeholder="slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
            <input placeholder="label" value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} />
            <input placeholder="description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <input placeholder="sort order" type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })} />
            <button onClick={createCategory}>카테고리 저장</button>
          </div>
          <div style={{ marginTop: 16, display: 'grid', gap: 8 }}>
            {categories.map((category) => <div key={category.id} style={{ padding: 12, borderRadius: 12, background: 'rgba(255,255,255,.04)' }}>{category.label} <span style={{ color: 'var(--muted)' }}>({category.slug})</span></div>)}
          </div>
        </div>

        <div style={{ border: '1px solid var(--line)', borderRadius: 18, padding: 18 }}>
          <h2>콘텐츠 메타데이터 편집</h2>
          <div style={{ display: 'grid', gap: 10 }}>
            <select value={selectedContentId} onChange={(e) => setSelectedContentId(e.target.value)}>
              <option value="">콘텐츠 선택</option>
              {contents.map((content) => <option key={content.id} value={content.id}>{content.title} ({content.status})</option>)}
            </select>
            <input placeholder="title" value={meta.title} onChange={(e) => setMeta({ ...meta, title: e.target.value })} />
            <input placeholder="description" value={meta.description} onChange={(e) => setMeta({ ...meta, description: e.target.value })} />
            <input placeholder="releaseAt (2026-03-11T12:00:00+09:00)" value={meta.releaseAt} onChange={(e) => setMeta({ ...meta, releaseAt: e.target.value })} />
            <input placeholder="runtime seconds" type="number" value={meta.runtimeSeconds} onChange={(e) => setMeta({ ...meta, runtimeSeconds: Number(e.target.value) })} />
            <input placeholder="poster url" value={meta.posterUrl} onChange={(e) => setMeta({ ...meta, posterUrl: e.target.value })} />
            <input placeholder="banner url" value={meta.bannerUrl} onChange={(e) => setMeta({ ...meta, bannerUrl: e.target.value })} />
            <input placeholder="category slugs (comma separated)" value={meta.categorySlugs} onChange={(e) => setMeta({ ...meta, categorySlugs: e.target.value })} />
            <label><input type="checkbox" checked={meta.featured} onChange={(e) => setMeta({ ...meta, featured: e.target.checked })} /> featured</label>
            <button onClick={saveContent}>메타데이터 저장</button>
          </div>
        </div>
      </section>
    </main>
  );
}
