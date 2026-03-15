"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type {
  AdClickPayload,
  AdConfig,
  AdImpressionPayload,
  AdPageType,
  AdPlacement,
} from "@/types/ads";

// ─── Context ──────────────────────────────────────────────────────────────────

type AdContextValue = {
  config: AdConfig | null;
  loading: boolean;
  trackImpression: (
    ad: AdPlacement,
    opts?: { contentId?: string; positionMs?: number; sessionId?: string; deviceId?: string }
  ) => void;
  trackClick: (ad: AdPlacement, opts?: { contentId?: string }) => void;
  trackSkip: (ad: AdPlacement, opts?: { contentId?: string; watchedSeconds?: number }) => void;
};

const AdContext = createContext<AdContextValue>({
  config: null,
  loading: false,
  trackImpression: () => {},
  trackClick: () => {},
  trackSkip: () => {},
});

export function useAds() {
  return useContext(AdContext);
}

// ─── Provider ─────────────────────────────────────────────────────────────────

type Props = {
  pageType: AdPageType;
  contentId?: string;
  children: React.ReactNode;
};

export function AdProvider({ pageType, contentId, children }: Props) {
  const [config, setConfig] = useState<AdConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchConfig() {
      try {
        const params = new URLSearchParams({ page: pageType });
        if (contentId) params.set("contentId", contentId);
        const res = await fetch(`/api/ads/config?${params.toString()}`, {
          cache: "no-store",
        });
        if (!res.ok) return; // Non-critical: silently skip
        const data = (await res.json()) as AdConfig;
        if (!cancelled) setConfig(data);
      } catch {
        // Ad config failure must never break the page
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchConfig();
    return () => { cancelled = true; };
  }, [pageType, contentId]);

  const trackImpression = useCallback(
    (
      ad: AdPlacement,
      opts?: { contentId?: string; positionMs?: number; sessionId?: string; deviceId?: string }
    ) => {
      const payload: AdImpressionPayload = {
        adId: ad.id,
        adType: ad.type,
        contentId: opts?.contentId ?? contentId,
        positionMs: opts?.positionMs,
        sessionId: opts?.sessionId,
        deviceId: opts?.deviceId,
        occurredAt: new Date().toISOString(),
      };
      fetch("/api/ads/impression", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        keepalive: true,
      }).catch(() => {});
    },
    [contentId]
  );

  const trackClick = useCallback(
    (ad: AdPlacement, opts?: { contentId?: string }) => {
      const payload: AdClickPayload = {
        adId: ad.id,
        adType: ad.type,
        contentId: opts?.contentId ?? contentId,
        occurredAt: new Date().toISOString(),
      };
      fetch("/api/ads/click", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        keepalive: true,
      }).catch(() => {});
    },
    [contentId]
  );

  // Skip = impression-like event; reuse impression endpoint with extra field
  const trackSkip = useCallback(
    (ad: AdPlacement, opts?: { contentId?: string; watchedSeconds?: number }) => {
      const payload = {
        adId: ad.id,
        adType: ad.type,
        contentId: opts?.contentId ?? contentId,
        watchedSeconds: opts?.watchedSeconds ?? 0,
        occurredAt: new Date().toISOString(),
        eventKind: "SKIP",
      };
      fetch("/api/ads/impression", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        keepalive: true,
      }).catch(() => {});
    },
    [contentId]
  );

  return (
    <AdContext.Provider value={{ config, loading, trackImpression, trackClick, trackSkip }}>
      {children}
    </AdContext.Provider>
  );
}
