"use client";

import { useEffect, useRef, useState } from "react";
import { getThumbnailUrl } from "@/app/lib/url";
import { BASE_URL } from "@/app/constants";

// ─── Types ──────────────────────────────────────────────────────────────────

type VideoPreviewProps = {
  contentId: string;
  /** If provided, skip the fetch and use this URL directly */
  streamUrl?: string | null;
  thumbnailUrl?: string | null;
  /** Inline player (in edit page) or modal (in list page) */
  mode?: "inline" | "modal";
  style?: React.CSSProperties;
};

type ContentData = {
  streamUrl: string | null;
  thumbnailUrl: string | null;
  title: string;
  videoAssetStatus: string | null;
};

// ─── Helpers ────────────────────────────────────────────────────────────────

function loadHls(
  videoEl: HTMLVideoElement,
  src: string,
): { destroy: () => void } | null {
  // @ts-expect-error dynamic import check
  if (typeof window !== "undefined" && window.Hls) {
    // @ts-expect-error Hls is loaded globally or via import
    const hls = new window.Hls();
    hls.loadSource(src);
    hls.attachMedia(videoEl);
    return { destroy: () => hls.destroy() };
  }
  // Fallback: native HLS (Safari)
  if (videoEl.canPlayType("application/vnd.apple.mpegurl")) {
    videoEl.src = src;
    return null;
  }
  // Fallback: just set src (mp4 etc)
  videoEl.src = src;
  return null;
}

// ─── Inline Player ──────────────────────────────────────────────────────────

function InlinePlayer({
  contentId,
  streamUrl: propStreamUrl,
  thumbnailUrl,
}: {
  contentId: string;
  streamUrl?: string | null;
  thumbnailUrl?: string | null;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<{ destroy: () => void } | null>(null);
  const [data, setData] = useState<ContentData | null>(null);
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState(false);

  // Fetch content data if streamUrl not provided
  useEffect(() => {
    if (propStreamUrl !== undefined) {
      setData({
        streamUrl: propStreamUrl ?? null,
        thumbnailUrl: thumbnailUrl ?? null,
        title: "",
        videoAssetStatus: propStreamUrl ? "READY" : null,
      });
      return;
    }

    let cancelled = false;
    fetch(`/api/contents/${contentId}`, { credentials: "include" })
      .then(async (res) => {
        if (cancelled || !res.ok) return;
        const json = await res.json();
        if (!cancelled) {
          setData({
            streamUrl: json.streamUrl ?? null,
            thumbnailUrl: json.thumbnailUrl ?? json.posterUrl ?? null,
            title: json.title ?? "",
            videoAssetStatus: json.videoAssetStatus ?? null,
          });
        }
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [contentId, propStreamUrl, thumbnailUrl]);

  // Setup HLS when playing
  useEffect(() => {
    if (!playing || !data?.streamUrl || !videoRef.current) return;
    const resolved = getThumbnailUrl(data.streamUrl, BASE_URL);
    if (!resolved) return;
    hlsRef.current = loadHls(videoRef.current, resolved);
    videoRef.current.play().catch(() => {});

    return () => {
      hlsRef.current?.destroy();
      hlsRef.current = null;
    };
  }, [playing, data?.streamUrl]);

  const thumb = data?.thumbnailUrl
    ? getThumbnailUrl(data.thumbnailUrl, BASE_URL)
    : null;

  // No video available
  if (data && !data.streamUrl) {
    const statusMsg =
      data.videoAssetStatus === "TRANSCODING"
        ? "트랜스코딩 중입니다..."
        : data.videoAssetStatus === "UPLOADED"
          ? "업로드 완료 — 트랜스코딩 대기 중"
          : data.videoAssetStatus === "FAILED"
            ? "영상 처리에 실패했습니다."
            : "아직 업로드된 영상이 없습니다.";

    return (
      <div
        style={{
          aspectRatio: "16 / 9",
          background: "rgba(0,0,0,.4)",
          borderRadius: "var(--r)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 8,
        }}
      >
        <svg
          width="40"
          height="40"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--muted)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polygon points="5 3 19 12 5 21 5 3" />
        </svg>
        <span style={{ fontSize: 13, color: "var(--muted)" }}>{statusMsg}</span>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          aspectRatio: "16 / 9",
          background: "rgba(0,0,0,.4)",
          borderRadius: "var(--r)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--muted)",
          fontSize: 13,
        }}
      >
        영상 정보를 불러올 수 없습니다.
      </div>
    );
  }

  // Loading state
  if (!data) {
    return (
      <div
        style={{
          aspectRatio: "16 / 9",
          background: "rgba(255,255,255,.03)",
          borderRadius: "var(--r)",
          animation: "shimmer 1.6s ease-in-out infinite",
        }}
      />
    );
  }

  // Not playing yet — show thumbnail with play button
  if (!playing) {
    return (
      <div
        onClick={() => setPlaying(true)}
        style={{
          aspectRatio: "16 / 9",
          borderRadius: "var(--r)",
          overflow: "hidden",
          position: "relative",
          cursor: "pointer",
          background: "#000",
        }}
      >
        {thumb && (
          <img
            src={thumb}
            alt=""
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              opacity: 0.7,
            }}
          />
        )}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0,0,0,.3)",
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: "rgba(109,94,252,.85)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "transform .2s",
            }}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="#fff"
            >
              <polygon points="8 5 20 12 8 19" />
            </svg>
          </div>
        </div>
        <div
          style={{
            position: "absolute",
            bottom: 8,
            left: 10,
            fontSize: 11,
            color: "rgba(255,255,255,.6)",
            background: "rgba(0,0,0,.5)",
            padding: "2px 8px",
            borderRadius: 4,
          }}
        >
          미리보기
        </div>
      </div>
    );
  }

  // Playing
  return (
    <div
      style={{
        aspectRatio: "16 / 9",
        borderRadius: "var(--r)",
        overflow: "hidden",
        background: "#000",
        position: "relative",
      }}
    >
      <video
        ref={videoRef}
        controls
        style={{ width: "100%", height: "100%" }}
        playsInline
      />
      <button
        onClick={() => {
          setPlaying(false);
          if (videoRef.current) {
            videoRef.current.pause();
            videoRef.current.src = "";
          }
        }}
        style={{
          position: "absolute",
          top: 8,
          right: 8,
          background: "rgba(0,0,0,.6)",
          border: "none",
          borderRadius: "50%",
          width: 28,
          height: 28,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
          fontSize: 14,
        }}
      >
        ✕
      </button>
    </div>
  );
}

// ─── Modal Player ───────────────────────────────────────────────────────────

function ModalPlayer({
  contentId,
  onClose,
}: {
  contentId: string;
  onClose: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<{ destroy: () => void } | null>(null);
  const [data, setData] = useState<ContentData | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/contents/${contentId}`, { credentials: "include" })
      .then(async (res) => {
        if (cancelled || !res.ok) return;
        const json = await res.json();
        if (!cancelled) {
          setData({
            streamUrl: json.streamUrl ?? null,
            thumbnailUrl: json.thumbnailUrl ?? json.posterUrl ?? null,
            title: json.title ?? "",
            videoAssetStatus: json.videoAssetStatus ?? null,
          });
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [contentId]);

  useEffect(() => {
    if (!data?.streamUrl || !videoRef.current) return;
    const resolved = getThumbnailUrl(data.streamUrl, BASE_URL);
    if (!resolved) return;
    hlsRef.current = loadHls(videoRef.current, resolved);
    videoRef.current.play().catch(() => {});

    return () => {
      hlsRef.current?.destroy();
      hlsRef.current = null;
    };
  }, [data?.streamUrl]);

  // Close on escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        background: "rgba(0,0,0,.85)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 900,
          position: "relative",
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: -36,
            right: 0,
            background: "none",
            border: "none",
            color: "#fff",
            fontSize: 24,
            cursor: "pointer",
          }}
        >
          ✕
        </button>

        {/* Title */}
        {data?.title && (
          <div
            style={{
              color: "#fff",
              fontSize: 15,
              fontWeight: 600,
              marginBottom: 8,
            }}
          >
            {data.title}
          </div>
        )}

        {/* Video */}
        {!data ? (
          <div
            style={{
              aspectRatio: "16 / 9",
              background: "rgba(255,255,255,.05)",
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
            }}
          >
            불러오는 중...
          </div>
        ) : !data.streamUrl ? (
          <div
            style={{
              aspectRatio: "16 / 9",
              background: "rgba(255,255,255,.05)",
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--muted)",
              fontSize: 14,
            }}
          >
            재생 가능한 영상이 없습니다.
          </div>
        ) : (
          <div
            style={{
              aspectRatio: "16 / 9",
              borderRadius: 8,
              overflow: "hidden",
              background: "#000",
            }}
          >
            <video
              ref={videoRef}
              controls
              autoPlay
              playsInline
              style={{ width: "100%", height: "100%" }}
            />
          </div>
        )}

        {/* Watch page link */}
        {data?.streamUrl && (
          <div style={{ marginTop: 8, textAlign: "right" }}>
            <a
              href={`/watch/${contentId}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: "var(--accent)",
                fontSize: 13,
                textDecoration: "none",
              }}
            >
              전체 화면으로 보기 →
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Exports ────────────────────────────────────────────────────────────────

export { InlinePlayer, ModalPlayer };
export default InlinePlayer;
