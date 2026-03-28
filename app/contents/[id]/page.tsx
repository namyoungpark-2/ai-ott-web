"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getThumbnailUrl } from "@/app/lib/url";
import { BASE_URL } from "@/app/constants";

// ─── Types ────────────────────────────────────────────────────────────────────

type ContentDetail = {
  id: string;
  title: string;
  originalTitle?: string | null;
  description?: string | null;
  synopsis?: string | null;
  posterUrl?: string | null;
  bannerUrl?: string | null;
  thumbnailUrl?: string | null;
  ageRating?: string | null;
  runtimeSeconds?: number | null;
  releaseDate?: string | null;
  contentType: string;
  status: string;
  categories?: string[];
  tags?: string[];
  channelHandle?: string | null;
  channelName?: string | null;
};

type FetchState = "loading" | "done" | "error" | "not-found";

// ─── Utils ────────────────────────────────────────────────────────────────────

function formatRuntime(seconds?: number | null): string {
  if (!seconds) return "";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return h > 0 ? `${h}시간 ${m}분` : `${m}분`;
}

function formatReleaseYear(dateStr?: string | null): string {
  if (!dateStr) return "";
  const year = new Date(dateStr).getFullYear();
  return isNaN(year) ? "" : String(year);
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function MetaBadge({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        display: "inline-block",
        border: "1px solid rgba(255,255,255,.2)",
        borderRadius: 6,
        padding: "2px 8px",
        fontSize: 12,
        color: "var(--muted)",
      }}
    >
      {children}
    </span>
  );
}

function ExpandableText({
  text,
  maxLength = 200,
}: {
  text: string;
  maxLength?: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const needsToggle = text.length > maxLength;
  const displayText =
    needsToggle && !expanded ? text.slice(0, maxLength) + "…" : text;

  return (
    <div>
      <p
        style={{
          color: "rgba(255,255,255,.75)",
          lineHeight: 1.65,
          margin: "0 0 8px",
          fontSize: 15,
        }}
      >
        {displayText}
      </p>
      {needsToggle && (
        <button
          onClick={() => setExpanded((v) => !v)}
          style={{
            background: "transparent",
            border: "none",
            color: "var(--accent)",
            fontSize: 13,
            padding: 0,
            cursor: "pointer",
          }}
        >
          {expanded ? "접기 ▲" : "더 보기 ▼"}
        </button>
      )}
    </div>
  );
}

function SkeletonDetail() {
  return (
    <div style={{ maxWidth: 1280, margin: "0 auto", padding: "28px 20px" }}>
      <div
        style={{
          height: 400,
          borderRadius: 20,
          background: "rgba(255,255,255,.04)",
          animation: "shimmer 1.6s ease-in-out infinite",
          marginBottom: 28,
        }}
      />
      <div style={{ display: "flex", gap: 24 }}>
        <div
          style={{
            width: 180,
            aspectRatio: "2/3",
            borderRadius: 12,
            background: "rgba(255,255,255,.06)",
            animation: "shimmer 1.6s ease-in-out infinite",
            flexShrink: 0,
          }}
        />
        <div style={{ flex: 1 }}>
          {[200, 140, 100].map((w, i) => (
            <div
              key={i}
              style={{
                height: i === 0 ? 32 : 14,
                width: w,
                borderRadius: 4,
                background: "rgba(255,255,255,.07)",
                marginBottom: 14,
                animation: "shimmer 1.6s ease-in-out infinite",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ContentDetailPage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : "";

  const [content, setContent] = useState<ContentDetail | null>(null);
  const [state, setState] = useState<FetchState>("loading");
  const [inWatchlist, setInWatchlist] = useState(false);
  const [watchlistLoading, setWatchlistLoading] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  function retry() {
    setState("loading");
    setRetryKey((k) => k + 1);
  }

  // 콘텐츠 상세 fetch
  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    fetch(`/api/contents/${id}?lang=en`, { cache: "no-store" })
      .then(async (res) => {
        if (cancelled) return;
        if (res.status === 404) { setState("not-found"); return; }
        if (!res.ok) throw new Error(`status ${res.status}`);
        const data = (await res.json()) as ContentDetail;
        setContent(data);
        setState("done");
      })
      .catch(() => {
        if (!cancelled) setState("error");
      });
    return () => { cancelled = true; };
  }, [id, retryKey]);

  // 찜 토글
  async function toggleWatchlist() {
    if (watchlistLoading || !content) return;
    setWatchlistLoading(true);
    const wasInList = inWatchlist;
    setInWatchlist(!wasInList); // optimistic
    try {
      if (wasInList) {
        const res = await fetch(`/api/me/watchlist/${content.id}`, { method: "DELETE" });
        if (!res.ok) setInWatchlist(wasInList); // rollback
      } else {
        const res = await fetch("/api/me/watchlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contentId: content.id }),
        });
        if (!res.ok) setInWatchlist(wasInList); // rollback
      }
    } catch {
      setInWatchlist(wasInList); // rollback on network error
    } finally {
      setWatchlistLoading(false);
    }
  }

  const bannerSrc = content
    ? getThumbnailUrl(content.bannerUrl ?? content.posterUrl, BASE_URL) ?? ""
    : "";
  const posterSrc = content
    ? getThumbnailUrl(content.posterUrl ?? content.thumbnailUrl, BASE_URL) ?? ""
    : "";
  const description = content?.synopsis || content?.description || "";

  // ── 로딩 ──
  if (state === "loading") return <SkeletonDetail />;

  // ── 404 ──
  if (state === "not-found") {
    return (
      <main style={{ minHeight: "100vh" }}>
        <div
          style={{ maxWidth: 1280, margin: "0 auto", padding: 40, textAlign: "center" }}
        >
          <p style={{ color: "var(--muted)", fontSize: 18, marginBottom: 16 }}>
            콘텐츠를 찾을 수 없습니다.
          </p>
          <Link href="/"><button>홈으로 돌아가기</button></Link>
        </div>
      </main>
    );
  }

  // ── 에러 ──
  if (state === "error") {
    return (
      <main style={{ minHeight: "100vh" }}>
        <div
          style={{ maxWidth: 1280, margin: "0 auto", padding: 40, textAlign: "center" }}
        >
          <p style={{ color: "var(--muted)", fontSize: 16, marginBottom: 12 }}>
            콘텐츠 정보를 불러올 수 없습니다.
          </p>
          <button onClick={retry}>다시 시도</button>
        </div>
      </main>
    );
  }

  if (!content) return null;

  return (
    <main style={{ minHeight: "100vh" }}>

      {/* 배너 */}
      {bannerSrc && (
        <div
          style={{
            position: "relative",
            height: 380,
            overflow: "hidden",
            marginBottom: -60,
          }}
        >
          <img
            src={bannerSrc}
            alt=""
            aria-hidden
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              filter: "brightness(.5)",
            }}
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = "none";
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(to bottom, rgba(11,11,15,0) 40%, rgba(11,11,15,1) 100%)",
            }}
          />
        </div>
      )}

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "28px 20px", position: "relative" }}>

        {/* 상세 영역 */}
        <div style={{ display: "flex", gap: 28, alignItems: "flex-start", flexWrap: "wrap" }}>

          {/* 포스터 */}
          {posterSrc && (
            <div
              style={{
                flexShrink: 0,
                width: 160,
                aspectRatio: "2/3",
                borderRadius: 12,
                overflow: "hidden",
                border: "1px solid var(--line)",
                boxShadow: "var(--shadow)",
              }}
            >
              <img
                src={posterSrc}
                alt={content.title}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = "none";
                }}
              />
            </div>
          )}

          {/* 메타 */}
          <div style={{ flex: 1, minWidth: 260 }}>
            <h1 style={{ fontSize: 32, margin: "0 0 6px", lineHeight: 1.1 }}>
              {content.title}
            </h1>
            {content.originalTitle && (
              <p style={{ color: "var(--muted)", fontSize: 14, margin: "0 0 12px" }}>
                {content.originalTitle}
              </p>
            )}

            {/* 메타 배지 행 */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
              {content.ageRating && <MetaBadge>{content.ageRating}</MetaBadge>}
              {formatReleaseYear(content.releaseDate) && (
                <MetaBadge>{formatReleaseYear(content.releaseDate)}</MetaBadge>
              )}
              {content.runtimeSeconds && (
                <MetaBadge>{formatRuntime(content.runtimeSeconds)}</MetaBadge>
              )}
              {content.contentType && (
                <MetaBadge>{content.contentType}</MetaBadge>
              )}
            </div>

            {/* 채널 링크 */}
            {content.channelHandle && (
              <Link
                href={`/channels/${content.channelHandle}`}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 16,
                  padding: "6px 12px",
                  borderRadius: "var(--r-sm)",
                  border: "1px solid var(--line)",
                  background: "rgba(255,255,255,.04)",
                  fontSize: 13,
                  color: "var(--text)",
                  transition: "border-color .15s, background .15s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "var(--accent)";
                  e.currentTarget.style.background = "rgba(139,92,246,.08)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--line)";
                  e.currentTarget.style.background = "rgba(255,255,255,.04)";
                }}
              >
                <span
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    background: "var(--grad-brand)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#fff",
                    flexShrink: 0,
                  }}
                >
                  {(content.channelName ?? content.channelHandle).charAt(0).toUpperCase()}
                </span>
                <span style={{ fontWeight: 600 }}>
                  {content.channelName ?? content.channelHandle}
                </span>
              </Link>
            )}

            {/* CTA */}
            <div style={{ display: "flex", gap: 10, marginBottom: 24, flexWrap: "wrap" }}>
              <Link href={`/watch/${content.id}`}>
                <button
                  style={{
                    background: "var(--accent)",
                    border: "none",
                    fontWeight: 700,
                    padding: "10px 24px",
                    color: "#fff",
                    fontSize: 15,
                  }}
                >
                  ▶ 재생
                </button>
              </Link>
              <button
                onClick={toggleWatchlist}
                disabled={watchlistLoading}
                aria-label={inWatchlist ? "찜 해제" : "찜하기"}
                style={{
                  padding: "10px 20px",
                  fontWeight: 600,
                  opacity: watchlistLoading ? 0.6 : 1,
                  background: inWatchlist ? "rgba(109,94,252,.25)" : undefined,
                  borderColor: inWatchlist ? "var(--accent)" : undefined,
                }}
              >
                {inWatchlist ? "✓ 찜됨" : "+ 찜하기"}
              </button>
            </div>

            {/* 설명 */}
            {description && <ExpandableText text={description} />}

            {/* 카테고리 */}
            {content.categories && content.categories.length > 0 && (
              <div style={{ marginTop: 20 }}>
                <p
                  style={{
                    color: "var(--muted)",
                    fontSize: 12,
                    marginBottom: 8,
                    fontWeight: 600,
                    letterSpacing: 0.8,
                    textTransform: "uppercase",
                  }}
                >
                  카테고리
                </p>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {content.categories.map((cat) => (
                    <Link
                      key={cat}
                      href={`/categories/${cat.toLowerCase()}`}
                      style={{
                        border: "1px solid var(--line)",
                        borderRadius: 8,
                        padding: "4px 12px",
                        fontSize: 13,
                        color: "var(--text)",
                        transition: "border-color .15s",
                      }}
                    >
                      {cat}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* 태그 */}
            {content.tags && content.tags.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <p
                  style={{
                    color: "var(--muted)",
                    fontSize: 12,
                    marginBottom: 8,
                    fontWeight: 600,
                    letterSpacing: 0.8,
                    textTransform: "uppercase",
                  }}
                >
                  태그
                </p>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {content.tags.map((tag) => (
                    <Link
                      key={tag}
                      href={`/search?q=${encodeURIComponent(tag)}`}
                      style={{
                        background: "rgba(255,255,255,.05)",
                        border: "1px solid var(--line)",
                        borderRadius: 20,
                        padding: "3px 10px",
                        fontSize: 12,
                        color: "var(--muted)",
                      }}
                    >
                      #{tag}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 관련 콘텐츠 — TODO(API): /api/app/contents/{id}/related 추가 후 구현 */}
        <section
          aria-label="관련 콘텐츠"
          style={{ marginTop: 48, borderTop: "1px solid var(--line)", paddingTop: 32 }}
        >
          <h2 style={{ fontSize: 20, margin: "0 0 16px" }}>관련 콘텐츠</h2>
          <p style={{ color: "var(--muted)", fontSize: 14 }}>
            백엔드 연동 후 표시됩니다.
          </p>
        </section>

      </div>
    </main>
  );
}
