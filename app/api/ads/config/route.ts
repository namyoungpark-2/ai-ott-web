export const runtime = "edge";
import { NextResponse } from "next/server";
import { BASE_URL } from "@/app/constants";
import type { AdConfig } from "@/types/ads";

function forwardHeaders(req: Request): HeadersInit {
  const headers: HeadersInit = { "Content-Type": "application/json" };
  const auth = req.headers.get("authorization");
  const cookie = req.headers.get("cookie");
  if (auth) headers["authorization"] = auth;
  if (cookie) headers["cookie"] = cookie;
  return headers;
}

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

  try {
    const params = new URLSearchParams({ page });
    if (contentId) params.set("contentId", contentId);

    const r = await fetch(`${BASE_URL}/api/app/ads/config?${params.toString()}`, {
      headers: forwardHeaders(req),
      cache: "no-store",
    });

    if (r.status === 404 || r.status === 501) {
      // Backend ads not yet implemented — return empty config gracefully
      return NextResponse.json(emptyConfig(page, contentId));
    }

    if (!r.ok) {
      return NextResponse.json(emptyConfig(page, contentId));
    }

    return new NextResponse(await r.text(), { status: r.status });
  } catch {
    // Ads failure must never break the page
    return NextResponse.json(emptyConfig(page, contentId));
  }
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
