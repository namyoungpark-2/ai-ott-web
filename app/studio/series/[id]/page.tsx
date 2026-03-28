"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import StudioLayout from "@/components/studio/StudioLayout";
import { StatusBadge, VideoStatusBadge } from "@/components/studio/StatusBadge";
import { useLocale } from "@/components/LocaleProvider";
import type {
  CreatorSeries,
  CreatorContent,
  UpdateSeriesPayload,
} from "@/types/channel";

// ─── Inner content (rendered inside StudioLayout) ───────────────────────────

function SeriesDetailContent() {
  const params = useParams();
  const id = params.id as string;
  const { locale } = useLocale();

  const [series, setSeries] = useState<CreatorSeries | null>(null);
  const [episodes, setEpisodes] = useState<CreatorContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Inline edit state
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [seriesRes, contentsRes] = await Promise.all([
        fetch(`/api/creator/series?lang=${locale}`, {
          credentials: "include",
          cache: "no-store",
        }),
        fetch(`/api/creator/contents?lang=${locale}&limit=100`, {
          credentials: "include",
          cache: "no-store",
        }),
      ]);

      if (!seriesRes.ok) throw new Error("시리즈 정보를 불러올 수 없습니다.");
      if (!contentsRes.ok)
        throw new Error("에피소드 목록을 불러올 수 없습니다.");

      const seriesList: CreatorSeries[] = await seriesRes.json();
      const found = seriesList.find((s) => s.seriesId === id) ?? null;
      setSeries(found);

      if (found) {
        setEditTitle(found.title);
        setEditDescription(found.description ?? "");
        setDirty(false);
      }

      const contentsData = await contentsRes.json();
      const allContents: CreatorContent[] = Array.isArray(contentsData)
        ? contentsData
        : contentsData.contents ?? [];
      // Filter to EPISODE type only (cannot filter by seriesId from API — known limitation)
      setEpisodes(allContents.filter((c) => c.contentType === "EPISODE"));
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "데이터를 불러올 수 없습니다.",
      );
    } finally {
      setLoading(false);
    }
  }, [id, locale]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const [seriesRes, contentsRes] = await Promise.all([
          fetch(`/api/creator/series?lang=${locale}`, {
            credentials: "include",
            cache: "no-store",
          }),
          fetch(`/api/creator/contents?lang=${locale}&limit=100`, {
            credentials: "include",
            cache: "no-store",
          }),
        ]);

        if (!seriesRes.ok)
          throw new Error("시리즈 정보를 불러올 수 없습니다.");
        if (!contentsRes.ok)
          throw new Error("에피소드 목록을 불러올 수 없습니다.");

        const seriesList: CreatorSeries[] = await seriesRes.json();
        const found = seriesList.find((s) => s.seriesId === id) ?? null;

        const contentsData = await contentsRes.json();
        const allContents: CreatorContent[] = Array.isArray(contentsData)
          ? contentsData
          : contentsData.contents ?? [];

        if (!cancelled) {
          setSeries(found);
          if (found) {
            setEditTitle(found.title);
            setEditDescription(found.description ?? "");
            setDirty(false);
          }
          setEpisodes(allContents.filter((c) => c.contentType === "EPISODE"));
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "데이터를 불러올 수 없습니다.",
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
  }, [id, locale]);

  /* ── Save series ── */
  async function handleSave() {
    if (!editTitle.trim()) return;
    setSaving(true);

    const payload: UpdateSeriesPayload = {
      title: editTitle.trim(),
      description: editDescription.trim() || undefined,
      lang: locale,
    };

    try {
      const res = await fetch(`/api/creator/series/${id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("시리즈 저장에 실패했습니다.");
      setDirty(false);
      await fetchData();
    } catch (err) {
      alert(
        err instanceof Error ? err.message : "시리즈 저장에 실패했습니다.",
      );
    } finally {
      setSaving(false);
    }
  }

  /* ── Loading skeleton ── */
  if (loading) {
    return (
      <div>
        <div
          style={{
            height: 20,
            width: "30%",
            background: "var(--panel2)",
            borderRadius: "var(--r-sm)",
            marginBottom: 16,
            animation: "pulse 1.5s ease-in-out infinite",
          }}
        />
        <div
          style={{
            height: 14,
            width: "50%",
            background: "var(--panel2)",
            borderRadius: "var(--r-sm)",
            marginBottom: 32,
            animation: "pulse 1.5s ease-in-out infinite",
          }}
        />
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            style={{
              height: 48,
              background: "var(--panel2)",
              borderRadius: "var(--r-sm)",
              marginBottom: 8,
              animation: "pulse 1.5s ease-in-out infinite",
            }}
          />
        ))}
        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.4; }
          }
        `}</style>
      </div>
    );
  }

  /* ── Error ── */
  if (error) {
    return (
      <div
        style={{
          background: "var(--panel)",
          border: "1px solid var(--line)",
          borderRadius: "var(--r)",
          padding: 32,
          textAlign: "center",
        }}
      >
        <p style={{ color: "#f44", marginBottom: 12 }}>{error}</p>
        <button
          onClick={fetchData}
          style={{
            padding: "8px 20px",
            borderRadius: "var(--r-sm)",
            fontSize: 14,
            fontWeight: 500,
            color: "var(--text)",
            background: "var(--panel2)",
            border: "1px solid var(--line)",
            cursor: "pointer",
          }}
        >
          다시 시도
        </button>
      </div>
    );
  }

  /* ── Not found ── */
  if (!series) {
    return (
      <div
        style={{
          background: "var(--panel)",
          border: "1px solid var(--line)",
          borderRadius: "var(--r)",
          padding: "48px 20px",
          textAlign: "center",
        }}
      >
        <p
          style={{
            fontSize: 16,
            color: "var(--text)",
            margin: "0 0 16px",
          }}
        >
          시리즈를 찾을 수 없습니다
        </p>
        <Link
          href="/studio/series"
          style={{
            color: "var(--accent)",
            fontSize: 14,
            textDecoration: "none",
          }}
        >
          &larr; 시리즈 목록으로 돌아가기
        </Link>
      </div>
    );
  }

  /* ── Main content ── */
  return (
    <div>
      {/* Back link */}
      <Link
        href="/studio/series"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 4,
          color: "var(--muted)",
          fontSize: 13,
          textDecoration: "none",
          marginBottom: 20,
          transition: "color 0.15s",
        }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.color = "var(--accent)")
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.color = "var(--muted)")
        }
      >
        &larr; 시리즈 목록
      </Link>

      {/* ── A) Series header / editable ── */}
      <div
        style={{
          background: "var(--panel)",
          border: "1px solid var(--line)",
          borderRadius: "var(--r)",
          padding: 24,
          marginBottom: 28,
        }}
      >
        <div style={{ marginBottom: 16 }}>
          <label
            style={{
              display: "block",
              fontSize: 13,
              fontWeight: 500,
              color: "var(--muted)",
              marginBottom: 6,
            }}
          >
            제목
          </label>
          <input
            type="text"
            value={editTitle}
            onChange={(e) => {
              setEditTitle(e.target.value);
              setDirty(true);
            }}
            style={{
              width: "100%",
              padding: "10px 14px",
              background: "var(--bg2)",
              border: "1px solid var(--line)",
              borderRadius: "var(--r-sm)",
              color: "var(--text)",
              fontSize: 16,
              fontWeight: 600,
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label
            style={{
              display: "block",
              fontSize: 13,
              fontWeight: 500,
              color: "var(--muted)",
              marginBottom: 6,
            }}
          >
            설명
          </label>
          <textarea
            value={editDescription}
            onChange={(e) => {
              setEditDescription(e.target.value);
              setDirty(true);
            }}
            rows={3}
            placeholder="시리즈 설명 (선택)"
            style={{
              width: "100%",
              padding: "10px 14px",
              background: "var(--bg2)",
              border: "1px solid var(--line)",
              borderRadius: "var(--r-sm)",
              color: "var(--text)",
              fontSize: 14,
              outline: "none",
              resize: "vertical",
              boxSizing: "border-box",
              fontFamily: "inherit",
            }}
          />
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span style={{ fontSize: 13, color: "var(--muted)" }}>
            {series.episodeCount}개 에피소드
          </span>

          <button
            className="btn-grad"
            onClick={handleSave}
            disabled={saving || !editTitle.trim() || !dirty}
            style={{
              padding: "8px 20px",
              borderRadius: "var(--r-sm)",
              fontSize: 14,
              fontWeight: 600,
              color: "#fff",
              border: "none",
              cursor:
                saving || !editTitle.trim() || !dirty
                  ? "not-allowed"
                  : "pointer",
              opacity: saving || !editTitle.trim() || !dirty ? 0.6 : 1,
            }}
          >
            {saving ? "저장 중..." : "저장"}
          </button>
        </div>
      </div>

      {/* ── B) Episode list ── */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <h2
          style={{
            fontSize: 18,
            fontWeight: 600,
            color: "var(--text)",
            margin: 0,
          }}
        >
          에피소드
        </h2>

        {/* C) Add episode button */}
        <Link
          href={`/studio/contents/new?seriesId=${id}`}
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
          + 에피소드 추가
        </Link>
      </div>

      {episodes.length === 0 ? (
        <div
          style={{
            background: "var(--panel)",
            border: "1px solid var(--line)",
            borderRadius: "var(--r)",
            padding: "48px 20px",
            textAlign: "center",
          }}
        >
          <p style={{ color: "var(--muted)", fontSize: 15, margin: 0 }}>
            아직 에피소드가 없습니다. 에피소드를 추가해보세요.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {episodes.map((ep) => (
            <Link
              key={ep.contentId}
              href={`/studio/contents/${ep.contentId}/edit`}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                padding: "12px 16px",
                background: "var(--panel)",
                border: "1px solid var(--line)",
                borderRadius: "var(--r-sm)",
                textDecoration: "none",
                color: "inherit",
                transition: "border-color 0.15s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.borderColor = "var(--accent)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.borderColor = "var(--line)")
              }
            >
              {/* Thumbnail */}
              <div
                style={{
                  width: 64,
                  height: 36,
                  borderRadius: 4,
                  overflow: "hidden",
                  background: "var(--panel2)",
                  flexShrink: 0,
                }}
              >
                {ep.thumbnailUrl ? (
                  <img
                    src={ep.thumbnailUrl}
                    alt={ep.title}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 16,
                      color: "var(--muted)",
                    }}
                  >
                    🎬
                  </div>
                )}
              </div>

              {/* Title */}
              <div
                style={{
                  flex: 1,
                  minWidth: 0,
                  fontSize: 14,
                  fontWeight: 500,
                  color: "var(--text)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {ep.title}
              </div>

              {/* Status badges */}
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  alignItems: "center",
                  flexShrink: 0,
                }}
              >
                <StatusBadge status={ep.status} />
                <VideoStatusBadge status={ep.videoAssetStatus} />
              </div>

              {/* Date */}
              <span
                style={{
                  fontSize: 13,
                  color: "var(--muted)",
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                }}
              >
                {new Date(ep.createdAt).toLocaleDateString("ko-KR")}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default function StudioSeriesDetailPage() {
  return (
    <StudioLayout>
      <SeriesDetailContent />
    </StudioLayout>
  );
}
