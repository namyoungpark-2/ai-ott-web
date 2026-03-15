"use client";

import { useEffect, useRef, useState } from "react";
import { useAds } from "./AdProvider";
import type { AdPhase, AdPlacement } from "@/types/ads";

type Props = {
  ad: AdPlacement;
  phase: AdPhase;
  contentId?: string;
  /** Called when ad ends normally or is skipped */
  onComplete: () => void;
};

export default function VideoAd({ ad, phase, contentId, onComplete }: Props) {
  const { trackImpression, trackSkip } = useAds();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const startTimeRef = useRef<number>(0);
  useEffect(() => { startTimeRef.current = Date.now(); }, []);
  const tracked = useRef(false);

  const skipAfter = ad.skipAfterSeconds ?? null;
  const [secondsWatched, setSecondsWatched] = useState(0);
  const [videoError, setVideoError] = useState(false);

  const canSkip = skipAfter !== null && secondsWatched >= skipAfter;
  const skipIn = skipAfter !== null ? Math.max(0, skipAfter - secondsWatched) : null;

  // Track impression once
  useEffect(() => {
    if (tracked.current) return;
    tracked.current = true;
    trackImpression(ad, { contentId });
  }, [ad, contentId, trackImpression]);

  // Seconds-watched counter (1s tick)
  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsWatched((s) => s + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Auto-complete when no video URL — just run countdown for durationSeconds
  useEffect(() => {
    if (ad.videoUrl || !ad.durationSeconds) return;
    const timeout = setTimeout(onComplete, ad.durationSeconds * 1000);
    return () => clearTimeout(timeout);
  }, [ad.videoUrl, ad.durationSeconds, onComplete]);

  function handleSkip() {
    const watched = Math.round((Date.now() - startTimeRef.current) / 1000);
    trackSkip(ad, { contentId, watchedSeconds: watched });
    onComplete();
  }

  function handleVideoEnded() {
    onComplete();
  }

  const phaseLabel = phase === "preroll" ? "광고 시청 후 재생됩니다" : "잠시 광고를 시청해 주세요";

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 15,
        background: "#000",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Ad video or fallback placeholder */}
      {ad.videoUrl && !videoError ? (
        <video
          ref={videoRef}
          src={ad.videoUrl}
          autoPlay
          playsInline
          muted={false}
          onEnded={handleVideoEnded}
          onError={() => setVideoError(true)}
          style={{ width: "100%", height: "100%", objectFit: "contain", flex: 1 }}
        />
      ) : (
        /* No video URL or load error — visual placeholder with countdown */
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: "linear-gradient(135deg, rgba(109,94,252,.12), rgba(0,0,0,.7))",
            gap: 12,
          }}
        >
          <div style={{ fontSize: 13, color: "rgba(255,255,255,.5)" }}>AD</div>
          {ad.advertiser && (
            <div style={{ fontSize: 20, fontWeight: 700, color: "#fff" }}>{ad.advertiser}</div>
          )}
          {ad.title && (
            <div style={{ fontSize: 14, color: "rgba(255,255,255,.65)" }}>{ad.title}</div>
          )}
        </div>
      )}

      {/* Overlay HUD */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          zIndex: 16,
        }}
      >
        {/* Top-left: AD badge + advertiser */}
        <div
          style={{
            position: "absolute",
            top: 14,
            left: 16,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span
            style={{
              fontSize: 10,
              fontWeight: 800,
              letterSpacing: 1,
              textTransform: "uppercase",
              background: "var(--accent)",
              color: "#fff",
              padding: "3px 7px",
              borderRadius: 4,
            }}
          >
            AD
          </span>
          {ad.advertiser && (
            <span style={{ fontSize: 12, color: "rgba(255,255,255,.7)" }}>{ad.advertiser}</span>
          )}
        </div>

        {/* Bottom-right: skip button or countdown */}
        <div
          style={{
            position: "absolute",
            bottom: 16,
            right: 16,
            pointerEvents: "auto",
          }}
        >
          {canSkip ? (
            <button
              onClick={handleSkip}
              style={{
                background: "rgba(0,0,0,.75)",
                border: "1px solid rgba(255,255,255,.35)",
                color: "#fff",
                fontSize: 13,
                fontWeight: 600,
                padding: "8px 16px",
                borderRadius: 6,
                cursor: "pointer",
              }}
            >
              광고 건너뛰기 ›
            </button>
          ) : skipIn !== null ? (
            <div
              style={{
                background: "rgba(0,0,0,.65)",
                border: "1px solid rgba(255,255,255,.12)",
                color: "rgba(255,255,255,.7)",
                fontSize: 12,
                padding: "7px 14px",
                borderRadius: 6,
              }}
            >
              {skipIn}초 후 건너뛰기 가능
            </div>
          ) : (
            <div
              style={{
                background: "rgba(0,0,0,.65)",
                border: "1px solid rgba(255,255,255,.12)",
                color: "rgba(255,255,255,.7)",
                fontSize: 12,
                padding: "7px 14px",
                borderRadius: 6,
              }}
            >
              광고를 시청해 주세요
            </div>
          )}
        </div>

        {/* Bottom-left: context label */}
        <div
          style={{
            position: "absolute",
            bottom: 16,
            left: 16,
            fontSize: 11,
            color: "rgba(255,255,255,.45)",
          }}
        >
          {phaseLabel}
        </div>
      </div>
    </div>
  );
}
