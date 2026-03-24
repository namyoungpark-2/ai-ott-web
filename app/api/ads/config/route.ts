export const runtime = "edge";
import { NextResponse } from "next/server";
import type { AdConfig } from "@/types/ads";

function emptyConfig(pageType: string, contentId?: string): AdConfig {
  return {
    pageType: pageType as AdConfig["pageType"],
    contentId,
    banners: [],
    video: { midRolls: [] },
  };
}

// GET /api/ads/config?page=watch&contentId=abc123
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const page = searchParams.get("page") ?? "home";
  const contentId = searchParams.get("contentId") ?? undefined;

  // Mock fallback: if MOCK_ADS_ENABLED is set, return sample ads without backend
  if (process.env.MOCK_ADS_ENABLED === "true") {
    const mock = getMockAdConfig(page, contentId);
    return NextResponse.json(mock);
  }

  // Backend ads not yet implemented — return empty config gracefully immediately
  return NextResponse.json(emptyConfig(page, contentId));
}

// ─── Mock Ad Config ───────────────────────────────────────────────────────────
// Remove once backend /api/app/ads/config is implemented

function getMockAdConfig(page: string, contentId?: string): AdConfig {
  const base: AdConfig = {
    pageType: page as AdConfig["pageType"],
    contentId,
    banners: [],
    video: { midRolls: [] },
  };

  if (page === "home" || page === "category") {
    base.banners = [
      {
        id: "mock-banner-001",
        type: "BANNER",
        status: "ACTIVE",
        advertiser: "Mock Brand Co.",
        title: "Sample Banner Ad",
        imageUrl: "",        // empty → AdBanner renders placeholder
        clickUrl: "#",
        width: 1200,
        height: 90,
      },
    ];
  }

  if (page === "watch") {
    base.video.preRoll = {
      id: "mock-preroll-001",
      type: "VIDEO_PREROLL",
      status: "ACTIVE",
      advertiser: "Mock Auto Inc.",
      title: "Pre-Roll Sample",
      videoUrl: "",          // empty → VideoAd renders countdown-only fallback
      skipAfterSeconds: 5,
      durationSeconds: 15,
    };
    base.video.midRolls = [
      {
        id: "mock-midroll-001",
        type: "VIDEO_MIDROLL",
        status: "ACTIVE",
        advertiser: "Mock Retail Ltd.",
        title: "Mid-Roll Sample",
        videoUrl: "",
        skipAfterSeconds: 5,
        durationSeconds: 10,
        triggerPositionMs: 60_000, // trigger at 1 minute
      },
    ];
  }

  return base;
}
