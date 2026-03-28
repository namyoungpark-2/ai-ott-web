"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getThumbnailUrl } from "@/app/lib/url";
import { BASE_URL } from "@/app/constants";
import { useLocale } from "@/components/LocaleProvider";

// ─── Types ────────────────────────────────────────────────────────────────────

type ContentItem = {
  id: string;
  title: string;
  description?: string | null;
  contentType: string;
  posterUrl?: string | null;
  runtimeSeconds?: number | null;
  categories?: string[];
  tags?: string[];
};

// TODO(API): 백엔드가 sort 파라미터를 지원하면 교체
type SortOption = "latest" | "title" | "runtime";

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "latest", label: "최신순" },
  { value: "title", label: "제목순" },
  { value: "runtime", label: "러닝타임순" },
];

const CATEGORY_META: Record<string, { label: string; description: string }> = {
  movie: { label: "영화", description: "다양한 장르의 영화를 감상하세요." },
  drama: { label: "드라마", description: "인기 드라마 시리즈를 모두 만나보세요." },
  variety: { label: "예능", description: "웃음과 감동이 있는 예능 프로그램." },
  animation: { label: "애니메이션", description: "국내외 애니메이션 작품 모음." },
};

const PAGE_SIZE = 24;

type FetchState = "loading" | "done" | "error";

// ─── Utils ────────────────────────────────────────────────────────────────────

function formatRuntime(seconds?: number | null): string {
  if (!seconds) return "";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return h > 0 ? `${h}시간 ${m}분` : `${m}분`;
}

function sortItems(items: ContentItem[], sort: SortOption): ContentItem[] {
  // TODO(API): 서버 정렬이 추가되면 이 클라이언트 정렬 제거
  return [...items].sort((a, b) => {
    if (sort === "title") return a.title.localeCompare(b.title, "ko");
    if (sort === "runtime")
      return (b.runtimeSeconds ?? 0) - (a.runtimeSeconds ?? 0);
    return 0; // "latest": 서버 순서 유지
  });
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
          background:
            "linear-gradient(135deg, rgba(109,94,252,.18), rgba(0,0,0,.35))",
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

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CategoryPage() {
  const params = useParams();
  const slug = typeof params.slug === "string" ? params.slug : "";
  const { locale } = useLocale();
  const meta = CATEGORY_META[slug];

  // 잘못된 slug → Next.js 404
  if (!meta) notFound();

  const [items, setItems] = useState<ContentItem[]>([]);
  const [state, setState] = useState<FetchState>("loading");
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  // TODO(API): 서버 정렬 파라미터 추가 시 sort를 fetch에 전달
  const [sort, setSort] = useState<SortOption>("latest");

  function retry() {
    setState("loading");
    setItems([]);
    setPage(0);
    setHasMore(true);
    setRetryKey((k) => k + 1);
  }

  // 초기 fetch
  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    fetch(
      `/api/categories/${encodeURIComponent(slug)}?lang=${locale}&page=0&size=${PAGE_SIZE}`,
      { cache: "no-store" }
    )
      .then(async (res) => {
        if (cancelled) return;
        if (!res.ok) throw new Error(`status ${res.status}`);
        const data = (await res.json()) as {
          contents?: ContentItem[];
          items?: ContentItem[];
          hasNext?: boolean;
        };
        const list = Array.isArray(data?.contents)
          ? data.contents
          : Array.isArray(data?.items)
          ? data.items
          : [];
        setItems(list);
        // TODO(API): hasNext 필드가 있으면 교체
        setHasMore(list.length === PAGE_SIZE);
        setState("done");
      })
      .catch(() => {
        if (!cancelled) setState("error");
      });
    return () => {
      cancelled = true;
    };
  }, [slug, retryKey, locale]);

  // 더 보기 fetch
  async function loadMore() {
    const nextPage = page + 1;
    setLoadingMore(true);
    try {
      const res = await fetch(
        `/api/categories/${encodeURIComponent(slug)}?lang=${locale}&page=${nextPage}&size=${PAGE_SIZE}`,
        { cache: "no-store" }
      );
      if (!res.ok) throw new Error(`status ${res.status}`);
      const data = (await res.json()) as {
        contents?: ContentItem[];
        items?: ContentItem[];
        hasNext?: boolean;
      };
      const newItems = Array.isArray(data?.contents)
        ? data.contents
        : Array.isArray(data?.items)
        ? data.items
        : [];
      setItems((prev) => [...prev, ...newItems]);
      setPage(nextPage);
      setHasMore(newItems.length === PAGE_SIZE);
    } catch {
      // load more 실패는 조용히 처리 (기존 아이템 유지)
    } finally {
      setLoadingMore(false);
    }
  }

  const sortedItems = sortItems(items, sort);

  return (
    <main style={{ minHeight: "100vh" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "28px 20px" }}>

        {/* 헤더 */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 16,
            marginBottom: 24,
          }}
        >
          <div>
            <h1 style={{ fontSize: 32, margin: "0 0 6px" }}>{meta.label}</h1>
            <p style={{ color: "var(--muted)", margin: 0, fontSize: 14 }}>
              {meta.description}
            </p>
          </div>

          {/* 정렬 선택 — TODO(API): 서버 정렬 파라미터 연동 후 클라이언트 정렬 제거 */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <label
              htmlFor="sort-select"
              style={{ color: "var(--muted)", fontSize: 13 }}
            >
              정렬
            </label>
            <select
              id="sort-select"
              value={sort}
              onChange={(e) => setSort(e.target.value as SortOption)}
              style={{
                border: "1px solid var(--line)",
                background: "rgba(255,255,255,.06)",
                color: "var(--text)",
                borderRadius: 8,
                padding: "6px 10px",
                fontSize: 13,
                cursor: "pointer",
              }}
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 로딩 */}
        {state === "loading" && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))",
              gap: 14,
            }}
          >
            {Array.from({ length: 12 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {/* 에러 */}
        {state === "error" && (
          <div
            style={{ padding: "60px 0", textAlign: "center", color: "var(--muted)" }}
          >
            <p style={{ fontSize: 16, marginBottom: 12 }}>
              콘텐츠를 불러올 수 없습니다.
            </p>
            <p style={{ fontSize: 13, marginBottom: 20 }}>
              서버 연결을 확인하거나 잠시 후 다시 시도해 주세요.
            </p>
            <button onClick={retry}>다시 시도</button>
          </div>
        )}

        {/* 빈 상태 */}
        {state === "done" && items.length === 0 && (
          <div
            style={{ padding: "60px 0", textAlign: "center", color: "var(--muted)" }}
          >
            <p style={{ fontSize: 16, marginBottom: 16 }}>
              아직 등록된 콘텐츠가 없습니다.
            </p>
            <Link href="/">
              <button>홈으로 돌아가기</button>
            </Link>
          </div>
        )}

        {/* 콘텐츠 그리드 */}
        {state === "done" && sortedItems.length > 0 && (
          <>
            <p style={{ color: "var(--muted)", fontSize: 13, marginBottom: 16 }}>
              {items.length}개 콘텐츠
            </p>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))",
                gap: 14,
              }}
            >
              {sortedItems.map((item) => (
                <Link
                  key={item.id}
                  href={`/contents/${item.id}`}
                  className="content-card"
                >
                  <div style={{ aspectRatio: "16 / 9", background: "#111" }}>
                    <ImgWithFallback
                      key={getThumbnailUrl(item.posterUrl, BASE_URL) ?? ""}
                      src={getThumbnailUrl(item.posterUrl, BASE_URL) ?? ""}
                      alt={item.title}
                    />
                  </div>
                  <div style={{ padding: "11px 13px" }}>
                    <div
                      style={{ fontWeight: 700, fontSize: 13, marginBottom: 4, lineHeight: 1.35 }}
                    >
                      {item.title}
                    </div>
                    <div
                      style={{ color: "var(--muted)", fontSize: 12, minHeight: 30, lineHeight: 1.5 }}
                    >
                      {item.description?.slice(0, 60) || item.contentType}
                    </div>
                    <div
                      style={{
                        marginTop: 8,
                        fontSize: 11,
                        color: "rgba(255,255,255,.38)",
                        display: "flex",
                        gap: 8,
                      }}
                    >
                      {item.runtimeSeconds && (
                        <span>{formatRuntime(item.runtimeSeconds)}</span>
                      )}
                      {item.tags && item.tags.length > 0 && (
                        <span>{item.tags.slice(0, 2).join(" · ")}</span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* 더 보기 */}
            {hasMore && (
              <div
                style={{ marginTop: 32, textAlign: "center" }}
              >
                <button onClick={loadMore} disabled={loadingMore}>
                  {loadingMore ? "불러오는 중…" : "더 보기"}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
