"use client";

import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import type { Channel, ChannelContent, ChannelSeries } from "@/types/channel";
import SubscribeButton from "@/components/SubscribeButton";
import { useAuth } from "@/components/AuthProvider";

// ─── Constants ───────────────────────────────────────────────────────────────

const CONTENT_LIMIT = 24;
type Tab = "contents" | "series";
type FetchState = "loading" | "done" | "error";

// ─── Sub-components ──────────────────────────────────────────────────────────

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
          width: "100%",
          height: "100%",
          background:
            "linear-gradient(135deg, rgba(139,92,246,.3), rgba(6,182,212,.2))",
          ...style,
        }}
      />
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      style={{ width: "100%", height: "100%", objectFit: "cover", ...style }}
      onError={() => setFailed(true)}
    />
  );
}

function SkeletonCard() {
  return (
    <div
      style={{
        border: "1px solid var(--line)",
        borderRadius: "var(--r)",
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

function SkeletonBanner() {
  return (
    <div
      style={{
        width: "100%",
        height: 280,
        background: "rgba(255,255,255,.05)",
        animation: "shimmer 1.6s ease-in-out infinite",
      }}
    />
  );
}

function SkeletonHeader() {
  return (
    <div
      style={{
        maxWidth: 1280,
        margin: "0 auto",
        padding: "0 20px",
        position: "relative",
      }}
    >
      <div
        style={{
          width: 80,
          height: 80,
          borderRadius: "50%",
          background: "rgba(255,255,255,.1)",
          border: "3px solid var(--bg)",
          marginTop: -40,
          animation: "shimmer 1.6s ease-in-out infinite",
        }}
      />
      <div style={{ marginTop: 12 }}>
        <div
          style={{
            height: 22,
            width: 180,
            borderRadius: 6,
            background: "rgba(255,255,255,.07)",
            marginBottom: 8,
            animation: "shimmer 1.6s ease-in-out infinite",
          }}
        />
        <div
          style={{
            height: 14,
            width: 120,
            borderRadius: 4,
            background: "rgba(255,255,255,.05)",
            animation: "shimmer 1.6s ease-in-out infinite",
          }}
        />
      </div>
    </div>
  );
}

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
        fontSize: 28,
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
      title="공식 채널"
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 18,
        height: 18,
        borderRadius: "50%",
        background: "var(--accent)",
        color: "#fff",
        fontSize: 11,
        fontWeight: 700,
        marginLeft: 6,
        flexShrink: 0,
      }}
    >
      ✓
    </span>
  );
}

function ContentTypeBadge({ type }: { type: string }) {
  const label = type === "MOVIE" ? "영화" : type === "EPISODE" ? "에피소드" : type;
  return (
    <span
      className="tag"
      style={{ fontSize: 10, padding: "2px 6px" }}
    >
      {label}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    PUBLISHED: { label: "공개", className: "tag-brand" },
    DRAFT: { label: "초안", className: "tag" },
    UNLISTED: { label: "비공개", className: "tag" },
    ARCHIVED: { label: "보관됨", className: "tag" },
  };
  const info = map[status] ?? { label: status, className: "tag" };
  return (
    <span className={info.className} style={{ fontSize: 10, padding: "2px 6px" }}>
      {info.label}
    </span>
  );
}

function formatSubscribers(count: number): string {
  return count.toLocaleString("ko-KR");
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function ChannelPage() {
  const params = useParams();
  const handle = typeof params.handle === "string" ? params.handle : "";
  const { user } = useAuth();

  const [channel, setChannel] = useState<Channel | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [channelState, setChannelState] = useState<FetchState>("loading");

  const [contents, setContents] = useState<ChannelContent[]>([]);
  const [contentsState, setContentsState] = useState<FetchState>("loading");
  const [contentsOffset, setContentsOffset] = useState(0);
  const [hasMoreContents, setHasMoreContents] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const [series, setSeries] = useState<ChannelSeries[]>([]);
  const [seriesState, setSeriesState] = useState<FetchState>("loading");

  const [activeTab, setActiveTab] = useState<Tab>("contents");
  const [retryKey, setRetryKey] = useState(0);

  // ── Fetch channel info ─────────────────────────────────────────────────

  useEffect(() => {
    if (!handle) return;
    let cancelled = false;
    setChannelState("loading");

    fetch(`/api/channels/${encodeURIComponent(handle)}?lang=ko`, {
      cache: "no-store",
    })
      .then(async (res) => {
        if (cancelled) return;
        if (!res.ok) throw new Error(`status ${res.status}`);
        const data = await res.json();
        setChannel(data as Channel);
        setChannelState("done");
      })
      .catch(() => {
        if (!cancelled) setChannelState("error");
      });

    return () => {
      cancelled = true;
    };
  }, [handle, retryKey]);

  // ── Fetch subscription status ─────────────────────────────────────────

  useEffect(() => {
    if (!handle || !user) return;
    let cancelled = false;
    fetch(`/api/channels/${encodeURIComponent(handle)}/subscription-status`, {
      credentials: "include",
      cache: "no-store",
    })
      .then(async (res) => {
        if (cancelled || !res.ok) return;
        const data = await res.json();
        setIsSubscribed(!!data.subscribed);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [handle, user]);

  // ── Fetch contents (initial) ───────────────────────────────────────────

  useEffect(() => {
    if (!handle) return;
    let cancelled = false;
    setContentsState("loading");
    setContents([]);
    setContentsOffset(0);
    setHasMoreContents(true);

    fetch(
      `/api/channels/${encodeURIComponent(handle)}/contents?lang=ko&limit=${CONTENT_LIMIT}&offset=0`,
      { cache: "no-store" },
    )
      .then(async (res) => {
        if (cancelled) return;
        if (!res.ok) throw new Error(`status ${res.status}`);
        const data = await res.json();
        const list: ChannelContent[] = Array.isArray(data)
          ? data
          : Array.isArray(data?.contents)
            ? data.contents
            : Array.isArray(data?.items)
              ? data.items
              : [];
        setContents(list);
        setContentsOffset(list.length);
        setHasMoreContents(list.length === CONTENT_LIMIT);
        setContentsState("done");
      })
      .catch(() => {
        if (!cancelled) setContentsState("error");
      });

    return () => {
      cancelled = true;
    };
  }, [handle, retryKey]);

  // ── Fetch series ───────────────────────────────────────────────────────

  useEffect(() => {
    if (!handle) return;
    let cancelled = false;
    setSeriesState("loading");

    fetch(`/api/channels/${encodeURIComponent(handle)}/series?lang=ko`, {
      cache: "no-store",
    })
      .then(async (res) => {
        if (cancelled) return;
        if (!res.ok) throw new Error(`status ${res.status}`);
        const data = await res.json();
        const list: ChannelSeries[] = Array.isArray(data)
          ? data
          : Array.isArray(data?.series)
            ? data.series
            : Array.isArray(data?.items)
              ? data.items
              : [];
        setSeries(list);
        setSeriesState("done");
      })
      .catch(() => {
        if (!cancelled) setSeriesState("error");
      });

    return () => {
      cancelled = true;
    };
  }, [handle, retryKey]);

  // ── Load more contents ─────────────────────────────────────────────────

  const loadMoreContents = useCallback(async () => {
    if (loadingMore || !hasMoreContents) return;
    setLoadingMore(true);
    try {
      const res = await fetch(
        `/api/channels/${encodeURIComponent(handle)}/contents?lang=ko&limit=${CONTENT_LIMIT}&offset=${contentsOffset}`,
        { cache: "no-store" },
      );
      if (!res.ok) throw new Error(`status ${res.status}`);
      const data = await res.json();
      const newItems: ChannelContent[] = Array.isArray(data)
        ? data
        : Array.isArray(data?.contents)
          ? data.contents
          : Array.isArray(data?.items)
            ? data.items
            : [];
      setContents((prev) => [...prev, ...newItems]);
      setContentsOffset((prev) => prev + newItems.length);
      setHasMoreContents(newItems.length === CONTENT_LIMIT);
    } catch {
      // 더 보기 실패 시 기존 목록 유지
    } finally {
      setLoadingMore(false);
    }
  }, [handle, contentsOffset, loadingMore, hasMoreContents]);

  // ── Retry ──────────────────────────────────────────────────────────────

  function retry() {
    setRetryKey((k) => k + 1);
  }

  // ── Error state (channel failed) ──────────────────────────────────────

  if (channelState === "error") {
    return (
      <main style={{ minHeight: "100vh" }}>
        <div
          style={{
            maxWidth: 1280,
            margin: "0 auto",
            padding: "80px 20px",
            textAlign: "center",
            color: "var(--muted)",
          }}
        >
          <p style={{ fontSize: 18, marginBottom: 12 }}>
            채널을 불러올 수 없습니다.
          </p>
          <p style={{ fontSize: 13, marginBottom: 24 }}>
            서버 연결을 확인하거나 잠시 후 다시 시도해 주세요.
          </p>
          <button className="btn-grad" onClick={retry} style={{ padding: "10px 28px" }}>
            다시 시도
          </button>
        </div>
      </main>
    );
  }

  // ── Loading state (channel loading) ───────────────────────────────────

  if (channelState === "loading") {
    return (
      <main style={{ minHeight: "100vh" }}>
        <SkeletonBanner />
        <div style={{ marginTop: 16 }}>
          <SkeletonHeader />
        </div>
        <div
          style={{
            maxWidth: 1280,
            margin: "40px auto 0",
            padding: "0 20px",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))",
            gap: 14,
          }}
        >
          {Array.from({ length: 12 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </main>
    );
  }

  // channel is guaranteed non-null when channelState === "done"
  const ch = channel!;

  // ── Render ─────────────────────────────────────────────────────────────

  return (
    <main style={{ minHeight: "100vh" }}>
      {/* ── Banner ─────────────────────────────────────────────────────── */}
      <div
        style={{
          width: "100%",
          height: 280,
          overflow: "hidden",
          background: ch.bannerImageUrl
            ? "var(--bg2)"
            : "linear-gradient(135deg, rgba(139,92,246,.3), rgba(6,182,212,.2))",
        }}
      >
        {ch.bannerImageUrl && (
          <ImgWithFallback
            src={ch.bannerImageUrl}
            alt={`${ch.name} 배너`}
            style={{ display: "block" }}
          />
        )}
      </div>

      {/* ── Channel Header ─────────────────────────────────────────────── */}
      <div
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "0 20px",
          position: "relative",
        }}
      >
        {/* Profile image */}
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            overflow: "hidden",
            border: "3px solid var(--bg)",
            marginTop: -40,
            background: "var(--panel)",
            flexShrink: 0,
          }}
        >
          {ch.profileImageUrl ? (
            <ImgWithFallback src={ch.profileImageUrl} alt={ch.name} />
          ) : (
            <ProfileFallback name={ch.name} />
          )}
        </div>

        {/* Info + subscribe row */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 16,
            marginTop: 16,
          }}
        >
          <div style={{ flex: 1, minWidth: 200 }}>
            {/* Channel name + official badge */}
            <h1
              style={{
                fontSize: 24,
                fontWeight: 700,
                margin: 0,
                display: "flex",
                alignItems: "center",
              }}
            >
              {ch.name}
              {ch.isOfficial && <OfficialBadge />}
            </h1>

            {/* Handle + subscriber count */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginTop: 4,
                fontSize: 13,
                color: "var(--muted)",
              }}
            >
              <span>@{ch.handle}</span>
              <span aria-label={`구독자 ${formatSubscribers(ch.subscriberCount)}명`}>
                구독자 {formatSubscribers(ch.subscriberCount)}명
              </span>
            </div>

            {/* Description */}
            {ch.description && (
              <p
                style={{
                  marginTop: 12,
                  marginBottom: 0,
                  fontSize: 14,
                  color: "var(--muted2)",
                  lineHeight: 1.6,
                  maxWidth: 640,
                }}
              >
                {ch.description}
              </p>
            )}
          </div>

          {/* Subscribe button */}
          <div style={{ flexShrink: 0 }}>
            <SubscribeButton
              channelHandle={ch.handle}
              initialSubscribed={isSubscribed}
              onSubscriptionChange={(subscribed) => {
                setChannel((prev) =>
                  prev
                    ? {
                        ...prev,
                        subscriberCount: prev.subscriberCount + (subscribed ? 1 : -1),
                      }
                    : prev,
                );
              }}
            />
          </div>
        </div>
      </div>

      {/* ── Tabs ───────────────────────────────────────────────────────── */}
      <div
        style={{
          maxWidth: 1280,
          margin: "28px auto 0",
          padding: "0 20px",
        }}
      >
        <div
          role="tablist"
          style={{
            display: "flex",
            gap: 0,
            borderBottom: "1px solid var(--line)",
          }}
        >
          {(
            [
              { key: "contents", label: "영상" },
              { key: "series", label: "시리즈" },
            ] as const
          ).map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveTab(tab.key)}
                style={{
                  background: "none",
                  border: "none",
                  borderBottom: isActive
                    ? "2px solid var(--accent)"
                    : "2px solid transparent",
                  padding: "12px 24px",
                  fontSize: 15,
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? "var(--text)" : "var(--muted)",
                  cursor: "pointer",
                  transition: "color .2s, border-color .2s",
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Tab Content ────────────────────────────────────────────────── */}
      <div
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "24px 20px 60px",
        }}
      >
        {/* ─ 영상 tab ─ */}
        {activeTab === "contents" && (
          <>
            {contentsState === "loading" && (
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

            {contentsState === "error" && (
              <div
                style={{
                  padding: "60px 0",
                  textAlign: "center",
                  color: "var(--muted)",
                }}
              >
                <p style={{ fontSize: 16, marginBottom: 12 }}>
                  콘텐츠를 불러올 수 없습니다.
                </p>
                <button className="btn-grad" onClick={retry} style={{ padding: "8px 24px" }}>
                  다시 시도
                </button>
              </div>
            )}

            {contentsState === "done" && contents.length === 0 && (
              <div
                style={{
                  padding: "60px 0",
                  textAlign: "center",
                  color: "var(--muted)",
                }}
              >
                <p style={{ fontSize: 16 }}>등록된 콘텐츠가 없습니다.</p>
              </div>
            )}

            {contentsState === "done" && contents.length > 0 && (
              <>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))",
                    gap: 14,
                  }}
                >
                  {contents.map((item) => (
                    <Link
                      key={item.contentId}
                      href={`/contents/${item.contentId}`}
                      className="content-card"
                    >
                      <div
                        style={{
                          aspectRatio: "16 / 9",
                          background: "#111",
                          overflow: "hidden",
                        }}
                      >
                        {item.thumbnailUrl ? (
                          <ImgWithFallback
                            src={item.thumbnailUrl}
                            alt={item.title}
                          />
                        ) : (
                          <div
                            aria-hidden
                            style={{
                              width: "100%",
                              height: "100%",
                              background:
                                "linear-gradient(135deg, rgba(139,92,246,.18), rgba(6,182,212,.12))",
                            }}
                          />
                        )}
                      </div>
                      <div style={{ padding: "11px 13px" }}>
                        <div
                          style={{
                            fontWeight: 700,
                            fontSize: 13,
                            marginBottom: 6,
                            lineHeight: 1.4,
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}
                        >
                          {item.title}
                        </div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            fontSize: 11,
                            color: "var(--muted)",
                          }}
                        >
                          <ContentTypeBadge type={item.contentType} />
                          <span>
                            {new Date(item.createdAt).toLocaleDateString("ko-KR")}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>

                {hasMoreContents && (
                  <div style={{ marginTop: 32, textAlign: "center" }}>
                    <button
                      className="btn-grad"
                      onClick={loadMoreContents}
                      disabled={loadingMore}
                      style={{
                        padding: "10px 32px",
                        fontSize: 14,
                        opacity: loadingMore ? 0.6 : 1,
                        cursor: loadingMore ? "not-allowed" : "pointer",
                      }}
                    >
                      {loadingMore ? "불러오는 중…" : "더 보기"}
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* ─ 시리즈 tab ─ */}
        {activeTab === "series" && (
          <>
            {seriesState === "loading" && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                  gap: 14,
                }}
              >
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    style={{
                      border: "1px solid var(--line)",
                      borderRadius: "var(--r)",
                      padding: 20,
                      background: "rgba(255,255,255,.03)",
                    }}
                  >
                    <div
                      style={{
                        height: 18,
                        width: "70%",
                        borderRadius: 4,
                        background: "rgba(255,255,255,.07)",
                        marginBottom: 12,
                        animation: "shimmer 1.6s ease-in-out infinite",
                      }}
                    />
                    <div
                      style={{
                        height: 13,
                        width: "40%",
                        borderRadius: 4,
                        background: "rgba(255,255,255,.05)",
                        animation: "shimmer 1.6s ease-in-out infinite",
                      }}
                    />
                  </div>
                ))}
              </div>
            )}

            {seriesState === "error" && (
              <div
                style={{
                  padding: "60px 0",
                  textAlign: "center",
                  color: "var(--muted)",
                }}
              >
                <p style={{ fontSize: 16, marginBottom: 12 }}>
                  시리즈를 불러올 수 없습니다.
                </p>
                <button className="btn-grad" onClick={retry} style={{ padding: "8px 24px" }}>
                  다시 시도
                </button>
              </div>
            )}

            {seriesState === "done" && series.length === 0 && (
              <div
                style={{
                  padding: "60px 0",
                  textAlign: "center",
                  color: "var(--muted)",
                }}
              >
                <p style={{ fontSize: 16 }}>등록된 시리즈가 없습니다.</p>
              </div>
            )}

            {seriesState === "done" && series.length > 0 && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                  gap: 14,
                }}
              >
                {series.map((s) => (
                  <div
                    key={s.seriesId}
                    style={{
                      border: "1px solid var(--line)",
                      borderRadius: "var(--r)",
                      padding: 20,
                      background: "rgba(255,255,255,.03)",
                      transition: "border-color .2s, background .2s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "var(--accent)";
                      e.currentTarget.style.background = "rgba(255,255,255,.05)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "var(--line)";
                      e.currentTarget.style.background = "rgba(255,255,255,.03)";
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 8,
                        marginBottom: 8,
                      }}
                    >
                      <h3
                        style={{
                          fontSize: 15,
                          fontWeight: 700,
                          margin: 0,
                          lineHeight: 1.4,
                          flex: 1,
                        }}
                      >
                        {s.title}
                      </h3>
                      <StatusBadge status={s.status} />
                    </div>
                    <p
                      style={{
                        margin: 0,
                        fontSize: 13,
                        color: "var(--muted)",
                      }}
                    >
                      {s.episodeCount}개 에피소드
                    </p>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
