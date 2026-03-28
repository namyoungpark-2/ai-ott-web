"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import StudioSidebar from "@/components/studio/StudioSidebar";
import type { CreatorSeries, CreateContentPayload } from "@/types/channel";

type Mode = "MOVIE" | "EPISODE";

export default function StudioNewContentPage() {
  const router = useRouter();

  const [mode, setMode] = useState<Mode>("MOVIE");
  const [title, setTitle] = useState("");
  const [seriesList, setSeriesList] = useState<CreatorSeries[]>([]);
  const [seriesId, setSeriesId] = useState<string>("");
  const [newSeriesTitle, setNewSeriesTitle] = useState("");
  const [seasonNumber, setSeasonNumber] = useState(1);
  const [episodeNumber, setEpisodeNumber] = useState(1);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // After creation
  const [contentId, setContentId] = useState<string | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadState, setUploadState] = useState<
    "idle" | "uploading" | "done" | "error"
  >("idle");
  const [uploadError, setUploadError] = useState<string | null>(null);

  const isNewSeries = seriesId === "__new__";

  // Fetch series list for EPISODE mode
  useEffect(() => {
    let cancelled = false;

    async function fetchSeries() {
      try {
        const res = await fetch("/api/creator/series?lang=ko", {
          credentials: "include",
          cache: "no-store",
        });
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled) {
          setSeriesList(Array.isArray(data) ? data : data.series ?? []);
        }
      } catch {
        // silently ignore; user can still create new series
      }
    }

    fetchSeries();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setSubmitting(true);
    setSubmitError(null);

    const payload: CreateContentPayload = {
      mode,
      title: title.trim(),
    };

    if (mode === "EPISODE") {
      payload.seasonNumber = seasonNumber;
      payload.episodeNumber = episodeNumber;
      if (isNewSeries) {
        payload.seriesTitle = newSeriesTitle.trim() || undefined;
      } else if (seriesId) {
        payload.seriesId = seriesId;
      }
    }

    try {
      const res = await fetch("/api/creator/contents", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "콘텐츠 생성에 실패했습니다.");
      }
      const data = await res.json();
      const createdId = data.contentId ?? data.id;
      if (createdId) {
        setContentId(createdId);
      } else {
        router.push("/studio/contents");
      }
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "콘텐츠 생성에 실패했습니다.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpload = async () => {
    if (!uploadFile || !contentId) return;

    setUploadState("uploading");
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append("file", uploadFile);
      const res = await fetch(`/api/admin/contents/${contentId}/assets`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      if (!res.ok) throw new Error("업로드에 실패했습니다.");
      setUploadState("done");
    } catch (err) {
      setUploadState("error");
      setUploadError(
        err instanceof Error ? err.message : "업로드에 실패했습니다.",
      );
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 14px",
    fontSize: 14,
    background: "var(--bg2)",
    border: "1px solid var(--line)",
    borderRadius: "var(--r-sm)",
    color: "var(--text)",
    outline: "none",
    transition: "border-color 0.15s",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: 13,
    fontWeight: 600,
    color: "var(--muted)",
    marginBottom: 6,
  };

  const modeBtnStyle = (active: boolean): React.CSSProperties => ({
    flex: 1,
    padding: "10px 0",
    fontSize: 14,
    fontWeight: active ? 600 : 400,
    border: "1px solid",
    borderColor: active ? "var(--accent)" : "var(--line)",
    background: active
      ? "color-mix(in srgb, var(--accent) 15%, transparent)"
      : "transparent",
    color: active ? "var(--accent)" : "var(--muted)",
    cursor: "pointer",
    borderRadius: "var(--r-sm)",
    transition: "all 0.15s",
  });

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
        <h1
          style={{
            fontSize: 24,
            fontWeight: 700,
            color: "var(--text)",
            margin: "0 0 28px",
          }}
        >
          새 콘텐츠
        </h1>

        {/* Creation form */}
        {!contentId && (
          <div
            style={{
              background: "var(--panel)",
              border: "1px solid var(--line)",
              borderRadius: "var(--r)",
              padding: 28,
              maxWidth: 560,
            }}
          >
            <form onSubmit={handleSubmit}>
              {/* Mode selector */}
              <div style={{ marginBottom: 20 }}>
                <label style={labelStyle}>콘텐츠 유형</label>
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    type="button"
                    onClick={() => setMode("MOVIE")}
                    style={modeBtnStyle(mode === "MOVIE")}
                  >
                    단독 영상 (MOVIE)
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode("EPISODE")}
                    style={modeBtnStyle(mode === "EPISODE")}
                  >
                    에피소드 (EPISODE)
                  </button>
                </div>
              </div>

              {/* Title */}
              <div style={{ marginBottom: 20 }}>
                <label style={labelStyle}>제목</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="콘텐츠 제목을 입력하세요"
                  required
                  style={inputStyle}
                />
              </div>

              {/* Episode-specific fields */}
              {mode === "EPISODE" && (
                <>
                  {/* Series selector */}
                  <div style={{ marginBottom: 20 }}>
                    <label style={labelStyle}>시리즈</label>
                    <select
                      value={seriesId}
                      onChange={(e) => setSeriesId(e.target.value)}
                      style={{
                        ...inputStyle,
                        cursor: "pointer",
                        appearance: "auto",
                      }}
                    >
                      <option value="">시리즈 선택...</option>
                      {seriesList.map((s) => (
                        <option key={s.seriesId} value={s.seriesId}>
                          {s.title} ({s.episodeCount}편)
                        </option>
                      ))}
                      <option value="__new__">+ 새 시리즈 생성</option>
                    </select>
                  </div>

                  {/* New series title */}
                  {isNewSeries && (
                    <div style={{ marginBottom: 20 }}>
                      <label style={labelStyle}>새 시리즈 제목</label>
                      <input
                        type="text"
                        value={newSeriesTitle}
                        onChange={(e) => setNewSeriesTitle(e.target.value)}
                        placeholder="시리즈 제목을 입력하세요"
                        style={inputStyle}
                      />
                    </div>
                  )}

                  {/* Season / Episode numbers */}
                  <div
                    style={{
                      display: "flex",
                      gap: 16,
                      marginBottom: 20,
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <label style={labelStyle}>시즌</label>
                      <input
                        type="number"
                        min={1}
                        value={seasonNumber}
                        onChange={(e) =>
                          setSeasonNumber(Number(e.target.value) || 1)
                        }
                        style={inputStyle}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={labelStyle}>에피소드</label>
                      <input
                        type="number"
                        min={1}
                        value={episodeNumber}
                        onChange={(e) =>
                          setEpisodeNumber(Number(e.target.value) || 1)
                        }
                        style={inputStyle}
                      />
                    </div>
                  </div>
                </>
              )}

              {submitError && (
                <p
                  style={{
                    color: "#f44",
                    fontSize: 13,
                    marginBottom: 16,
                  }}
                >
                  {submitError}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting || !title.trim()}
                className="btn-grad"
                style={{
                  width: "100%",
                  padding: "10px 0",
                  borderRadius: "var(--r-sm)",
                  fontSize: 14,
                  fontWeight: 600,
                  color: "#fff",
                  border: "none",
                  cursor: submitting ? "not-allowed" : "pointer",
                  opacity: submitting ? 0.6 : 1,
                }}
              >
                {submitting ? "생성 중..." : "콘텐츠 생성"}
              </button>
            </form>
          </div>
        )}

        {/* Video upload section (after content creation) */}
        {contentId && (
          <div
            style={{
              background: "var(--panel)",
              border: "1px solid var(--line)",
              borderRadius: "var(--r)",
              padding: 28,
              maxWidth: 560,
            }}
          >
            <p
              style={{
                fontSize: 14,
                color: "var(--text)",
                marginBottom: 8,
                fontWeight: 600,
              }}
            >
              콘텐츠가 생성되었습니다.
            </p>
            <p
              style={{
                fontSize: 13,
                color: "var(--muted)",
                marginBottom: 20,
              }}
            >
              비디오 파일을 업로드하거나, 나중에 콘텐츠 목록에서 관리할 수
              있습니다.
            </p>

            {/* File drop area */}
            {uploadState !== "done" && (
              <>
                <label
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    padding: 32,
                    border: "2px dashed var(--line2)",
                    borderRadius: "var(--r)",
                    background: "var(--bg2)",
                    cursor: "pointer",
                    transition: "border-color 0.15s",
                    marginBottom: 16,
                  }}
                >
                  <span style={{ fontSize: 28 }}>&#x1F4C1;</span>
                  <span
                    style={{
                      fontSize: 13,
                      color: "var(--muted)",
                    }}
                  >
                    {uploadFile
                      ? uploadFile.name
                      : "클릭하여 비디오 파일을 선택하세요"}
                  </span>
                  <input
                    type="file"
                    accept="video/*"
                    style={{ display: "none" }}
                    onChange={(e) => {
                      const file = e.target.files?.[0] ?? null;
                      setUploadFile(file);
                      setUploadState("idle");
                      setUploadError(null);
                    }}
                  />
                </label>

                {uploadState === "error" && uploadError && (
                  <p
                    style={{
                      color: "#f44",
                      fontSize: 13,
                      marginBottom: 12,
                    }}
                  >
                    {uploadError}
                  </p>
                )}

                {uploadState === "uploading" && (
                  <p
                    style={{
                      color: "var(--accent)",
                      fontSize: 13,
                      marginBottom: 12,
                    }}
                  >
                    업로드 중...
                  </p>
                )}

                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    onClick={handleUpload}
                    disabled={!uploadFile || uploadState === "uploading"}
                    className="btn-grad"
                    style={{
                      padding: "8px 20px",
                      borderRadius: "var(--r-sm)",
                      fontSize: 14,
                      fontWeight: 600,
                      color: "#fff",
                      border: "none",
                      cursor:
                        !uploadFile || uploadState === "uploading"
                          ? "not-allowed"
                          : "pointer",
                      opacity:
                        !uploadFile || uploadState === "uploading" ? 0.5 : 1,
                    }}
                  >
                    업로드
                  </button>
                  <button
                    onClick={() => router.push("/studio/contents")}
                    style={{
                      padding: "8px 20px",
                      borderRadius: "var(--r-sm)",
                      fontSize: 14,
                      fontWeight: 500,
                      color: "var(--muted)",
                      background: "transparent",
                      border: "1px solid var(--line)",
                      cursor: "pointer",
                    }}
                  >
                    나중에 하기
                  </button>
                </div>
              </>
            )}

            {/* Upload done */}
            {uploadState === "done" && (
              <div>
                <p
                  style={{
                    color: "#22c55e",
                    fontSize: 14,
                    fontWeight: 600,
                    marginBottom: 16,
                  }}
                >
                  &#x2705; 업로드가 완료되었습니다.
                </p>
                <button
                  onClick={() => router.push("/studio/contents")}
                  className="btn-grad"
                  style={{
                    padding: "8px 20px",
                    borderRadius: "var(--r-sm)",
                    fontSize: 14,
                    fontWeight: 600,
                    color: "#fff",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  콘텐츠 목록으로 이동
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
