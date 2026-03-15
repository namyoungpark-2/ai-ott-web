// ─── Ad Domain Types ─────────────────────────────────────────────────────────

export type AdType =
  | "BANNER"
  | "VIDEO_PREROLL"
  | "VIDEO_MIDROLL"
  | "VIDEO_POSTROLL"
  | "VIDEO_OVERLAY";

export type AdStatus = "ACTIVE" | "PAUSED" | "EXPIRED";

// A single ad creative + targeting configuration
export type AdPlacement = {
  id: string;
  type: AdType;
  status: AdStatus;
  /** Advertiser display name (e.g. "Samsung Electronics") */
  advertiser?: string;
  /** Short ad title for accessibility / fallback */
  title?: string;

  // ── Banner fields ──────────────────────────────────────────────────────────
  imageUrl?: string;
  /** Destination URL when user clicks the banner */
  clickUrl?: string;
  /** px width hint (for aspect-ratio preservation) */
  width?: number;
  /** px height hint */
  height?: number;

  // ── Video fields ───────────────────────────────────────────────────────────
  videoUrl?: string;
  /** Seconds until the skip button appears. null = non-skippable */
  skipAfterSeconds?: number | null;
  /** Total video ad duration in seconds */
  durationSeconds?: number;

  // ── Mid-roll specific ──────────────────────────────────────────────────────
  /**
   * Content playback position (ms) at which this mid-roll should trigger.
   * Only relevant for VIDEO_MIDROLL.
   */
  triggerPositionMs?: number;
};

// ─── Ad Configuration (per page/content) ─────────────────────────────────────

export type VideoAdConfig = {
  preRoll?: AdPlacement;
  /** Sorted ascending by triggerPositionMs */
  midRolls: AdPlacement[];
  postRoll?: AdPlacement;
};

export type AdPageType = "home" | "content" | "watch" | "category" | "search";

export type AdConfig = {
  pageType: AdPageType;
  contentId?: string;
  /** Banner ads injected between page sections */
  banners: AdPlacement[];
  video: VideoAdConfig;
};

// ─── Analytics Payloads ───────────────────────────────────────────────────────

export type AdImpressionPayload = {
  adId: string;
  adType: AdType;
  contentId?: string;
  /** Content playback position when the ad was shown (ms) */
  positionMs?: number;
  sessionId?: string;
  deviceId?: string;
  occurredAt: string;
};

export type AdClickPayload = {
  adId: string;
  adType: AdType;
  contentId?: string;
  occurredAt: string;
};

export type AdSkipPayload = {
  adId: string;
  adType: AdType;
  contentId?: string;
  /** How many seconds of the ad were watched before skip */
  watchedSeconds: number;
  occurredAt: string;
};

// ─── Ad State (used in watch page) ───────────────────────────────────────────

export type AdPhase = "preroll" | "midroll" | "postroll" | null;
