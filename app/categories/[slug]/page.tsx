"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getThumbnailUrl } from "@/app/lib/url";
import { BASE_URL } from "@/app/constants";

type ContentItem = {
  id: string;
  title: string;
  description?: string | null;
  contentType: string;
  posterUrl?: string | null;
  bannerUrl?: string | null;
  runtimeSeconds?: number | null;
  categories?: string[];
  tags?: string[];
};

const CATEGORY_META: Record<string, { label: string; description: string }> = {
  movie: { label: "영화", description: "다양한 장르의 영화를 감상하세요." },
  drama: { label: "드라마", description: "인기 드라마 시리즈를 모두 만나보세요." },
  variety: { label: "예능", description: "웃음과 감동이 있는 예능 프로그램." },
  animation: { label: "애니메이션", description: "국내외 애니메이션 작품 모음." },
};

type FetchState = "loading" | "done" | "error";

export default function CategoryPage() {
  const params = useParams();
  const slug = typeof params.slug === "string" ? params.slug : "";
  const meta = CATEGORY_META[slug];

  const [items, setItems] = useState<ContentItem[]>([]);
  const [state, setState] = useState<FetchState>("loading");
  const [retryKey, setRetryKey] = useState(0);

  // 재시도: 이벤트 핸들러에서 loading 리셋 + retryKey 증가로 effect 재실행
  function retry() {
    setState("loading");
    setRetryKey((k) => k + 1);
  }

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    fetch(`/api/categories/${encodeURIComponent(slug)}?lang=en&size=24`, {
      cache: "no-store",
    })
      .then(async (res) => {
        if (cancelled) return;
        if (!res.ok) throw new Error(`status ${res.status}`);
        const data = await res.json();
        // 백엔드 응답이 { contents: [] } 또는 { items: [] } 형태 방어적 처리
        const list: ContentItem[] =
          Array.isArray(data?.contents)
            ? data.contents
            : Array.isArray(data?.items)
            ? data.items
            : [];
        setItems(list);
        setState("done");
      })
      .catch(() => {
        if (!cancelled) setState("error");
      });
    return () => { cancelled = true; };
  }, [slug, retryKey]);

  if (!meta) {
    return (
      <main style={{ minHeight: "100vh" }}>
        <div
          style={{
            maxWidth: 1280,
            margin: "0 auto",
            padding: 40,
            textAlign: "center",
          }}
        >
          <p style={{ color: "var(--muted)", fontSize: 18 }}>
            존재하지 않는 카테고리입니다.
          </p>
          <Link href="/">
            <button style={{ marginTop: 16 }}>홈으로 돌아가기</button>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main style={{ minHeight: "100vh" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "28px 20px" }}>
        {/* 카테고리 헤더 */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 36, margin: "0 0 8px" }}>{meta.label}</h1>
          <p style={{ color: "var(--muted)", margin: 0 }}>{meta.description}</p>
        </div>

        {/* 로딩 */}
        {state === "loading" && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))",
              gap: 16,
            }}
          >
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                style={{
                  border: "1px solid var(--line)",
                  borderRadius: 18,
                  overflow: "hidden",
                  background: "rgba(255,255,255,.03)",
                  animation: "pulse 1.5s ease-in-out infinite",
                }}
              >
                <div
                  style={{
                    aspectRatio: "16 / 9",
                    background: "rgba(255,255,255,.06)",
                  }}
                />
                <div style={{ padding: 14 }}>
                  <div
                    style={{
                      height: 16,
                      borderRadius: 4,
                      background: "rgba(255,255,255,.06)",
                      marginBottom: 8,
                    }}
                  />
                  <div
                    style={{
                      height: 12,
                      borderRadius: 4,
                      background: "rgba(255,255,255,.04)",
                      width: "60%",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 에러 */}
        {state === "error" && (
          <div
            style={{
              padding: "60px 0",
              textAlign: "center",
              color: "var(--muted)",
            }}
          >
            <p style={{ fontSize: 18, marginBottom: 12 }}>
              콘텐츠를 불러올 수 없습니다.
            </p>
            <p style={{ fontSize: 14, marginBottom: 20 }}>
              서버 연결을 확인하거나 잠시 후 다시 시도해 주세요.
            </p>
            <button onClick={retry}>다시 시도</button>
          </div>
        )}

        {/* 빈 상태 */}
        {state === "done" && items.length === 0 && (
          <div
            style={{
              padding: "60px 0",
              textAlign: "center",
              color: "var(--muted)",
            }}
          >
            <p style={{ fontSize: 18, marginBottom: 12 }}>
              아직 등록된 콘텐츠가 없습니다.
            </p>
            <Link href="/">
              <button>홈으로 돌아가기</button>
            </Link>
          </div>
        )}

        {/* 콘텐츠 그리드 */}
        {state === "done" && items.length > 0 && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))",
              gap: 16,
            }}
          >
            {items.map((item) => (
              <Link
                key={item.id}
                href={`/watch/${item.id}`}
                style={{
                  border: "1px solid var(--line)",
                  borderRadius: 18,
                  overflow: "hidden",
                  background: "rgba(255,255,255,.03)",
                  display: "block",
                }}
              >
                <div style={{ aspectRatio: "16 / 9", background: "#111" }}>
                  {item.posterUrl ? (
                    <img
                      src={getThumbnailUrl(item.posterUrl, BASE_URL) ?? ""}
                      alt={item.title}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : null}
                </div>
                <div style={{ padding: 14 }}>
                  <div style={{ fontWeight: 700, marginBottom: 6 }}>
                    {item.title}
                  </div>
                  <div
                    style={{
                      color: "var(--muted)",
                      fontSize: 13,
                      minHeight: 36,
                    }}
                  >
                    {item.description?.slice(0, 64) || item.contentType}
                  </div>
                  {item.tags && item.tags.length > 0 && (
                    <div
                      style={{
                        marginTop: 10,
                        fontSize: 12,
                        color: "rgba(255,255,255,.5)",
                      }}
                    >
                      {item.tags.slice(0, 3).join(" · ")}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
