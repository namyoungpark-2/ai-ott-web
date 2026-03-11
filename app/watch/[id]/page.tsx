"use client";

import { getThumbnailUrl } from "@/app/lib/url";
import Hls from "hls.js";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { BASE_URL } from "../../constants";

type Content = {
  id: string;
  title: string;
  status: "PROCESSING" | "READY" | "FAILED";
  streamUrl?: string | null;
  thumbnailUrl?: string | null;
  errorMessage?: string | null;
};

function getOrCreate(key: string) {
  const v = localStorage.getItem(key);
  if (v) return v;
  const nv = crypto.randomUUID();
  localStorage.setItem(key, nv);
  return nv;
}

async function sendWatchEvent(payload: any) {
  try {
    await fetch("/api/watch-events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    });
  } catch {
    // POC: 실패 무시 (나중에 queue/retry)
  }
}

export default function WatchPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);

  const [content, setContent] = useState<Content | null>(null);
  const [, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showUI, setShowUI] = useState(true);

  // 1) 콘텐츠 폴링
  useEffect(() => {
    if (!id) return;
    let alive = true;

    async function tick() {
      try {
        const res = await fetch(`/api/contents/${id}?lang=en`);

        if (!res.ok) {
          setTimeout(tick, 1500);
          return;
        }
        const data = await res.json();

        const normalized: Content = {
          id: data.id,
          title: data.title ?? "Untitled",
          status: data.status,
          streamUrl: data.streamUrl ?? null,
          thumbnailUrl: data.thumbnailUrl ?? null,
          errorMessage: data.errorMessage ?? null,
        };

        if (!alive) return;
        setContent(normalized);

        if (normalized.status === "READY") setIsReady(true);
        if (normalized.status === "PROCESSING") setTimeout(tick, 1500);
      } catch (error) {
        console.error("Failed to fetch content:", error);
        setTimeout(tick, 1500);
      }
    }

    tick();
    return () => {
      alive = false;
    };
  }, [id]);

  // 2) HLS attach (READY 되었을 때)
  useEffect(() => {
    if (!content || content.status !== "READY") return;
    if (!videoRef.current || !content.streamUrl) return;
    const src = content.streamUrl ? getThumbnailUrl(content.streamUrl, BASE_URL) : null;
    if (!src) return;
    const video = videoRef.current;

    // iOS/Safari는 native HLS
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src;
      return;
    }

    if (Hls.isSupported()) {
      // 기존 인스턴스 정리
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }

      const hls = new Hls();
      hlsRef.current = hls;
      hls.loadSource(src);
      hls.attachMedia(video);

      return () => {
        hls.destroy();
        hlsRef.current = null;
      };
    }
  }, [content]);

  // 3) 재생 상태 감지
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);

    v.addEventListener("play", onPlay);
    v.addEventListener("pause", onPause);
    return () => {
      v.removeEventListener("play", onPlay);
      v.removeEventListener("pause", onPause);
    };
  }, []);

  // 4) 마우스 움직이면 UI 보이기, 잠시 후 숨기기
  useEffect(() => {
    if (!isPlaying) {
      setShowUI(true);
      return;
    }
    let timer: any;

    const bump = () => {
      setShowUI(true);
      clearTimeout(timer);
      timer = setTimeout(() => setShowUI(false), 1800);
    };

    window.addEventListener("mousemove", bump);
    window.addEventListener("touchstart", bump);

    bump();
    return () => {
      clearTimeout(timer);
      window.removeEventListener("mousemove", bump);
      window.removeEventListener("touchstart", bump);
    };
  }, [isPlaying]);

  // 5) 단축키 처리
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const v = videoRef.current;
      if (!v) return;
  
      // input에서 타이핑 중이면 단축키 무시
      const tag = (e.target as HTMLElement | null)?.tagName?.toLowerCase();
      if (tag === "input" || tag === "textarea") return;
  
      // Space: play/pause
      if (e.code === "Space") {
        e.preventDefault();
          if (e.repeat) return;
        if (v.paused) v.play().catch(() => {});
        else v.pause();
      }
  
      // ←/→: 5초 이동
      if (e.code === "ArrowLeft") {
        e.preventDefault();
        v.currentTime = Math.max(0, v.currentTime - 5);
      }
      if (e.code === "ArrowRight") {
        e.preventDefault();
        v.currentTime = Math.min(v.duration || Number.MAX_SAFE_INTEGER, v.currentTime + 5);
      }
    };
  
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);
  
  // 6) 재생 이벤트 전송
  useEffect(() => {
    if (!content || content.status !== "READY") return;
    const v = videoRef.current;
    if (!v) return;
  
    const deviceId = getOrCreate("ott_device_id");
    const sessionId = getOrCreate("ott_session_id"); // 탭/세션 단위로 새로 만들고 싶으면 다른 전략으로
  
    const contentId = content.id;
    // 백엔드 DTO에는 videoAssetId가 optional이니, 지금 watch 응답에 없으면 null로 둠
    const videoAssetId = null;
  
    const basePayload = {
      clientEventId: "",
      occurredAt: "",
      contentId,
      videoAssetId,
      sessionId,
      deviceId,
      country: "KR",
      player: "ott-web",
      appVersion: "0.1.0",
      networkType: (navigator as any)?.connection?.effectiveType ?? null,
      extra: {},
    };
  
    const nowIso = () => new Date().toISOString();
  
    const mkId = () => crypto.randomUUID();
  
    const onPlay = () => {
      sendWatchEvent({
        ...basePayload,
        clientEventId: mkId(),
        occurredAt: nowIso(),
        eventType: "PLAY",
        positionMs: Math.floor(v.currentTime * 1000),
        deltaMs: 0,
        durationMs: isFinite(v.duration) ? Math.floor(v.duration * 1000) : null,
        playbackRate: v.playbackRate ?? 1.0,
      });
    };
  
    const onPause = () => {
      sendWatchEvent({
        ...basePayload,
        clientEventId: mkId(),
        occurredAt: nowIso(),
        eventType: "PAUSE",
        positionMs: Math.floor(v.currentTime * 1000),
        deltaMs: 0,
        durationMs: isFinite(v.duration) ? Math.floor(v.duration * 1000) : null,
        playbackRate: v.playbackRate ?? 1.0,
      });
    };
  
    const onEnded = () => {
      sendWatchEvent({
        ...basePayload,
        clientEventId: mkId(),
        occurredAt: nowIso(),
        eventType: "COMPLETE",
        positionMs: Math.floor(v.currentTime * 1000),
        deltaMs: 0,
        durationMs: isFinite(v.duration) ? Math.floor(v.duration * 1000) : null,
        playbackRate: v.playbackRate ?? 1.0,
      });
    };
  
    v.addEventListener("play", onPlay);
    v.addEventListener("pause", onPause);
    v.addEventListener("ended", onEnded);
  
    // HEARTBEAT: 10초마다 watch time 적재
    let lastPosMs = 0;
    const timer = setInterval(() => {
      if (v.paused || v.ended) return;
      const posMs = Math.floor(v.currentTime * 1000);
      const deltaMs = Math.max(0, posMs - lastPosMs);
      lastPosMs = posMs;
  
      sendWatchEvent({
        ...basePayload,
        clientEventId: mkId(),
        occurredAt: nowIso(),
        eventType: "HEARTBEAT",
        positionMs: posMs,
        deltaMs,
        durationMs: isFinite(v.duration) ? Math.floor(v.duration * 1000) : null,
        playbackRate: v.playbackRate ?? 1.0,
      });
    }, 10_000);
  
    return () => {
      clearInterval(timer);
      v.removeEventListener("play", onPlay);
      v.removeEventListener("pause", onPause);
      v.removeEventListener("ended", onEnded);
    };
  }, [content]);
  
  async function onClickPlay() {
    const v = videoRef.current;
    if (!v) return;
    try {
      await v.play();
    } catch {
      // 자동재생 제한 등으로 실패할 수 있음
    }
  }

  function onToggleFullscreen() {
    const el = document.getElementById("player-root");
    if (!el) return;

    const doc: any = document;
    if (!doc.fullscreenElement) {
      (el as any).requestFullscreen?.();
    } else {
      doc.exitFullscreen?.();
    }
  }

  // const thumb = content?.thumbnailUrl ? content.thumbnailUrl : null;
  const thumbUrl = content?.thumbnailUrl ? getThumbnailUrl(content.thumbnailUrl, BASE_URL) : null;

  return (
    <main style={{ minHeight: "100vh" }}>
      {/* 상단 간단 내비 */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 20,
          padding: "14px 18px",
          display: "flex",
          alignItems: "center",
          gap: 12,
          pointerEvents: showUI ? "auto" : "none",
          opacity: showUI ? 1 : 0,
          transition: "opacity .18s ease",
          background:
            "linear-gradient(to bottom, rgba(0,0,0,.65), rgba(0,0,0,.12), transparent)",
        }}
      >
        <a href="/" style={{ fontWeight: 800, color: "rgba(255,255,255,.92)" }}>
          ← Back
        </a>
        <div style={{ flex: 1 }} />
        <button onClick={onToggleFullscreen}>Fullscreen</button>
      </div>

      {/* 플레이어 루트 */}
      <section
        id="player-root"
        onDoubleClick={onToggleFullscreen}
        style={{
          height: "100vh",
          width: "100%",
          display: "grid",
          placeItems: "center",
          background: "#000",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* 배경(썸네일 블러) */}
        {thumbUrl ? (
          <img
            src={thumbUrl}
            alt=""
            aria-hidden
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              filter: "blur(22px) saturate(1.15) brightness(.55)",
              transform: "scale(1.06)",
              opacity: isPlaying ? 0.25 : 0.45,
              transition: "opacity .25s ease",
            }}
          />
        ) : null}

        {/* 실제 비디오 */}
        <video
          ref={videoRef}
          controls
          playsInline
          style={{
            width: "min(1200px, 92vw)",
            maxHeight: "72vh",
            borderRadius: 18,
            background: "#000",
            boxShadow: "0 18px 60px rgba(0,0,0,.55)",
            position: "relative",
            zIndex: 2,
          }}
        />

        {/* 오버레이(타이틀/상태/플레이 버튼) */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 3,
            display: "grid",
            placeItems: "center",
            pointerEvents: isPlaying ? "none" : "auto",
          }}
        >
          {/* READY 전: 상태 카드 */}
          {content?.status === "PROCESSING" ? (
            <div
              style={{
                width: "min(520px, 92vw)",
                padding: 18,
                borderRadius: 16,
                border: "1px solid rgba(255,255,255,.10)",
                background: "rgba(0,0,0,.55)",
                backdropFilter: "blur(10px)",
              }}
            >
              <div style={{ fontSize: 12, color: "rgba(255,255,255,.70)" }}>Encoding…</div>
              <div style={{ fontSize: 20, fontWeight: 900, marginTop: 6 }}>
                {content.title ?? "Untitled"}
              </div>
              <div style={{ marginTop: 10, color: "rgba(255,255,255,.75)", fontSize: 13 }}>
                잠시만 기다려줘. HLS로 변환 중이야.
              </div>
              <div style={{ marginTop: 12, height: 8, borderRadius: 999, background: "rgba(255,255,255,.10)" }}>
                <div
                  style={{
                    width: "45%",
                    height: "100%",
                    borderRadius: 999,
                    background: "rgba(109,94,252,.55)",
                    animation: "p 1.2s ease-in-out infinite alternate",
                  }}
                />
              </div>
              <style>{`@keyframes p { from { width: 25% } to { width: 70% } }`}</style>
            </div>
          ) : null}

          {/* FAILED */}
          {content?.status === "FAILED" ? (
            <div
              style={{
                width: "min(520px, 92vw)",
                padding: 18,
                borderRadius: 16,
                border: "1px solid rgba(255,255,255,.10)",
                background: "rgba(0,0,0,.55)",
                backdropFilter: "blur(10px)",
              }}
            >
              <div style={{ fontSize: 12, color: "rgba(255,255,255,.70)" }}>Failed</div>
              <div style={{ fontSize: 20, fontWeight: 900, marginTop: 6 }}>
                {content.title ?? "Untitled"}
              </div>
              <div style={{ marginTop: 10, color: "rgba(255,255,255,.75)", fontSize: 13 }}>
                {content.errorMessage ?? "Unknown error"}
              </div>
            </div>
          ) : null}

          {content?.status === "READY" && !isPlaying ? (
            <div
              onClick={onClickPlay}                      // ✅ 추가
              role="button"                              // ✅ 추가(접근성)
              aria-label="Play video"                    // ✅ 추가(접근성)
              style={{
                position: "absolute",
                inset: 0,
                display: "grid",
                placeItems: "end start",
                padding: 22,
                cursor: "pointer",                       // ✅ 추가(클릭 가능 느낌)
                background:
                  "linear-gradient(to top, rgba(0,0,0,.72), rgba(0,0,0,.20), transparent)",
              }}
            >
              <div style={{ width: "min(820px, 92vw)" }}>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,.72)" }}>Now Playing</div>
                <div
                  style={{
                    fontSize: 34,
                    fontWeight: 950,
                    lineHeight: 1.05,
                    letterSpacing: -0.2,
                    marginTop: 6,
                  }}
                >
                  {content.title ?? "Untitled"}
                </div>

                <div style={{ marginTop: 14, display: "flex", gap: 12, alignItems: "center" }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();   // ✅ 추가
                      onClickPlay();
                    }}
                    style={{
                      padding: "12px 14px",
                      borderRadius: 12,
                      background: "rgba(109,94,252,.22)",
                      borderColor: "rgba(109,94,252,.50)",
                      fontWeight: 800,
                    }}
                  >
                    ▶ Play
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();   // ✅ 추가
                      onToggleFullscreen();
                    }}
                  >Fullscreen</button>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* 하단 UI 힌트 (재생 중이면 숨김) */}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 10,
            padding: "18px",
            pointerEvents: "none",
            opacity: showUI && isPlaying ? 1 : 0,
            transition: "opacity .18s ease",
            background:
              "linear-gradient(to top, rgba(0,0,0,.65), rgba(0,0,0,.10), transparent)",
          }}
        >
          <div style={{ maxWidth: 1200, margin: "0 auto", color: "rgba(255,255,255,.75)", fontSize: 12 }}>
            Tip: 마우스를 움직이면 컨트롤이 나타나고 잠시 후 숨겨져.
          </div>
        </div>
      </section>
    </main>
  );
}
