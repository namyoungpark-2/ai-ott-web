export type Channel = {
  id: string;
  handle: string;
  name: string;
  description: string | null;
  profileImageUrl: string | null;
  bannerImageUrl: string | null;
  isOfficial: boolean;
  subscriberCount: number;
  status: "ACTIVE" | "INACTIVE";
  createdAt: string;
};

export type ChannelContent = {
  contentId: string;
  title: string;
  contentType: "MOVIE" | "EPISODE";
  status: "DRAFT" | "PUBLISHED" | "UNLISTED" | "ARCHIVED";
  thumbnailUrl: string | null;
  createdAt: string;
};

export type ChannelSeries = {
  seriesId: string;
  title: string;
  status: "DRAFT" | "PUBLISHED" | "UNLISTED" | "ARCHIVED";
  episodeCount: number;
};

export type SubscriptionInfo = {
  id: string;
  handle: string;
  name: string;
  profileImageUrl: string | null;
  isOfficial: boolean;
  subscriberCount: number;
  status: "ACTIVE" | "INACTIVE";
};

// Creator Studio types
export type ContentStatus = "DRAFT" | "PUBLISHED" | "UNLISTED" | "ARCHIVED";
export type VideoAssetStatus = "UPLOADED" | "TRANSCODING" | "READY" | "FAILED" | null;

export type CreatorContent = {
  contentId: string;
  title: string;
  contentType: "MOVIE" | "EPISODE";
  status: ContentStatus;
  videoAssetStatus: VideoAssetStatus;
  thumbnailUrl: string | null;
  createdAt: string;
};

export type CreatorSeries = {
  seriesId: string;
  title: string;
  description: string | null;
  episodeCount: number;
};

export type CreateContentPayload = {
  mode: "MOVIE" | "EPISODE";
  title: string;
  seriesTitle?: string;
  seriesId?: string;
  seasonNumber?: number;
  episodeNumber?: number;
};

export type UpdateChannelPayload = {
  name?: string;
  description?: string;
  profileImageUrl?: string;
  bannerImageUrl?: string;
};

export type CreateSeriesPayload = {
  title: string;
  description?: string;
};

export type UpdateSeriesPayload = {
  title?: string;
  description?: string;
  lang?: string;
};

export type UpdateContentMetadataPayload = {
  title?: string;
  description?: string;
  lang?: string;
};
