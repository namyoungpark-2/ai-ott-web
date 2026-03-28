"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getThumbnailUrl } from "./lib/url";
import { BASE_URL } from "./constants";
import { AdProvider, useAds } from "@/components/ads/AdProvider";
import AdBanner from "@/components/ads/AdBanner";
import { useAuth } from "@/components/AuthProvider";

// ─── Types ────────────────────────────────────────────────────────────────────

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
  categories?: string[];
  genres?: string[];
  tags?: string[];
  videoWidth?: number | null;
  videoHeight?: number | null;
  orientation?: string | null;
  durationMs?: number | null;
  channelHandle?: string | null;
  channelName?: string | null;
};

type ContinueItem = {
  contentId: string;
  title: string;
  thumbnailUrl?: string | null;
  positionMs: number;
  durationMs?: number | null;
  progressPercent?: number | null;
};

// TODO(API): 백엔드가 type 필드를 추가하면 SectionDisplayType 분기를 여기서 교체
type CatalogSection = { key: string; title: string; items: CatalogItem[] };

type SectionDisplayType = "featured" | "rail" | "grid";
type BrowseState = "loading" | "done" | "error";

// ─── Utils ────────────────────────────────────────────────────────────────────

function getSectionDisplayType(key: string, index: number): SectionDisplayType {
  if (index === 0 || key.toLowerCase().includes("featured")) return "featured";
  return "rail";
}

function formatRuntime(seconds?: number | null): string {
  if (!seconds) return "";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return h > 0 ? `${h}시간 ${m}분` : `${m}분`;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

type ImgFallbackProps = {
  src: string;
  alt: string;
  style?: React.CSSProperties;
};

function ImgWithFallback({ src, alt, style }: ImgFallbackProps) {
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
    <img
      src={src}
      alt={alt}
      style={style}
      onError={() => setFailed(true)}
    />
  );
}

function ContentCard({ item }: { item: CatalogItem }) {
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
          style={{ fontWeight: 700, fontSize: 13, lineHeight: 1.35, marginBottom: 4 }}
        >
          {item.title}
        </div>
        {item.channelName && (
          <div
            style={{
              fontSize: 11,
              color: "var(--muted)",
              marginBottom: 2,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {item.channelName}
          </div>
        )}
        <div
          style={{ color: "var(--muted)", fontSize: 12, minHeight: 30, lineHeight: 1.5 }}
        >
          {item.description?.slice(0, 60) || item.contentType}
        </div>
        <div
          style={{
            marginTop: 8,
            display: "flex",
            gap: 8,
            alignItems: "center",
            fontSize: 11,
            color: "rgba(255,255,255,.38)",
          }}
        >
          {item.categories && item.categories.length > 0 && (
            <span>{item.categories.slice(0, 2).join(" · ")}</span>
          )}
          {item.runtimeSeconds && <span>{formatRuntime(item.runtimeSeconds)}</span>}
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
            borderRadius: 4,
            background: "rgba(255,255,255,.05)",
            width: "60%",
            animation: "shimmer 1.6s ease-in-out infinite",
          }}
        />
      </div>
    </div>
  );
}

type ContentSectionProps = {
  section: CatalogSection;
  displayType: SectionDisplayType;
};

function ContentSection({ section, displayType }: ContentSectionProps) {
  const isRail = displayType === "rail";

  return (
    <section aria-label={section.title}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 12,
        }}
      >
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, letterSpacing: -0.3 }}>
          {section.title}
        </h2>
        {section.items.length > 0 && (
          <span style={{ color: "var(--muted)", fontSize: 12 }}>
            {section.items.length}개
          </span>
        )}
      </div>

      {section.items.length === 0 ? (
        <p style={{ color: "var(--muted)", fontSize: 13, padding: "12px 0" }}>
          표시할 콘텐츠가 없습니다.
        </p>
      ) : isRail ? (
        <div
          className="rail-scroll"
          style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 8 }}
        >
          {section.items.map((item) => (
            <div key={item.id} style={{ flexShrink: 0, width: 200 }}>
              <ContentCard item={item} />
            </div>
          ))}
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))",
            gap: 14,
          }}
        >
          {section.items.map((item) => (
            <ContentCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </section>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function HomePage() {
  const [sections, setSections] = useState<CatalogSection[]>([]);
  const [browseState, setBrowseState] = useState<BrowseState>("loading");
  const [retryKey, setRetryKey] = useState(0);
  const [continueItems, setContinueItems] = useState<ContinueItem[]>([]);

  const { user } = useAuth();
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<CatalogItem[]>([]);
  const [searchDone, setSearchDone] = useState(false);

  // isSearching은 query에서 파생 (setState 없이 조건 분기)
  const isSearching = query.trim().length > 0;

  function retryBrowse() {
    setBrowseState("loading");
    setRetryKey((k) => k + 1);
  }

  // Continue-watching fetch (logged-in users only)
  useEffect(() => {
    if (!user) {
      setContinueItems([]);
      return;
    }
    let cancelled = false;
    fetch("/api/me/continue-watching", { credentials: "include", cache: "no-store" })
      .then(async (res) => {
        if (cancelled || !res.ok) return;
        const data = (await res.json()) as ContinueItem[];
        if (!cancelled) setContinueItems(Array.isArray(data) ? data : []);
      })
      .catch(() => {/* silently ignore */});
    return () => { cancelled = true; };
  }, [user]);

  // Browse fetch
  useEffect(() => {
    let cancelled = false;
    fetch("/api/catalog/browse?lang=en&sectionLimit=12", { cache: "no-store" })
      .then(async (res) => {
        if (cancelled) return;
        if (!res.ok) throw new Error(`status ${res.status}`);
        const data = (await res.json()) as { sections?: CatalogSection[] };
        setSections(Array.isArray(data?.sections) ? data.sections : []);
        setBrowseState("done");
      })
      .catch(() => {
        if (!cancelled) setBrowseState("error");
      });
    return () => {
      cancelled = true;
    };
  }, [retryKey]);

  // Search with debounce (no synchronous setState in effect body)
  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) return;

    const timer = setTimeout(() => {
      setSearchLoading(true);
      setSearchDone(false);
      fetch(
        `/api/catalog/search?lang=en&q=${encodeURIComponent(trimmed)}&limit=24`,
        { cache: "no-store" }
      )
        .then(async (res) => {
          const data = (await res.json()) as { items?: CatalogItem[] };
          setSearchResults(Array.isArray(data?.items) ? data.items : []);
          setSearchLoading(false);
          setSearchDone(true);
        })
        .catch(() => {
          setSearchLoading(false);
          setSearchDone(true);
        });
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const hero = useMemo(() => {
    if (isSearching) return searchResults[0] ?? null;
    return sections[0]?.items?.[0] ?? null;
  }, [sections, searchResults, isSearching]);

  const heroImgSrc = hero
    ? (getThumbnailUrl(hero.bannerUrl ?? hero.posterUrl, BASE_URL) ?? "")
    : "";

  const visibleSections: CatalogSection[] = isSearching
    ? [{ key: "search", title: `"${query.trim()}" 검색 결과`, items: searchResults }]
    : sections;

  return (
    <main style={{ minHeight: "100vh" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: 20 }}>

        {/* 검색 바 — Enter 시 /search 페이지로 이동 */}
        <div style={{ marginBottom: 20, position: "relative", maxWidth: 480 }}>
          <span
            aria-hidden
            style={{
              position: "absolute",
              left: 14,
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--muted2)",
              pointerEvents: "none",
              fontSize: 15,
            }}
          >
            🔍
          </span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && query.trim()) {
                router.push(`/search?q=${encodeURIComponent(query.trim())}`);
              }
              if (e.key === "Escape") setQuery("");
            }}
            placeholder="영화, 시리즈, 태그 검색…"
            aria-label="콘텐츠 검색"
            style={{ width: "100%", paddingLeft: 40 }}
          />
        </div>

        {/* Hero */}
        <section
          aria-label="추천 콘텐츠"
          style={{
            position: "relative",
            minHeight: 380,
            borderRadius: 24,
            overflow: "hidden",
            border: "1px solid var(--line)",
            background: "var(--panel)",
            boxShadow: "var(--shadow)",
            marginBottom: 32,
          }}
        >
          {browseState === "loading" && !isSearching ? (
            <div
              style={{
                height: 380,
                background: "rgba(255,255,255,.04)",
                animation: "shimmer 1.6s ease-in-out infinite",
              }}
            />
          ) : hero ? (
            <>
              <ImgWithFallback
                key={heroImgSrc}
                src={heroImgSrc}
                alt={hero.title}
                style={{ width: "100%", height: 380, objectFit: "cover", display: "block" }}
              />
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "linear-gradient(90deg, rgba(11,11,15,.95) 0%, rgba(11,11,15,.55) 50%, rgba(11,11,15,.08) 100%)",
                }}
              />
              <div
                style={{ position: "absolute", left: 28, bottom: 28, maxWidth: 520 }}
              >
                {hero.categories && hero.categories.length > 0 && (
                  <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
                    {hero.categories.slice(0, 2).map((cat) => (
                      <span key={cat} className="tag tag-brand">{cat}</span>
                    ))}
                  </div>
                )}
                <h1
                  style={{ fontSize: 38, margin: "0 0 10px", lineHeight: 1.08, fontWeight: 900, letterSpacing: -0.5 }}
                >
                  {hero.title}
                </h1>
                {hero.description && (
                  <p
                    style={{
                      color: "rgba(255,255,255,.75)",
                      lineHeight: 1.55,
                      margin: "0 0 16px",
                      fontSize: 15,
                    }}
                  >
                    {hero.description.slice(0, 120)}
                    {hero.description.length > 120 ? "…" : ""}
                  </p>
                )}
                <div
                  style={{ display: "flex", gap: 10, alignItems: "center" }}
                >
                  <Link href={`/watch/${hero.id}`}>
                    <button
                      className="btn-grad"
                      style={{ fontSize: 15, padding: "11px 26px", letterSpacing: 0 }}
                    >
                      ▶ 재생
                    </button>
                  </Link>
                  {hero.runtimeSeconds && (
                    <span style={{ color: "var(--muted)", fontSize: 13 }}>
                      {formatRuntime(hero.runtimeSeconds)}
                    </span>
                  )}
                </div>
              </div>
            </>
          ) : browseState === "error" ? (
            <div
              style={{
                height: 380,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 12,
              }}
            >
              <p style={{ color: "var(--muted)", fontSize: 15 }}>
                콘텐츠를 불러올 수 없습니다.
              </p>
              <button onClick={retryBrowse}>다시 시도</button>
            </div>
          ) : (
            <div
              style={{
                height: 380,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <p style={{ color: "var(--muted)", fontSize: 15 }}>
                {isSearching ? "검색 결과가 없습니다." : "등록된 콘텐츠가 없습니다."}
              </p>
            </div>
          )}
        </section>

        {/* Browse: loading skeletons */}
        {browseState === "loading" && !isSearching && (
          <div style={{ display: "grid", gap: 36 }}>
            {[0, 1, 2].map((i) => (
              <div key={i}>
                <div
                  style={{
                    height: 18,
                    width: 150,
                    borderRadius: 4,
                    background: "rgba(255,255,255,.07)",
                    marginBottom: 14,
                    animation: "shimmer 1.6s ease-in-out infinite",
                  }}
                />
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))",
                    gap: 14,
                  }}
                >
                  {Array.from({ length: 6 }).map((_, j) => (
                    <SkeletonCard key={j} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Browse: error */}
        {browseState === "error" && (
          <div style={{ padding: "32px 0", textAlign: "center" }}>
            <p style={{ color: "var(--muted)", marginBottom: 12 }}>
              섹션 데이터를 불러오지 못했습니다.
            </p>
            <button onClick={retryBrowse}>다시 시도</button>
          </div>
        )}

        {/* Browse: empty */}
        {browseState === "done" && !isSearching && sections.length === 0 && (
          <div style={{ padding: "32px 0", textAlign: "center" }}>
            <p style={{ color: "var(--muted)" }}>등록된 콘텐츠가 없습니다.</p>
          </div>
        )}

        {/* Search: loading indicator */}
        {isSearching && searchLoading && (
          <p style={{ color: "var(--muted)", fontSize: 13, marginBottom: 16 }}>
            검색 중...
          </p>
        )}

        {/* Search: empty result */}
        {isSearching && searchDone && !searchLoading && searchResults.length === 0 && (
          <div style={{ padding: "32px 0", textAlign: "center" }}>
            <p style={{ color: "var(--muted)" }}>
              &ldquo;{query.trim()}&rdquo;에 대한 결과가 없습니다.
            </p>
          </div>
        )}

        {/* Continue Watching rail */}
        {!isSearching && continueItems.length > 0 && (
          <section aria-label="이어보기" style={{ marginBottom: 36 }}>
            <h2 style={{ margin: "0 0 12px", fontSize: 18, fontWeight: 800, letterSpacing: -0.3 }}>이어보기</h2>
            <div
              className="rail-scroll"
              style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 8 }}
            >
              {continueItems.map((item) => {
                const thumbSrc = item.thumbnailUrl
                  ? getThumbnailUrl(item.thumbnailUrl, BASE_URL) ?? ""
                  : "";
                return (
                  <Link
                    key={item.contentId}
                    href={`/watch/${item.contentId}${item.positionMs > 0 ? `?t=${Math.floor(item.positionMs / 1000)}` : ""}`}
                    className="content-card"
                    style={{ flexShrink: 0, width: 200, textDecoration: "none" }}
                  >
                    <div style={{ aspectRatio: "16 / 9", background: "#111", position: "relative" }}>
                      {thumbSrc ? (
                        <img
                          src={thumbSrc}
                          alt={item.title}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      ) : (
                        <div
                          style={{
                            width: "100%",
                            height: "100%",
                            background: "linear-gradient(135deg, rgba(109,94,252,.18), rgba(0,0,0,.35))",
                          }}
                        />
                      )}
                      {/* Progress bar */}
                      {item.progressPercent != null && (
                        <div
                          style={{
                            position: "absolute",
                            bottom: 0,
                            left: 0,
                            right: 0,
                            height: 3,
                            background: "rgba(255,255,255,.2)",
                          }}
                        >
                          <div
                            style={{
                              height: "100%",
                              width: `${item.progressPercent}%`,
                              background: "var(--accent)",
                            }}
                          />
                        </div>
                      )}
                    </div>
                    <div style={{ padding: "8px 10px" }}>
                      <div style={{ fontWeight: 700, fontSize: 12, lineHeight: 1.35 }}>
                        {item.title}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* Content sections */}
        {(browseState === "done" || isSearching) && visibleSections.length > 0 && (
          <div style={{ display: "grid", gap: 36 }}>
            {visibleSections.map((section, index) => (
              <HomeSectionWithAd key={section.key} index={index}>
                <ContentSection
                  section={section}
                  displayType={
                    isSearching ? "grid" : getSectionDisplayType(section.key, index)
                  }
                />
              </HomeSectionWithAd>
            ))}
          </div>
        )}

      </div>
    </main>
  );
}

// Injects a banner ad after every 2nd section (index 1, 3, 5…)
function HomeSectionWithAd({ index, children }: { index: number; children: React.ReactNode }) {
  const { config } = useAds();
  const banner = config?.banners[Math.floor(index / 2)] ?? null;
  return (
    <>
      {children}
      {banner && index % 2 === 1 && (
        <AdBanner ad={banner} dismissible style={{ marginTop: -16 }} />
      )}
    </>
  );
}

// Root export wraps with AdProvider
function HomePageInner() {
  return <HomePage />;
}

// Rename old default export to HomePage, new default wraps with AdProvider
export default function HomePageWithAds() {
  return (
    <AdProvider pageType="home">
      <HomePageInner />
    </AdProvider>
  );
}
