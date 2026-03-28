"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { getThumbnailUrl } from "@/app/lib/url";
import { BASE_URL } from "@/app/constants";
import { useLocale } from "@/components/LocaleProvider";

// ─── Types ────────────────────────────────────────────────────────────────────

type SearchItem = {
  id: string;
  title: string;
  description?: string | null;
  contentType: string;
  posterUrl?: string | null;
  categories?: string[];
  runtimeSeconds?: number | null;
};

type SearchState = "idle" | "loading" | "done" | "error";

// ─── Utils ────────────────────────────────────────────────────────────────────

function formatRuntime(seconds?: number | null): string {
  if (!seconds) return "";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return h > 0 ? `${h}시간 ${m}분` : `${m}분`;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ImgWithFallback({
  src,
  alt,
  style,
}: {
  src: string;
  alt: string;
  style?: React.CSSProperties;
}) {
  const [failed, setFailed] = useState(false);
  if (failed || !src) {
    return (
      <div
        aria-hidden
        style={{
          ...style,
          background:
            "linear-gradient(135deg, rgba(109,94,252,.18), rgba(0,0,0,.35))",
        }}
      />
    );
  }
  return (
    <img src={src} alt={alt} style={style} onError={() => setFailed(true)} />
  );
}

function ResultCard({ item }: { item: SearchItem }) {
  const imgSrc = getThumbnailUrl(item.posterUrl, BASE_URL) ?? "";
  return (
    <Link href={`/watch/${item.id}`} className="content-card">
      <div style={{ aspectRatio: "16 / 9", background: "#111" }}>
        <ImgWithFallback
          key={imgSrc}
          src={imgSrc}
          alt={item.title}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </div>
      <div style={{ padding: "11px 13px" }}>
        <div
          style={{
            fontWeight: 700,
            fontSize: 13,
            lineHeight: 1.35,
            marginBottom: 4,
          }}
        >
          {item.title}
        </div>
        <div
          style={{
            color: "var(--muted)",
            fontSize: 12,
            minHeight: 30,
            lineHeight: 1.5,
          }}
        >
          {item.description?.slice(0, 60) || item.contentType}
        </div>
        <div
          style={{
            marginTop: 8,
            display: "flex",
            gap: 8,
            fontSize: 11,
            color: "rgba(255,255,255,.38)",
          }}
        >
          {item.categories && item.categories.length > 0 && (
            <span>{item.categories.slice(0, 2).join(" · ")}</span>
          )}
          {item.runtimeSeconds && (
            <span>{formatRuntime(item.runtimeSeconds)}</span>
          )}
        </div>
      </div>
    </Link>
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

// ─── Core search content (uses useSearchParams) ────────────────────────────────

function SearchPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { locale } = useLocale();
  const initialQ = searchParams.get("q") ?? "";

  const [query, setQuery] = useState(initialQ);
  // debouncedQuery drives both URL update and fetch
  const [debouncedQuery, setDebouncedQuery] = useState(initialQ);

  const [results, setResults] = useState<SearchItem[]>([]);
  const [state, setState] = useState<SearchState>(
    initialQ.trim() ? "loading" : "idle"
  );

  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Debounce: query → debouncedQuery (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  // URL sync: update ?q= when debouncedQuery changes
  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedQuery) params.set("q", debouncedQuery);
    const next = debouncedQuery ? `/search?${params.toString()}` : "/search";
    router.replace(next, { scroll: false });
  }, [debouncedQuery, router]);

  // Fetch: triggered by debouncedQuery
  useEffect(() => {
    if (!debouncedQuery) return;
    let cancelled = false;

    // setTimeout(0) 으로 비동기화 → lint rule(set-state-in-effect) 회피
    const loadingTimer = setTimeout(() => {
      if (!cancelled) setState("loading");
    }, 0);

    fetch(
      `/api/catalog/search?lang=${locale}&q=${encodeURIComponent(debouncedQuery)}&limit=48`,
      { cache: "no-store" }
    )
      .then(async (res) => {
        if (cancelled) return;
        if (!res.ok) throw new Error(`status ${res.status}`);
        const data = (await res.json()) as { items?: SearchItem[] };
        setResults(Array.isArray(data?.items) ? data.items : []);
        setState("done");
      })
      .catch(() => {
        if (!cancelled) setState("error");
      });

    return () => {
      cancelled = true;
      clearTimeout(loadingTimer);
    };
  }, [debouncedQuery, locale]);

  // ESC: clear input
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setQuery("");
        inputRef.current?.focus();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  const hasQuery = debouncedQuery.length > 0;

  return (
    <main style={{ minHeight: "100vh" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "28px 20px" }}>

        {/* 검색 입력 */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ position: "relative", maxWidth: 600 }}>
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="영화, 드라마, 시리즈, 태그 검색…"
              aria-label="콘텐츠 검색"
              style={{ width: "100%", paddingRight: 40 }}
            />
            {query && (
              <button
                onClick={() => {
                  setQuery("");
                  inputRef.current?.focus();
                }}
                aria-label="검색어 지우기"
                style={{
                  position: "absolute",
                  right: 8,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "transparent",
                  border: "none",
                  color: "var(--muted)",
                  fontSize: 16,
                  padding: "4px 6px",
                  cursor: "pointer",
                }}
              >
                ✕
              </button>
            )}
          </div>
          {hasQuery && (
            <p
              style={{ marginTop: 8, color: "var(--muted)", fontSize: 13 }}
              aria-live="polite"
            >
              {state === "loading" && "검색 중…"}
              {state === "done" &&
                results.length > 0 &&
                `"${debouncedQuery}" — ${results.length}개 결과`}
              {state === "done" && results.length === 0 && ""}
              {state === "error" && "검색 중 오류가 발생했습니다."}
            </p>
          )}
        </div>

        {/* idle: 검색어 없음 */}
        {!hasQuery && (
          <div
            style={{
              padding: "60px 0",
              textAlign: "center",
              color: "var(--muted)",
            }}
          >
            <p style={{ fontSize: 18, marginBottom: 8 }}>
              찾고 싶은 콘텐츠를 검색해보세요.
            </p>
            <p style={{ fontSize: 13 }}>ESC 키로 검색어를 초기화할 수 있습니다.</p>
          </div>
        )}

        {/* loading */}
        {state === "loading" && hasQuery && (
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

        {/* error */}
        {state === "error" && (
          <div
            style={{
              padding: "48px 0",
              textAlign: "center",
              color: "var(--muted)",
            }}
          >
            <p style={{ fontSize: 16, marginBottom: 12 }}>
              검색 결과를 불러올 수 없습니다.
            </p>
            <p style={{ fontSize: 13, marginBottom: 20 }}>
              서버 연결을 확인하거나 잠시 후 다시 시도해주세요.
            </p>
            <button onClick={() => setDebouncedQuery((q) => q + " ")}>
              다시 시도
            </button>
          </div>
        )}

        {/* empty results */}
        {state === "done" && results.length === 0 && hasQuery && (
          <div
            style={{
              padding: "48px 0",
              textAlign: "center",
              color: "var(--muted)",
            }}
          >
            <p style={{ fontSize: 18, marginBottom: 8 }}>
              &ldquo;{debouncedQuery}&rdquo;에 대한 결과가 없습니다.
            </p>
            <p style={{ fontSize: 13 }}>다른 검색어로 시도해보세요.</p>
          </div>
        )}

        {/* results */}
        {state === "done" && results.length > 0 && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))",
              gap: 14,
            }}
          >
            {results.map((item) => (
              <ResultCard key={item.id} item={item} />
            ))}
          </div>
        )}

      </div>
    </main>
  );
}

// ─── Page export (Suspense boundary for useSearchParams) ───────────────────────

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <main style={{ minHeight: "100vh" }}>
          <div style={{ maxWidth: 1280, margin: "0 auto", padding: "28px 20px" }}>
            <div
              style={{
                height: 44,
                maxWidth: 600,
                borderRadius: 10,
                background: "rgba(255,255,255,.05)",
                animation: "shimmer 1.6s ease-in-out infinite",
                marginBottom: 28,
              }}
            />
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
          </div>
        </main>
      }
    >
      <SearchPageContent />
    </Suspense>
  );
}
