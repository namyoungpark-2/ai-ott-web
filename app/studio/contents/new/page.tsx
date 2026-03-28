"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import StudioLayout from "@/components/studio/StudioLayout";
import { ContentForm, type ContentFormData } from "@/components/studio/ContentForm";
import { VideoUploader, formatSize } from "@/components/studio/VideoUploader";
import type { CreateContentPayload } from "@/types/channel";

type Phase = "select-video" | "fill-metadata" | "uploading" | "done" | "error";

function NewContentContent() {
  const router = useRouter();

  const [phase, setPhase] = useState<Phase>("select-video");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const handleFileSelect = useCallback((file: File) => {
    setVideoFile(file);
    setPhase("fill-metadata");
    setError(null);
  }, []);

  const handleSubmit = useCallback(
    async (data: ContentFormData) => {
      if (!videoFile) return;

      setSubmitting(true);
      setError(null);

      try {
        // Step A: Create content
        const payload: CreateContentPayload = {
          mode: data.mode,
          title: data.title,
          seriesTitle: data.newSeriesTitle || undefined,
          seriesId: data.seriesId || undefined,
          seasonNumber: data.seasonNumber,
          episodeNumber: data.episodeNumber,
        };

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

        const resData = await res.json();
        const contentId = resData.contentId ?? resData.id;

        if (!contentId) {
          throw new Error("콘텐츠 ID를 받지 못했습니다.");
        }

        // Step B: Upload video
        setSubmitting(false);
        setPhase("uploading");
        setProgress(0);

        const formData = new FormData();
        formData.append("file", videoFile);

        const xhr = new XMLHttpRequest();

        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            setProgress(Math.round((e.loaded / e.total) * 100));
          }
        };

        xhr.onload = () => {
          if (xhr.status < 300) {
            setPhase("done");
          } else {
            setError("업로드 실패");
            setPhase("error");
          }
        };

        xhr.onerror = () => {
          setError("네트워크 오류가 발생했습니다.");
          setPhase("error");
        };

        xhr.open("POST", `/api/creator/contents/${contentId}/upload`);
        xhr.withCredentials = true;
        xhr.send(formData);
      } catch (err) {
        setSubmitting(false);
        setError(
          err instanceof Error ? err.message : "콘텐츠 생성에 실패했습니다.",
        );
      }
    },
    [videoFile],
  );

  return (
    <div>
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

      {/* Phase 1: Video selection */}
      {phase === "select-video" && (
        <div style={{ maxWidth: 640 }}>
          <VideoUploader
            onFileSelect={handleFileSelect}
          />
        </div>
      )}

      {/* Phase 2: Metadata input */}
      {phase === "fill-metadata" && (
        <div style={{ maxWidth: 640 }}>
          {/* Video file info */}
          {videoFile && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "12px 16px",
                marginBottom: 20,
                background: "var(--panel)",
                border: "1px solid var(--line)",
                borderRadius: "var(--r)",
              }}
            >
              <div style={{ fontSize: 24 }}>🎬</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p
                  style={{
                    color: "var(--text)",
                    fontWeight: 500,
                    fontSize: 14,
                    margin: 0,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {videoFile.name}
                </p>
                <p
                  style={{
                    color: "var(--muted)",
                    fontSize: 12,
                    margin: 0,
                  }}
                >
                  {formatSize(videoFile.size)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setVideoFile(null);
                  setPhase("select-video");
                }}
                style={{
                  background: "var(--bg2)",
                  color: "var(--text)",
                  border: "1px solid var(--line)",
                  borderRadius: "var(--r-sm)",
                  padding: "6px 14px",
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                변경
              </button>
            </div>
          )}

          <div
            style={{
              background: "var(--panel)",
              border: "1px solid var(--line)",
              borderRadius: "var(--r)",
              padding: 28,
            }}
          >
            <ContentForm
              formMode="create"
              onSubmit={handleSubmit}
              submitting={submitting}
              submitLabel="업로드 & 생성"
              error={error}
            />
          </div>
        </div>
      )}

      {/* Phase 3: Uploading */}
      {phase === "uploading" && (
        <div
          style={{
            maxWidth: 640,
            background: "var(--panel)",
            border: "1px solid var(--line)",
            borderRadius: "var(--r)",
            padding: 28,
          }}
        >
          <p
            style={{
              color: "var(--text)",
              fontSize: 16,
              fontWeight: 600,
              marginBottom: 4,
            }}
          >
            업로드 중... {progress}%
          </p>
          {videoFile && (
            <p
              style={{
                color: "var(--muted)",
                fontSize: 13,
                marginBottom: 16,
              }}
            >
              {videoFile.name}
            </p>
          )}
          <div
            style={{
              height: 8,
              borderRadius: 4,
              background: "var(--bg2)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${progress}%`,
                background: "var(--accent)",
                borderRadius: 4,
                transition: "width .2s ease",
              }}
            />
          </div>
        </div>
      )}

      {/* Phase 4: Done */}
      {phase === "done" && (
        <div
          style={{
            maxWidth: 640,
            background: "var(--panel)",
            border: "1px solid rgba(34,197,94,.3)",
            borderRadius: "var(--r)",
            padding: 28,
            textAlign: "center",
          }}
        >
          <p
            style={{
              color: "#22c55e",
              fontSize: 18,
              fontWeight: 600,
              marginBottom: 16,
            }}
          >
            콘텐츠가 생성되고 업로드가 완료되었습니다!
          </p>
          <button
            onClick={() => router.push("/studio/contents")}
            className="btn-grad"
            style={{
              padding: "10px 28px",
              borderRadius: "var(--r-sm)",
              fontSize: 15,
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

      {/* Phase: Error */}
      {phase === "error" && (
        <div
          style={{
            maxWidth: 640,
            background: "var(--panel)",
            border: "1px solid rgba(239,68,68,.3)",
            borderRadius: "var(--r)",
            padding: 28,
            textAlign: "center",
          }}
        >
          <p
            style={{
              color: "#ef4444",
              fontSize: 16,
              fontWeight: 600,
              marginBottom: 16,
            }}
          >
            {error || "오류가 발생했습니다."}
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            <button
              onClick={() => {
                setPhase("fill-metadata");
                setError(null);
              }}
              style={{
                padding: "10px 24px",
                borderRadius: "var(--r-sm)",
                fontSize: 14,
                fontWeight: 500,
                color: "#ef4444",
                background: "rgba(239,68,68,.1)",
                border: "1px solid rgba(239,68,68,.3)",
                cursor: "pointer",
              }}
            >
              다시 시도
            </button>
            <button
              onClick={() => router.push("/studio/contents")}
              style={{
                padding: "10px 24px",
                borderRadius: "var(--r-sm)",
                fontSize: 14,
                fontWeight: 500,
                color: "var(--muted)",
                background: "transparent",
                border: "1px solid var(--line)",
                cursor: "pointer",
              }}
            >
              콘텐츠 목록으로
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function StudioNewContentPage() {
  return (
    <StudioLayout>
      <NewContentContent />
    </StudioLayout>
  );
}
