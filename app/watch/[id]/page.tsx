"use client";

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
    <main style={{ minHeight: "100vh" }}>
      <PlayerTopBar
        showUI={showUI}
        onToggleFullscreen={toggleFullscreen}
        isFullscreen={isFullscreen}
        title={isPlaying ? content?.title : undefined}
      />

      <PlayerShell
        orientation={orientation}
        isPlaying={isPlaying}
        onDoubleClick={toggleFullscreen}
      >
        {/* Blurred thumbnail background */}
        <BlurredBackground
          src={thumbUrl}
          isPlaying={isPlaying}
          orientation={orientation}
        />

        {/* Orientation-adaptive video container */}
        <VideoContainer orientation={orientation} aspectRatio={aspectRatio}>
          <video
            ref={videoRef}
            controls
            playsInline
            style={{
              width: "100%",
              height: "100%",
              borderRadius: 18,
              background: "#000",
              boxShadow: "0 18px 60px rgba(0,0,0,.55)",
              objectFit: "contain",
            }}
          />
        </VideoContainer>

        {/* Overlay: title / status / play button */}
        <PlayerOverlay
          content={content}
          isPlaying={isPlaying}
          orientation={orientation}
          onClickPlay={onClickPlay}
          onToggleFullscreen={toggleFullscreen}
        />

        {/* Bottom hint */}
        <PlayerBottomHint showUI={showUI} isPlaying={isPlaying} />

        {/* Video Ad overlay */}
        {activeAd && adPhase && (
          <VideoAd
            ad={activeAd}
            phase={adPhase}
            contentId={id ?? undefined}
            onComplete={handleAdComplete}
          />
        )}
      </PlayerShell>
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
