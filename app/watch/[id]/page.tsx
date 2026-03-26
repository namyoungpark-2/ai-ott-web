"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getThumbnailUrl } from "@/app/lib/url";
import { BASE_URL } from "@/app/constants";
import { AdProvider, useAds } from "@/components/ads/AdProvider";
import VideoAd from "@/components/ads/VideoAd";
import type { AdPhase, AdPlacement } from "@/types/ads";

// ── Hooks ────────────────────────────────────────────────────────────────────
import { useContentPolling } from "@/hooks/useContentPolling";
import { useHlsPlayer } from "@/hooks/useHlsPlayer";
import { usePlaybackState } from "@/hooks/usePlaybackState";
import { usePlayerUI } from "@/hooks/usePlayerUI";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useWatchEvents } from "@/hooks/useWatchEvents";
import { usePlaybackProgress } from "@/hooks/usePlaybackProgress";
import { useFullscreen } from "@/hooks/useFullscreen";
import { useVideoOrientation } from "@/hooks/useVideoOrientation";

// ── Player components ────────────────────────────────────────────────────────
import PlayerShell, { VideoContainer } from "@/components/player/PlayerShell";
import BlurredBackground from "@/components/player/BlurredBackground";
import PlayerTopBar from "@/components/player/PlayerTopBar";
import PlayerOverlay from "@/components/player/PlayerOverlay";
import PlayerBottomHint from "@/components/player/PlayerBottomHint";

// ── Related content type ─────────────────────────────────────────────────────
type RelatedItem = {
  id: string;
  title: string;
  posterUrl?: string | null;
  contentType?: string;
  episodeNumber?: number | null;
};

// ─────────────────────────────────────────────────────────────────────────────

function WatchPageInner() {
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const videoRef = useRef<HTMLVideoElement | null>(null);

  // ── Content polling ───────────────────────────────────────────────────────
  const { content } = useContentPolling(id);

  // ── Video orientation detection ───────────────────────────────────────────
  const { orientation, meta } = useVideoOrientation(videoRef, {
    initialWidth: content?.videoWidth,
    initialHeight: content?.videoHeight,
  });

  // ── HLS ───────────────────────────────────────────────────────────────────
  useHlsPlayer(videoRef, content);

  // ── Playback state ────────────────────────────────────────────────────────
  const isPlaying = usePlaybackState(videoRef);

  // ── UI visibility ─────────────────────────────────────────────────────────
  const showUI = usePlayerUI(isPlaying);

  // ── Fullscreen ────────────────────────────────────────────────────────────
  const { isFullscreen, toggle: toggleFullscreen } = useFullscreen(
    "player-root",
    orientation,
  );

  // ── Keyboard shortcuts ────────────────────────────────────────────────────
  const keyboardOptions = useMemo(
    () => ({ onToggleFullscreen: toggleFullscreen }),
    [toggleFullscreen],
  );
  useKeyboardShortcuts(videoRef, keyboardOptions);

  // ── Ad state ──────────────────────────────────────────────────────────────
  const { config: adConfig } = useAds();
  const [activeAd, setActiveAd] = useState<AdPlacement | null>(null);
  const [adPhase, setAdPhase] = useState<AdPhase>(null);
  const [adConfigReady, setAdConfigReady] = useState(false);
  const pendingMidRollsRef = useRef<AdPlacement[]>([]);
  const preRollShownRef = useRef(false);

  useEffect(() => {
    if (!adConfig) return;
    const midRolls = [...(adConfig.video.midRolls ?? [])].sort(
      (a, b) => (a.triggerPositionMs ?? 0) - (b.triggerPositionMs ?? 0),
    );
    pendingMidRollsRef.current = midRolls;
    setTimeout(() => setAdConfigReady(true), 0);
  }, [adConfig]);

  useEffect(() => {
    if (!adConfigReady || preRollShownRef.current) return;
    if (!content || content.status !== "READY") return;
    const preRoll = adConfig?.video.preRoll;
    preRollShownRef.current = true;
    if (preRoll) {
      setTimeout(() => {
        setActiveAd(preRoll);
        setAdPhase("preroll");
      }, 0);
    }
  }, [adConfigReady, content, adConfig]);

  const handleAdComplete = useCallback(() => {
    const phase = adPhase;
    setActiveAd(null);
    setAdPhase(null);
    if (phase === "preroll" || phase === "midroll") {
      setTimeout(() => {
        videoRef.current?.play().catch(() => {});
      }, 0);
    }
  }, [adPhase]);

  // ── Watch events + mid-roll ───────────────────────────────────────────────
  const midRollTrigger = useMemo(
    () => ({ setActiveAd, setAdPhase, pendingMidRollsRef }),
    [],
  );
  useWatchEvents(videoRef, content, midRollTrigger);

  // ── Playback progress save ────────────────────────────────────────────────
  usePlaybackProgress(videoRef, content);

  // ── Related content ───────────────────────────────────────────────────────
  const [relatedItems, setRelatedItems] = useState<RelatedItem[]>([]);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    fetch(`/api/contents/${id}/related`)
      .then(async (res) => {
        if (!res.ok || cancelled) return;
        const data = await res.json();
        if (!cancelled) setRelatedItems(Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : []);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [id]);

  // ── Actions ───────────────────────────────────────────────────────────────
  async function onClickPlay() {
    const v = videoRef.current;
    if (!v) return;
    try {
      await v.play();
    } catch {
      // 자동재생 제한 등으로 실패할 수 있음
    }
  }

  const thumbUrl = content?.thumbnailUrl
    ? getThumbnailUrl(content.thumbnailUrl, BASE_URL)
    : null;

  const aspectRatio = meta?.aspectRatio ?? 0;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <main style={{ minHeight: "100vh", background: "var(--bg)" }}>
      {/* Player top bar (fullscreen only shows over player) */}
      <PlayerTopBar
        showUI={showUI}
        onToggleFullscreen={toggleFullscreen}
        isFullscreen={isFullscreen}
        title={isPlaying ? content?.title : undefined}
      />

      {/* Player */}
      <PlayerShell
        orientation={orientation}
        isPlaying={isPlaying}
        isFullscreen={isFullscreen}
        onDoubleClick={toggleFullscreen}
      >
        <BlurredBackground
          src={thumbUrl}
          isPlaying={isPlaying}
          orientation={orientation}
        />

        <VideoContainer orientation={orientation} aspectRatio={aspectRatio} isFullscreen={isFullscreen}>
          <video
            ref={videoRef}
            controls
            playsInline
            style={{
              width: "100%",
              height: "100%",
              borderRadius: isFullscreen ? 0 : 0,
              background: "#000",
              objectFit: "contain",
            }}
          />
        </VideoContainer>

        <PlayerOverlay
          content={content}
          isPlaying={isPlaying}
          orientation={orientation}
          onClickPlay={onClickPlay}
          onToggleFullscreen={toggleFullscreen}
        />

        <PlayerBottomHint showUI={showUI} isPlaying={isPlaying} />

        {activeAd && adPhase && (
          <VideoAd
            ad={activeAd}
            phase={adPhase}
            contentId={id ?? undefined}
            onComplete={handleAdComplete}
          />
        )}
      </PlayerShell>

      {/* ── Content info below player ──────────────────────────────────────── */}
      {!isFullscreen && (
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 20px 60px" }}>
          {/* Title & metadata */}
          {content && (
            <div style={{ marginBottom: 28 }}>
              <h1 style={{ fontSize: 26, fontWeight: 800, margin: "0 0 8px", letterSpacing: -0.3 }}>
                {content.title}
              </h1>
              <div style={{ display: "flex", gap: 12, alignItems: "center", fontSize: 13, color: "var(--muted)" }}>
                {content.status === "READY" && <span>재생 가능</span>}
                {content.status === "PROCESSING" && <span>인코딩 중...</span>}
                {content.status === "FAILED" && <span style={{ color: "var(--accent3)" }}>재생 불가</span>}
              </div>
              {content.errorMessage && (
                <p style={{ marginTop: 8, fontSize: 13, color: "var(--muted)" }}>
                  {content.errorMessage}
                </p>
              )}
            </div>
          )}

          {/* Related / episodes */}
          {relatedItems.length > 0 && (
            <section>
              <h2 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 14px", letterSpacing: -0.2 }}>
                관련 콘텐츠
              </h2>
              <div
                className="rail-scroll"
                style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 8 }}
              >
                {relatedItems.map((item) => {
                  const imgSrc = item.posterUrl ? getThumbnailUrl(item.posterUrl, BASE_URL) : null;
                  const isCurrent = item.id === id;
                  return (
                    <Link
                      key={item.id}
                      href={`/watch/${item.id}`}
                      className="content-card"
                      style={{
                        flexShrink: 0,
                        width: 200,
                        textDecoration: "none",
                        opacity: isCurrent ? 0.5 : 1,
                        pointerEvents: isCurrent ? "none" : "auto",
                      }}
                    >
                      <div style={{ aspectRatio: "16 / 9", background: "#111" }}>
                        {imgSrc ? (
                          <img
                            src={imgSrc}
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
                      </div>
                      <div style={{ padding: "8px 10px" }}>
                        <div style={{ fontWeight: 600, fontSize: 12, lineHeight: 1.35 }}>
                          {item.episodeNumber != null && (
                            <span style={{ color: "var(--accent)", marginRight: 4 }}>
                              EP{item.episodeNumber}
                            </span>
                          )}
                          {item.title}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          )}

          {/* Placeholder when no related content */}
          {relatedItems.length === 0 && content && (
            <div style={{ padding: "20px 0", textAlign: "center" }}>
              <p style={{ color: "var(--muted)", fontSize: 13 }}>
                다른 콘텐츠를 탐색해보세요
              </p>
              <Link href="/">
                <button className="btn-grad" style={{ marginTop: 12, fontSize: 13, padding: "9px 20px" }}>
                  홈으로 돌아가기
                </button>
              </Link>
            </div>
          )}
        </div>
      )}
    </main>
  );
}

export default function WatchPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  return (
    <AdProvider pageType="watch" contentId={id ?? undefined}>
      <WatchPageInner />
    </AdProvider>
  );
}
