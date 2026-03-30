"use client";

import Link from "next/link";
import { useEffect, useState, useCallback, useRef } from "react";
import type { Channel } from "@/types/channel";
import { useLocale } from "@/components/LocaleProvider";

const SEARCH_DEBOUNCE_MS = 350;

// ─── Constants ───────────────────────────────────────────────────────────────

const PAGE_LIMIT = 24;
type FetchState = "loading" | "done" | "error";

// ─── Sub-components ──────────────────────────────────────────────────────────

function ProfileFallback({ name }: { name: string }) {
  const letter = name.charAt(0).toUpperCase() || "?";
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        borderRadius: "50%",
        background: "var(--grad-brand)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 20,
        fontWeight: 700,
        color: "#fff",
      }}
    >
      {letter}
    </div>
  );
}

function OfficialBadge() {
  return (
    <span
      title="공식 스튜디오"
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 16,
        height: 16,
        borderRadius: "50%",
        background: "var(--accent)",
        color: "#fff",
        fontSize: 10,
        fontWeight: 700,
        marginLeft: 5,
        flexShrink: 0,
      }}
    >
      ✓
    </span>
  );
}

function ImgWithFallback({
  src,
  alt,
  name,
}: {
  src: string;
  alt: string;
  name: string;
}) {
  const [failed, setFailed] = useState(false);
  if (failed || !src) {
    return <ProfileFallback name={name} />;
  }
  return (
    <img
      src={src}
      alt={alt}
      style={{
        width: "100%",
        height: "100%",
        objectFit: "cover",
        borderRadius: "50%",
      }}
      onError={() => setFailed(true)}
    />
  );
}

function formatSubscribers(count: number): string {
  return count.toLocaleString("ko-KR");
}

function ChannelCard({ channel }: { channel: Channel }) {
  return (
    <Link
      href={`/studios/${channel.handle}`}
      style={{ textDecoration: "none", color: "inherit" }}
    >
      <div
        style={{
          background: "var(--panel)",
          border: "1px solid var(--line)",
          borderRadius: "var(--r)",
          padding: 20,
          transition:
            "border-color .2s, transform .2s, box-shadow .2s",
          cursor: "pointer",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = "var(--accent)";
          e.currentTarget.style.transform = "translateY(-3px)";
          e.currentTarget.style.boxShadow =
            "0 8px 24px rgba(0,0,0,.3)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "var(--line)";
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "none";
        }}
      >
        {/* Profile image */}
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            overflow: "hidden",
            marginBottom: 14,
            background: "var(--panel)",
            flexShrink: 0,
          }}
        >
          {channel.profileImageUrl ? (
            <ImgWithFallback
              src={channel.profileImageUrl}
              alt={channel.name}
              name={channel.name}
            />
          ) : (
            <ProfileFallback name={channel.name} />
          )}
        </div>

        {/* Name + official badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: 4,
          }}
        >
          <span
            style={{
              fontWeight: 700,
              fontSize: 15,
              lineHeight: 1.3,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {channel.name}
          </span>
          {channel.isOfficial && <OfficialBadge />}
        </div>

        {/* Handle */}
        <div
          style={{
            fontSize: 13,
            color: "var(--muted)",
            marginBottom: 6,
          }}
        >
          @{channel.handle}
        </div>

        {/* Subscriber count */}
        <div
          style={{
            fontSize: 12,
            color: "var(--muted2)",
            marginBottom: 10,
          }}
          aria-label={`구독자 ${formatSubscribers(channel.subscriberCount)}명`}
        >
          구독자 {formatSubscribers(channel.subscriberCount)}명
        </div>

        {/* Description */}
        {channel.description && (
          <p
            style={{
              margin: 0,
              fontSize: 13,
              color: "var(--muted)",
              lineHeight: 1.5,
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
            }}
          >
            {channel.description.length > 80
              ? channel.description.slice(0, 80) + "..."
              : channel.description}
          </p>
        )}
      </div>
    </Link>
  );
}

function SkeletonCard() {
  return (
    <div
      style={{
        background: "rgba(255,255,255,.03)",
        border: "1px solid var(--line)",
        borderRadius: "var(--r)",
        padding: 20,
      }}
    >
      {/* Profile circle */}
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: "50%",
          background: "rgba(255,255,255,.07)",
          marginBottom: 14,
          animation: "shimmer 1.6s ease-in-out infinite",
        }}
      />
      {/* Name line */}
      <div
        style={{
          height: 15,
          width: "65%",
          borderRadius: 4,
          background: "rgba(255,255,255,.07)",
          marginBottom: 8,
          animation: "shimmer 1.6s ease-in-out infinite",
        }}
      />
      {/* Handle line */}
      <div
        style={{
          height: 13,
          width: "45%",
          borderRadius: 4,
          background: "rgba(255,255,255,.05)",
          marginBottom: 8,
          animation: "shimmer 1.6s ease-in-out infinite",
        }}
      />
      {/* Subscriber line */}
      <div
        style={{
          height: 12,
          width: "35%",
          borderRadius: 4,
          background: "rgba(255,255,255,.05)",
          marginBottom: 12,
          animation: "shimmer 1.6s ease-in-out infinite",
        }}
      />
      {/* Description lines */}
      <div
        style={{
          height: 13,
          width: "90%",
          borderRadius: 4,
          background: "rgba(255,255,255,.04)",
          marginBottom: 6,
          animation: "shimmer 1.6s ease-in-out infinite",
        }}
      />
      <div
        style={{
          height: 13,
          width: "70%",
          borderRadius: 4,
          background: "rgba(255,255,255,.04)",
          animation: "shimmer 1.6s ease-in-out infinite",
        }}
      />
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function StudiosPage() {
  const { locale } = useLocale();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [state, setState] = useState<FetchState>("loading");
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  // ── Search ────────────────────────────────────────────────────────────
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleSearchChange(value: string) {
    setSearchInput(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setSearchQuery(value.trim());
    }, SEARCH_DEBOUNCE_MS);
  }

  function clearSearch() {
    setSearchInput("");
    setSearchQuery("");
    if (debounceRef.current) clearTimeout(debounceRef.current);
  }

  // ── Helpers ───────────────────────────────────────────────────────────

  function parseChannelList(data: unknown): Channel[] {
    if (Array.isArray(data)) return data;
    const obj = data as Record<string, unknown> | null;
    if (Array.isArray(obj?.channels)) return obj!.channels as Channel[];
    if (Array.isArray(obj?.items)) return obj!.items as Channel[];
    return [];
  }

  function buildUrl(searchQ: string, currentOffset: number): string {
    if (searchQ) {
      return `/api/channels/search?q=${encodeURIComponent(searchQ)}&lang=${locale}&limit=${PAGE_LIMIT}&offset=${currentOffset}`;
    }
    return `/api/channels?lang=${locale}&limit=${PAGE_LIMIT}&offset=${currentOffset}`;
  }

  // ── Initial fetch / search ────────────────────────────────────────────

  useEffect(() => {
    let cancelled = false;
    setState("loading");
    setChannels([]);
    setOffset(0);
    setHasMore(true);

    fetch(buildUrl(searchQuery, 0), { cache: "no-store" })
      .then(async (res) => {
        if (cancelled) return;
        if (!res.ok) throw new Error(`status ${res.status}`);
        const data = await res.json();
        const list = parseChannelList(data);
        setChannels(list);
        setOffset(list.length);
        setHasMore(list.length === PAGE_LIMIT);
        setState("done");
      })
      .catch(() => {
        if (!cancelled) setState("error");
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [retryKey, locale, searchQuery]);

  // ── Load more ───────────────────────────────────────────────────────────

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const res = await fetch(buildUrl(searchQuery, offset), {
        cache: "no-store",
      });
      if (!res.ok) throw new Error(`status ${res.status}`);
      const data = await res.json();
      const newItems = parseChannelList(data);
      setChannels((prev) => [...prev, ...newItems]);
      setOffset((prev) => prev + newItems.length);
      setHasMore(newItems.length === PAGE_LIMIT);
    } catch {
      // keep existing list on load-more failure
    } finally {
      setLoadingMore(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offset, loadingMore, hasMore, locale, searchQuery]);

  // ── Retry ───────────────────────────────────────────────────────────────

  function retry() {
    setRetryKey((k) => k + 1);
  }

  const isSearching = searchQuery.length > 0;

  // ── Render ──────────────────────────────────────────────────────────────

  return (
    <main style={{ minHeight: "100vh" }}>
      <div
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "28px 20px 60px",
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <h1
            style={{
              fontSize: 28,
              fontWeight: 700,
              margin: "0 0 8px",
            }}
          >
            스튜디오 탐색
          </h1>
          <p
            style={{
              margin: 0,
              fontSize: 15,
              color: "var(--muted)",
              lineHeight: 1.5,
            }}
          >
            다양한 크리에이터의 스튜디오를 찾아보세요
          </p>
        </div>

        {/* Search */}
        <div style={{ marginBottom: 28, position: "relative", maxWidth: 480 }}>
          {/* Search icon */}
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--muted)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              position: "absolute",
              left: 14,
              top: "50%",
              transform: "translateY(-50%)",
              pointerEvents: "none",
            }}
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            value={searchInput}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="스튜디오 이름 또는 핸들로 검색"
            aria-label="스튜디오 검색"
            style={{
              width: "100%",
              padding: "12px 40px 12px 42px",
              fontSize: 15,
              background: "var(--panel)",
              border: "1px solid var(--line)",
              borderRadius: "var(--r)",
              color: "inherit",
              outline: "none",
              transition: "border-color .2s",
              boxSizing: "border-box",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "var(--accent)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "var(--line)";
            }}
          />
          {searchInput && (
            <button
              onClick={clearSearch}
              aria-label="검색 초기화"
              style={{
                position: "absolute",
                right: 12,
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                color: "var(--muted)",
                cursor: "pointer",
                padding: 4,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>

        {/* Loading */}
        {state === "loading" && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fill, minmax(280px, 1fr))",
              gap: 16,
            }}
          >
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {/* Error */}
        {state === "error" && (
          <div
            style={{
              padding: "60px 0",
              textAlign: "center",
              color: "var(--muted)",
            }}
          >
            <p style={{ fontSize: 18, marginBottom: 12 }}>
              스튜디오 목록을 불러올 수 없습니다.
            </p>
            <p style={{ fontSize: 13, marginBottom: 24 }}>
              서버 연결을 확인하거나 잠시 후 다시 시도해 주세요.
            </p>
            <button
              className="btn-grad"
              onClick={retry}
              style={{ padding: "10px 28px" }}
            >
              다시 시도
            </button>
          </div>
        )}

        {/* Empty */}
        {state === "done" && channels.length === 0 && (
          <div
            style={{
              padding: "60px 0",
              textAlign: "center",
              color: "var(--muted)",
            }}
          >
            {isSearching ? (
              <>
                <p style={{ fontSize: 18, marginBottom: 8 }}>
                  &ldquo;{searchQuery}&rdquo;에 대한 검색 결과가 없습니다.
                </p>
                <p style={{ fontSize: 13 }}>
                  다른 검색어로 다시 시도해 보세요.
                </p>
              </>
            ) : (
              <p style={{ fontSize: 18 }}>등록된 스튜디오가 없습니다.</p>
            )}
          </div>
        )}

        {/* Studio grid */}
        {state === "done" && channels.length > 0 && (
          <>
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fill, minmax(280px, 1fr))",
                gap: 16,
              }}
            >
              {channels.map((ch) => (
                <ChannelCard key={ch.id} channel={ch} />
              ))}
            </div>

            {hasMore && (
              <div style={{ marginTop: 36, textAlign: "center" }}>
                <button
                  className="btn-grad"
                  onClick={loadMore}
                  disabled={loadingMore}
                  style={{
                    padding: "10px 32px",
                    fontSize: 14,
                    opacity: loadingMore ? 0.6 : 1,
                    cursor: loadingMore
                      ? "not-allowed"
                      : "pointer",
                  }}
                >
                  {loadingMore ? "불러오는 중..." : "더 보기"}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
