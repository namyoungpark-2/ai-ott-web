"use client";

import { FormEvent, useEffect, useState } from "react";
import { useLocale } from "@/components/LocaleProvider";
import { ThumbnailEditor } from "@/components/studio/ThumbnailEditor";
import type { CreatorContent, CreatorSeries } from "@/types/channel";

export type ContentFormData = {
  title: string;
  description: string;
  mode: "MOVIE" | "EPISODE";
  seriesId: string;
  newSeriesTitle: string;
  seasonNumber: number;
  episodeNumber: number;
  thumbnailUrl: string | null;
};

type ContentFormProps = {
  formMode: "create" | "edit";
  initialData?: CreatorContent | null;
  onSubmit: (data: ContentFormData) => void;
  submitting: boolean;
  submitLabel: string;
  error?: string | null;
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 14px",
  fontSize: 14,
  background: "var(--bg2)",
  border: "1px solid var(--line)",
  borderRadius: "var(--r-sm)",
  color: "var(--text)",
};

const labelStyle: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 600,
  color: "var(--muted)",
  marginBottom: 6,
};

export function ContentForm({
  formMode,
  initialData,
  onSubmit,
  submitting,
  submitLabel,
  error,
}: ContentFormProps) {
  const { locale } = useLocale();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [mode, setMode] = useState<"MOVIE" | "EPISODE">("MOVIE");
  const [seriesId, setSeriesId] = useState("");
  const [newSeriesTitle, setNewSeriesTitle] = useState("");
  const [seasonNumber, setSeasonNumber] = useState(1);
  const [episodeNumber, setEpisodeNumber] = useState(1);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);

  const [seriesList, setSeriesList] = useState<CreatorSeries[]>([]);

  // Initialize from initialData in edit mode
  useEffect(() => {
    if (formMode === "edit" && initialData) {
      setTitle(initialData.title);
      setMode(initialData.contentType);
      setThumbnailUrl(initialData.thumbnailUrl);
    }
  }, [formMode, initialData]);

  // Fetch series list for episode mode
  useEffect(() => {
    let cancelled = false;
    async function fetchSeries() {
      try {
        const res = await fetch(
          `/api/creator/series?lang=${encodeURIComponent(locale)}`,
        );
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled) {
          setSeriesList(Array.isArray(data) ? data : data.items ?? []);
        }
      } catch {
        // silently ignore
      }
    }
    fetchSeries();
    return () => {
      cancelled = true;
    };
  }, [locale]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit({
      title,
      description,
      mode,
      seriesId,
      newSeriesTitle,
      seasonNumber,
      episodeNumber,
      thumbnailUrl,
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{ display: "flex", flexDirection: "column", gap: 20 }}
    >
      {/* Title */}
      <div style={{ display: "flex", flexDirection: "column" }}>
        <label style={labelStyle}>제목</label>
        <input
          type="text"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={inputStyle}
          placeholder="콘텐츠 제목"
        />
      </div>

      {/* Description */}
      <div style={{ display: "flex", flexDirection: "column" }}>
        <label style={labelStyle}>설명</label>
        <textarea
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={{ ...inputStyle, resize: "vertical" }}
          placeholder="콘텐츠 설명"
        />
      </div>

      {/* Content type toggle — create mode only */}
      {formMode === "create" && (
        <div style={{ display: "flex", flexDirection: "column" }}>
          <label style={labelStyle}>콘텐츠 유형</label>
          <div style={{ display: "flex", flexDirection: "row", gap: 0 }}>
            {(["MOVIE", "EPISODE"] as const).map((t) => {
              const active = mode === t;
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => setMode(t)}
                  style={{
                    flex: 1,
                    padding: "10px 0",
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: "pointer",
                    border: active
                      ? "1px solid var(--accent)"
                      : "1px solid var(--line)",
                    background: active
                      ? "color-mix(in srgb, var(--accent) 12%, transparent)"
                      : "var(--bg2)",
                    color: active ? "var(--accent)" : "var(--muted)",
                    borderRadius:
                      t === "MOVIE"
                        ? "var(--r-sm) 0 0 var(--r-sm)"
                        : "0 var(--r-sm) var(--r-sm) 0",
                  }}
                >
                  {t === "MOVIE" ? "영화" : "에피소드"}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Episode fields — create mode + EPISODE only */}
      {formMode === "create" && mode === "EPISODE" && (
        <>
          {/* Series selector */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            <label style={labelStyle}>시리즈</label>
            <select
              value={seriesId}
              onChange={(e) => setSeriesId(e.target.value)}
              style={inputStyle}
            >
              <option value="">시리즈 선택</option>
              {seriesList.map((s) => (
                <option key={s.seriesId} value={s.seriesId}>
                  {s.title}
                </option>
              ))}
              <option value="__new__">+ 새 시리즈 만들기</option>
            </select>
          </div>

          {/* New series title */}
          {seriesId === "__new__" && (
            <div style={{ display: "flex", flexDirection: "column" }}>
              <label style={labelStyle}>새 시리즈 제목</label>
              <input
                type="text"
                value={newSeriesTitle}
                onChange={(e) => setNewSeriesTitle(e.target.value)}
                style={inputStyle}
                placeholder="시리즈 제목을 입력하세요"
              />
            </div>
          )}

          {/* Season number */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            <label style={labelStyle}>시즌</label>
            <input
              type="number"
              min={1}
              value={seasonNumber}
              onChange={(e) => setSeasonNumber(Number(e.target.value) || 1)}
              style={inputStyle}
            />
          </div>

          {/* Episode number */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            <label style={labelStyle}>에피소드</label>
            <input
              type="number"
              min={1}
              value={episodeNumber}
              onChange={(e) => setEpisodeNumber(Number(e.target.value) || 1)}
              style={inputStyle}
            />
          </div>
        </>
      )}

      {/* Thumbnail — edit mode only */}
      {formMode === "edit" && (
        <div style={{ display: "flex", flexDirection: "column" }}>
          <label style={labelStyle}>썸네일</label>
          <ThumbnailEditor
            currentUrl={thumbnailUrl}
            onUrlChange={setThumbnailUrl}
          />
        </div>
      )}

      {/* Error message */}
      {error && (
        <p style={{ color: "#ef4444", fontSize: 14, margin: 0 }}>{error}</p>
      )}

      {/* Submit button */}
      <button
        type="submit"
        className="btn-grad"
        disabled={submitting}
        style={{ width: "100%", padding: "12px 0", fontSize: 15 }}
      >
        {submitting ? "처리 중..." : submitLabel}
      </button>
    </form>
  );
}
