"use client";

import type { ContentStatus, VideoAssetStatus } from "@/types/channel";

type StatusBadgeProps = {
  status: ContentStatus | string;
};

const contentStatusMap: Record<string, { bg: string; color: string; label: string }> = {
  DRAFT: { bg: "rgba(120,120,160,.15)", color: "var(--muted)", label: "Draft" },
  PUBLISHED: { bg: "rgba(34,197,94,.15)", color: "#22c55e", label: "Published" },
  UNLISTED: { bg: "rgba(234,179,8,.15)", color: "#eab308", label: "Unlisted" },
  ARCHIVED: { bg: "rgba(239,68,68,.15)", color: "#ef4444", label: "Archived" },
};

const badgeBase: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  padding: "2px 8px",
  borderRadius: 999,
  fontSize: 11,
  fontWeight: 600,
  lineHeight: 1.4,
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const info = contentStatusMap[status] ?? {
    bg: "rgba(120,120,160,.15)",
    color: "var(--muted)",
    label: status,
  };

  return (
    <span
      style={{
        ...badgeBase,
        background: info.bg,
        color: info.color,
        border: `1px solid ${info.color}`,
      }}
    >
      {info.label}
    </span>
  );
}

type VideoStatusBadgeProps = {
  status: VideoAssetStatus;
};

const videoStatusMap: Record<string, { bg: string; color: string; emoji: string; label: string }> = {
  UPLOADED: { bg: "rgba(59,130,246,.15)", color: "#3b82f6", emoji: "\u2B06\uFE0F", label: "Uploaded" },
  TRANSCODING: { bg: "rgba(59,130,246,.15)", color: "#3b82f6", emoji: "\u2699\uFE0F", label: "Transcoding" },
  READY: { bg: "rgba(34,197,94,.15)", color: "#22c55e", emoji: "\u2705", label: "Ready" },
  FAILED: { bg: "rgba(239,68,68,.15)", color: "#ef4444", emoji: "\u274C", label: "Failed" },
};

export function VideoStatusBadge({ status }: VideoStatusBadgeProps) {
  if (status === null) {
    return (
      <span
        style={{
          ...badgeBase,
          background: "rgba(120,120,160,.15)",
          color: "var(--muted)",
          border: "1px solid var(--muted)",
        }}
      >
        {"\uD83D\uDCE4"} 업로드 필요
      </span>
    );
  }

  const info = videoStatusMap[status] ?? {
    bg: "rgba(120,120,160,.15)",
    color: "var(--muted)",
    emoji: "\u2753",
    label: status,
  };

  return (
    <span
      style={{
        ...badgeBase,
        background: info.bg,
        color: info.color,
        border: `1px solid ${info.color}`,
      }}
    >
      {info.emoji} {info.label}
    </span>
  );
}
