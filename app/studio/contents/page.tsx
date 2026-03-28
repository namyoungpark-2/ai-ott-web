"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import StudioSidebar from "@/components/studio/StudioSidebar";
import type {
  CreatorContent,
  ContentStatus,
  VideoAssetStatus,
} from "@/types/channel";
import { useLocale } from "@/components/LocaleProvider";

const STATUS_FILTERS: { label: string; value: ContentStatus | "ALL" }[] = [
  { label: "전체", value: "ALL" },
  { label: "DRAFT", value: "DRAFT" },
  { label: "PUBLISHED", value: "PUBLISHED" },
  { label: "UNLISTED", value: "UNLISTED" },
];

function statusBadgeStyle(status: ContentStatus): React.CSSProperties {
  switch (status) {
    case "PUBLISHED":
      return {
        background: "rgba(34,197,94,.2)",
        color: "#22c55e",
        padding: "2px 10px",
        borderRadius: "var(--r-sm)",
        fontSize: 12,
        fontWeight: 600,
      };
    case "UNLISTED":
      return {
        background: "rgba(234,179,8,.2)",
        color: "#eab308",
        padding: "2px 10px",
        borderRadius: "var(--r-sm)",
        fontSize: 12,
        fontWeight: 600,
      };
    case "ARCHIVED":
      return {
        background: "rgba(239,68,68,.2)",
        color: "#ef4444",
        padding: "2px 10px",
        borderRadius: "var(--r-sm)",
        fontSize: 12,
        fontWeight: 600,
      };
    default:
      return {
        background: "rgba(150,150,150,.2)",
        color: "var(--muted)",
        padding: "2px 10px",
        borderRadius: "var(--r-sm)",
        fontSize: 12,
        fontWeight: 600,
      };
  }
}

function videoStatusLabel(status: VideoAssetStatus): React.ReactNode {
  if (status === null) {
    return <span style={{ color: "var(--muted)", fontSize: 13 }}>업로드 필요</span>;
  }
  switch (status) {
    case "UPLOADED":
      return <span style={{ fontSize: 13 }}>&#x23F3; 대기중</span>;
    case "TRANSCODING":
      return <span style={{ fontSize: 13 }}>&#x1F504; 트랜스코딩</span>;
    case "READY":
      return <span style={{ fontSize: 13 }}>&#x2705; 준비됨</span>;
    case "FAILED":
      return <span style={{ fontSize: 13 }}>&#x274C; 실패</span>;
    default:
      return <span style={{ color: "var(--muted)", fontSize: 13 }}>-</span>;
  }
}

export default function StudioContentsPage() {
  const { locale } = useLocale();
  const [contents, setContents] = useState<CreatorContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<ContentStatus | "ALL">("ALL");

  const fetchContents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/creator/contents?lang=${locale}&limit=50`, {
        credentials: "include",
        cache: "no-store",
      });
      if (!res.ok) throw new Error("콘텐츠 목록을 불러올 수 없습니다.");
      const data = await res.json();
      setContents(Array.isArray(data) ? data : data.contents ?? []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "콘텐츠 목록을 불러올 수 없습니다.",
      );
    } finally {
      setLoading(false);
    }
  }, [locale]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/creator/contents?lang=${locale}&limit=50`, {
          credentials: "include",
          cache: "no-store",
        });
        if (!res.ok) throw new Error("콘텐츠 목록을 불러올 수 없습니다.");
        const data = await res.json();
        if (!cancelled) {
          setContents(Array.isArray(data) ? data : data.contents ?? []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "콘텐츠 목록을 불러올 수 없습니다.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [locale]);

  const handleStatusToggle = async (
    contentId: string,
    currentStatus: ContentStatus,
  ) => {
    const newStatus = currentStatus === "PUBLISHED" ? "UNLISTED" : "PUBLISHED";
    try {
      const res = await fetch(
        `/api/creator/contents/${contentId}/status?status=${newStatus}`,
        { method: "PATCH", credentials: "include" },
      );
      if (!res.ok) throw new Error("상태 변경에 실패했습니다.");
      await fetchContents();
    } catch (err) {
      alert(
        err instanceof Error ? err.message : "상태 변경에 실패했습니다.",
      );
    }
  };

  const handleDelete = async (contentId: string, title: string) => {
    if (!window.confirm(`"${title}" 콘텐츠를 삭제하시겠습니까?`)) return;
    try {
      const res = await fetch(`/api/creator/contents/${contentId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("삭제에 실패했습니다.");
      await fetchContents();
    } catch (err) {
      alert(err instanceof Error ? err.message : "삭제에 실패했습니다.");
    }
  };

  const filtered =
    filter === "ALL"
      ? contents
      : contents.filter((c) => c.status === filter);

  const actionBtnStyle: React.CSSProperties = {
    background: "transparent",
    border: "1px solid var(--line)",
    borderRadius: "var(--r-sm)",
    padding: "4px 10px",
    fontSize: 12,
    cursor: "pointer",
    color: "var(--text)",
    transition: "border-color 0.15s",
  };

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "var(--bg)",
      }}
    >
      <StudioSidebar />

      <div
        style={{
          flex: 1,
          padding: "32px 40px",
          maxWidth: 1280,
          margin: "0 auto",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 24,
          }}
        >
          <h1
            style={{
              fontSize: 24,
              fontWeight: 700,
              color: "var(--text)",
              margin: 0,
            }}
          >
            내 콘텐츠
          </h1>
          <Link
            href="/studio/contents/new"
            className="btn-grad"
            style={{
              padding: "8px 20px",
              borderRadius: "var(--r-sm)",
              fontSize: 14,
              fontWeight: 600,
              textDecoration: "none",
              color: "#fff",
            }}
          >
            새 콘텐츠
          </Link>
        </div>

        {/* Status filter pills */}
        <div
          style={{
            display: "flex",
            gap: 8,
            marginBottom: 24,
          }}
        >
          {STATUS_FILTERS.map((f) => {
            const active = filter === f.value;
            return (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                style={{
                  padding: "6px 16px",
                  borderRadius: 9999,
                  fontSize: 13,
                  fontWeight: active ? 600 : 400,
                  border: "1px solid",
                  borderColor: active ? "var(--accent)" : "var(--line)",
                  background: active
                    ? "color-mix(in srgb, var(--accent) 15%, transparent)"
                    : "transparent",
                  color: active ? "var(--accent)" : "var(--muted)",
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
              >
                {f.label}
              </button>
            );
          })}
        </div>

        {/* Loading / Error */}
        {loading && (
          <p style={{ color: "var(--muted)" }}>불러오는 중...</p>
        )}
        {error && <p style={{ color: "#f44" }}>{error}</p>}

        {/* Content table */}
        {!loading && !error && (
          <div
            style={{
              background: "var(--panel)",
              border: "1px solid var(--line)",
              borderRadius: "var(--r)",
              overflow: "hidden",
            }}
          >
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: 14,
              }}
            >
              <thead>
                <tr
                  style={{
                    borderBottom: "1px solid var(--line)",
                    textAlign: "left",
                  }}
                >
                  {["제목", "타입", "상태", "비디오", "날짜", "액션"].map(
                    (h) => (
                      <th
                        key={h}
                        style={{
                          padding: "10px 14px",
                          fontWeight: 600,
                          color: "var(--muted)",
                          fontSize: 12,
                          textTransform: "uppercase",
                          letterSpacing: 0.5,
                        }}
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      style={{
                        padding: 32,
                        textAlign: "center",
                        color: "var(--muted)",
                      }}
                    >
                      콘텐츠가 없습니다.
                    </td>
                  </tr>
                ) : (
                  filtered.map((c) => (
                    <tr
                      key={c.contentId}
                      style={{ borderBottom: "1px solid var(--line2)" }}
                    >
                      <td
                        style={{
                          padding: "10px 14px",
                          color: "var(--text)",
                          fontWeight: 500,
                          maxWidth: 280,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {c.title}
                      </td>
                      <td
                        style={{
                          padding: "10px 14px",
                          color: "var(--muted)",
                        }}
                      >
                        {c.contentType}
                      </td>
                      <td style={{ padding: "10px 14px" }}>
                        <span style={statusBadgeStyle(c.status)}>
                          {c.status}
                        </span>
                      </td>
                      <td style={{ padding: "10px 14px" }}>
                        {videoStatusLabel(c.videoAssetStatus)}
                      </td>
                      <td
                        style={{
                          padding: "10px 14px",
                          color: "var(--muted)",
                          fontSize: 13,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {new Date(c.createdAt).toLocaleDateString("ko-KR")}
                      </td>
                      <td style={{ padding: "10px 14px" }}>
                        <div style={{ display: "flex", gap: 6 }}>
                          <Link
                            href={`/studio/contents/${c.contentId}/edit`}
                            style={{
                              ...actionBtnStyle,
                              textDecoration: "none",
                              display: "inline-block",
                            }}
                          >
                            편집
                          </Link>
                          {(c.status === "PUBLISHED" ||
                            c.status === "UNLISTED") && (
                            <button
                              onClick={() =>
                                handleStatusToggle(c.contentId, c.status)
                              }
                              style={actionBtnStyle}
                            >
                              {c.status === "PUBLISHED"
                                ? "비공개"
                                : "공개"}
                            </button>
                          )}
                          <button
                            onClick={() =>
                              handleDelete(c.contentId, c.title)
                            }
                            style={{
                              ...actionBtnStyle,
                              color: "#ef4444",
                              borderColor: "rgba(239,68,68,.3)",
                            }}
                          >
                            삭제
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
