"use client";

import { useEffect, useRef, useState } from "react";
import { useAds } from "./AdProvider";
import type { AdPlacement } from "@/types/ads";

type Props = {
  ad: AdPlacement;
  contentId?: string;
  /** Whether to show a dismiss (×) button */
  dismissible?: boolean;
  style?: React.CSSProperties;
};

export default function AdBanner({ ad, contentId, dismissible = false, style }: Props) {
  const { trackImpression, trackClick } = useAds();
  const [dismissed, setDismissed] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);
  const tracked = useRef(false);

  // Track impression once on mount
  useEffect(() => {
    if (tracked.current) return;
    tracked.current = true;
    trackImpression(ad, { contentId });
  }, [ad, contentId, trackImpression]);

  if (dismissed) return null;

  function handleClick() {
    trackClick(ad, { contentId });
    if (ad.clickUrl && ad.clickUrl !== "#") {
      window.open(ad.clickUrl, "_blank", "noopener,noreferrer");
    }
  }

  return (
    <div
      role="complementary"
      aria-label={`광고: ${ad.advertiser ?? ad.title ?? "Advertisement"}`}
      style={{
        position: "relative",
        width: "100%",
        borderRadius: 10,
        overflow: "hidden",
        border: "1px solid var(--line)",
        background: "rgba(255,255,255,.03)",
        cursor: ad.clickUrl ? "pointer" : "default",
        userSelect: "none",
        ...style,
      }}
      onClick={handleClick}
    >
      {/* Ad label */}
      <span
        style={{
          position: "absolute",
          top: 6,
          left: 8,
          zIndex: 2,
          fontSize: 9,
          fontWeight: 700,
          letterSpacing: 0.8,
          textTransform: "uppercase",
          color: "rgba(255,255,255,.45)",
          background: "rgba(0,0,0,.55)",
          padding: "2px 5px",
          borderRadius: 3,
        }}
      >
        AD
      </span>

      {/* Dismiss button */}
      {dismissible && (
        <button
          onClick={(e) => { e.stopPropagation(); setDismissed(true); }}
          aria-label="광고 닫기"
          style={{
            position: "absolute",
            top: 4,
            right: 4,
            zIndex: 3,
            width: 22,
            height: 22,
            borderRadius: "50%",
            background: "rgba(0,0,0,.6)",
            border: "1px solid rgba(255,255,255,.15)",
            color: "rgba(255,255,255,.7)",
            fontSize: 11,
            display: "grid",
            placeItems: "center",
            cursor: "pointer",
            padding: 0,
          }}
        >
          ✕
        </button>
      )}

      {/* Image creative */}
      {ad.imageUrl && !imgFailed ? (
        <img
          src={ad.imageUrl}
          alt={ad.title ?? (ad.advertiser ? `${ad.advertiser} 광고` : "광고")}
          style={{ width: "100%", display: "block" }}
          onError={() => setImgFailed(true)}
        />
      ) : (
        /* Fallback placeholder when no image or load fails */
        <div
          style={{
            height: 90,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "linear-gradient(135deg, rgba(109,94,252,.10), rgba(0,0,0,.25))",
          }}
        >
          <span style={{ color: "var(--muted)", fontSize: 13 }}>
            {ad.advertiser ? `${ad.advertiser} — 광고` : "광고"}
          </span>
        </div>
      )}
    </div>
  );
}
