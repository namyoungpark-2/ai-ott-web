"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getThumbnailUrl } from "@/app/lib/url";
import { BASE_URL } from "@/app/constants";

// ─── Types ────────────────────────────────────────────────────────────────────

type ContentItem = {
  id: string;
  title: string;
  description?: string | null;
  contentType?: string | null;
  posterUrl?: string | null;
  thumbnailUrl?: string | null;
  runtimeSeconds?: number | null;
};

type ContinueWatchingItem = {
  contentId: string;
  title?: string | null;
  posterUrl?: string | null;
  thumbnailUrl?: string | null;
  positionMs: number;
  durationMs?: number | null;
};

type FetchState = "loading" | "done" | "error";

// ─── Utils ────────────────────────────────────────────────────────────────────

function formatRuntime(seconds?: number | null): string {
  if (!seconds) return "";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return h > 0 ? `${h}시간 ${m}분` : `${m}분`;
}

function progressPercent(positionMs: number, durationMs?: number | null): number {
  if (!durationMs || durationMs <= 0) return 0;
  return Math.min(100, Math.round((positionMs / durationMs) * 100));
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ImgWithFallback({ src, alt }: { src: string; alt: string }) {
  const [failed, setFailed] = useState(false);
  if (failed || !src) {
    return (
      <div
        aria-hidden
        style={{
          width: "100%",
          height: "100%",
          background: "linear-gradient(135deg, rgba(109,94,252,.18), rgba(0,0,0,.35))",
        }}
      />
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      style={{ width: "100%", height: "100%", objectFit: "cover" }}
      onError={() => setFailed(true)}
    />
  );
}

function SkeletonCard() {
  return (
    <div
      style={{
        border: "1px solid var(--line)",
        borderRadius: 14,
        overflow: "hidden",
        background: "rgba(255,255,255,.03)",
      }}
    >
      <div
        style={{
          aspectRatio: "16 / 9",
          background: "rgba(255,255,255,.07)",
          animation: "shimmer 1.6s ease-in-out infinite",
        }}
      />
      <div style={{ padding: "11px 13px" }}>
        <div
          style={{
            height: 13,
            borderRadius: 4,
            background: "rgba(255,255,255,.07)",
            marginBottom: 8,
            animation: "shimmer 1.6s ease-in-out infinite",
          }}
        />
        <div
          style={{
            height: 11,
            width: "60%",
            borderRadius: 4,
            background: "rgba(255,255,255,.05)",
            animation: "shimmer 1.6s ease-in-out infinite",
          }}
        />
      </div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2
      style={{
        fontSize: 20,
        fontWeight: 700,
        margin: "0 0 16px",
        display: "flex",
        alignItems: "center",
        gap: 8,
      }}
    >
      {children}
    </h2>
  );
}

// ─── Continue Watching Section ────────────────────────────────────────────────

function ContinueWatchingSection() {
  const [items, setItems] = useState<ContinueWatchingItem[]>([]);
  const [state, setState] = useState<FetchState>("loading");

  useEffect(() => {
    let cancelled = false;
    fetch("/api/me/continue-watching", { cache: "no-store" })
      .then(async (res) => {
        if (cancelled) return;
        if (!res.ok) throw new Error(`status ${res.status}`);
        const data = await res.json() as { items?: ContinueWatchingItem[]; contents?: ContinueWatchingItem[] } | ContinueWatchingItem[];
        const list = Array.isArray(data)
          ? data
          : Array.isArray((data as { items?: ContinueWatchingItem[] }).items)
          ? (data as { items: ContinueWatchingItem[] }).items
          : Array.isArray((data as { contents?: ContinueWatchingItem[] }).contents)
          ? (data as { contents: ContinueWatchingItem[] }).contents
          : [];
        setItems(list);
        setState("done");
      })
      .catch(() => {
        if (!cancelled) setState("error");
      });
    return () => { cancelled = true; };
  }, []);

  if (state === "loading") {
    return (
      <section style={{ marginBottom: 48 }}>
        <SectionTitle>이어보기</SectionTitle>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            gap: 14,
          }}
        >
          {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      </section>
    );
  }

  if (state === "error" || items.length === 0) return null;

  return (
    <section style={{ marginBottom: 48 }}>
      <SectionTitle>이어보기</SectionTitle>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
          gap: 14,
        }}
      >
        {items.map((item) => {
          const thumb = getThumbnailUrl(item.thumbnailUrl ?? item.posterUrl, BASE_URL) ?? "";
          const pct = progressPercent(item.positionMs, item.durationMs);
          return (
            <Link
              key={item.contentId}
              href={`/watch/${item.contentId}`}
              className="content-card"
            >
              <div style={{ position: "relative", aspectRatio: "16 / 9", background: "#111" }}>
                <ImgWithFallback src={thumb} alt={item.title ?? ""} />
                {/* 진행률 바 */}
                {pct > 0 && (
                  <div
                    style={{
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: 3,
                      background: "rgba(255,255,255,.15)",
                    }}
                  >
                    <div
                      style={{
                        width: `${pct}%`,
                        height: "100%",
                        background: "var(--accent)",
                      }}
                    />
                  </div>
                )}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    display: "grid",
                    placeItems: "center",
                    pointerEvents: "none",
                  }}
                >
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      background: "rgba(0,0,0,.55)",
                      border: "2px solid rgba(255,255,255,.6)",
                      display: "grid",
                      placeItems: "center",
                      fontSize: 14,
                    }}
                  >
                    ▶
                  </div>
                </div>
              </div>
              <div style={{ padding: "10px 13px" }}>
                <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 3, lineHeight: 1.35 }}>
                  {item.title ?? "알 수 없는 콘텐츠"}
                </div>
                {pct > 0 && (
                  <div style={{ color: "var(--muted)", fontSize: 11 }}>
                    {pct}% 시청
                  </div>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

// ─── Watchlist Section ────────────────────────────────────────────────────────

function WatchlistSection() {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [state, setState] = useState<FetchState>("loading");
  const [removing, setRemoving] = useState<Set<string>>(new Set());

  useEffect(() => {
    let cancelled = false;
    fetch("/api/me/watchlist", { cache: "no-store" })
      .then(async (res) => {
        if (cancelled) return;
        if (!res.ok) throw new Error(`status ${res.status}`);
        const data = await res.json() as { items?: ContentItem[]; contents?: ContentItem[] } | ContentItem[];
        const list = Array.isArray(data)
          ? data
          : Array.isArray((data as { items?: ContentItem[] }).items)
          ? (data as { items: ContentItem[] }).items
          : Array.isArray((data as { contents?: ContentItem[] }).contents)
          ? (data as { contents: ContentItem[] }).contents
          : [];
        setItems(list);
        setState("done");
      })
      .catch(() => {
        if (!cancelled) setState("error");
      });
    return () => { cancelled = true; };
  }, []);

  async function removeItem(id: string) {
    // optimistic remove
    setRemoving((prev) => new Set([...prev, id]));
    setItems((prev) => prev.filter((x) => x.id !== id));
    try {
      const res = await fetch(`/api/me/watchlist/${id}`, { method: "DELETE" });
      if (!res.ok) {
        // rollback: re-fetch or add back is complex — for now just restore key
        setRemoving((prev) => { const next = new Set(prev); next.delete(id); return next; });
      }
    } catch {
      setRemoving((prev) => { const next = new Set(prev); next.delete(id); return next; });
    }
  }

  if (state === "loading") {
    return (
      <section>
        <SectionTitle>내 목록</SectionTitle>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))",
            gap: 14,
          }}
        >
          {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      </section>
    );
  }

  if (state === "error") {
    return (
      <section>
        <SectionTitle>내 목록</SectionTitle>
        <p style={{ color: "var(--muted)", fontSize: 14 }}>
          목록을 불러올 수 없습니다. 잠시 후 다시 시도해 주세요.
        </p>
      </section>
    );
  }

  if (items.length === 0) {
    return (
      <section>
        <SectionTitle>내 목록</SectionTitle>
        <div style={{ padding: "48px 0", textAlign: "center", color: "var(--muted)" }}>
          <p style={{ fontSize: 15, marginBottom: 8 }}>찜한 콘텐츠가 없습니다.</p>
          <p style={{ fontSize: 13, marginBottom: 20 }}>
            콘텐츠 상세 페이지에서 &ldquo;+ 찜하기&rdquo; 버튼을 눌러 추가하세요.
          </p>
          <Link href="/">
            <button>홈으로 돌아가기</button>
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section>
      <SectionTitle>내 목록 <span style={{ color: "var(--muted)", fontSize: 14, fontWeight: 400 }}>{items.length}개</span></SectionTitle>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))",
          gap: 14,
        }}
      >
        {items.map((item) => {
          const thumb = getThumbnailUrl(item.posterUrl ?? item.thumbnailUrl, BASE_URL) ?? "";
          const isRemoving = removing.has(item.id);
          return (
            <div
              key={item.id}
              style={{
                position: "relative",
                opacity: isRemoving ? 0.4 : 1,
                transition: "opacity .2s",
              }}
            >
              <Link href={`/contents/${item.id}`} className="content-card">
                <div style={{ aspectRatio: "16 / 9", background: "#111" }}>
                  <ImgWithFallback src={thumb} alt={item.title} />
                </div>
                <div style={{ padding: "11px 13px" }}>
                  <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4, lineHeight: 1.35 }}>
                    {item.title}
                  </div>
                  <div style={{ color: "var(--muted)", fontSize: 12, minHeight: 16 }}>
                    {item.description?.slice(0, 55) || item.contentType || ""}
                  </div>
                  {item.runtimeSeconds && (
                    <div style={{ marginTop: 6, fontSize: 11, color: "rgba(255,255,255,.38)" }}>
                      {formatRuntime(item.runtimeSeconds)}
                    </div>
                  )}
                </div>
              </Link>
              {/* 찜 해제 버튼 */}
              <button
                onClick={(e) => { e.preventDefault(); removeItem(item.id); }}
                disabled={isRemoving}
                aria-label={`${item.title} 찜 해제`}
                title="찜 해제"
                style={{
                  position: "absolute",
                  top: 8,
                  right: 8,
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  background: "rgba(0,0,0,.65)",
                  border: "1px solid rgba(255,255,255,.18)",
                  color: "rgba(255,255,255,.8)",
                  fontSize: 14,
                  display: "grid",
                  placeItems: "center",
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                ✕
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MyListPage() {
  return (
    <main style={{ minHeight: "100vh" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "28px 20px" }}>
        <h1 style={{ fontSize: 32, margin: "0 0 32px", fontWeight: 800 }}>내 목록</h1>
        <ContinueWatchingSection />
        <WatchlistSection />
      </div>
    </main>
  );
}
