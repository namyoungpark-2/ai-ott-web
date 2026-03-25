import { useEffect, useRef, type RefObject } from "react";
import type { ContentData } from "./useContentPolling";
import type { AdPlacement, AdPhase } from "@/types/ads";

type WatchEventPayload = {
  clientEventId: string;
  occurredAt: string;
  contentId: string;
  videoAssetId: string | null;
  sessionId: string;
  deviceId: string;
  country: string;
  player: string;
  appVersion: string;
  networkType: string | null;
  extra: Record<string, unknown>;
  eventType: "PLAY" | "PAUSE" | "COMPLETE" | "HEARTBEAT";
  positionMs: number;
  deltaMs: number;
  durationMs: number | null;
  playbackRate: number;
};

function getOrCreate(key: string) {
  const v = localStorage.getItem(key);
  if (v) return v;
  const nv = crypto.randomUUID();
  localStorage.setItem(key, nv);
  return nv;
}

async function sendWatchEvent(payload: WatchEventPayload) {
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

type MidRollTrigger = {
  setActiveAd: (ad: AdPlacement) => void;
  setAdPhase: (phase: AdPhase) => void;
  pendingMidRollsRef: React.RefObject<AdPlacement[]>;
};

/**
 * Sends PLAY / PAUSE / COMPLETE / HEARTBEAT watch events.
 * Also checks for mid-roll ad triggers during heartbeat ticks.
 */
export function useWatchEvents(
  videoRef: RefObject<HTMLVideoElement | null>,
  content: ContentData | null,
  midRoll?: MidRollTrigger,
) {
  const lastPosMsRef = useRef(0);

  useEffect(() => {
    if (!content || content.status !== "READY") return;
    const v = videoRef.current;
    if (!v) return;

    const deviceId = getOrCreate("ott_device_id");
    const sessionId = getOrCreate("ott_session_id");
    const contentId = content.id;
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
      networkType:
        (navigator as Navigator & { connection?: { effectiveType?: string } })?.connection
          ?.effectiveType ?? null,
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

    let lastPosMs = 0;
    const timer = setInterval(() => {
      if (v.paused || v.ended) return;
      const posMs = Math.floor(v.currentTime * 1000);
      const deltaMs = Math.max(0, posMs - lastPosMs);
      lastPosMs = posMs;
      lastPosMsRef.current = posMs;

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

      // Mid-roll trigger check
      if (midRoll) {
        const midRolls = midRoll.pendingMidRollsRef.current;
        if (midRolls && midRolls.length > 0) {
          const next = midRolls[0];
          if ((next.triggerPositionMs ?? Infinity) <= posMs) {
            midRoll.pendingMidRollsRef.current = midRolls.slice(1);
            v.pause();
            midRoll.setActiveAd(next);
            midRoll.setAdPhase("midroll");
          }
        }
      }
    }, 10_000);

    return () => {
      clearInterval(timer);
      v.removeEventListener("play", onPlay);
      v.removeEventListener("pause", onPause);
      v.removeEventListener("ended", onEnded);
    };
  }, [content, videoRef, midRoll]);
}
