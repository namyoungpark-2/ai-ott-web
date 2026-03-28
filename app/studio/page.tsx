"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import StudioLayout, { useStudio } from "@/components/studio/StudioLayout";
import { StatusBadge, VideoStatusBadge } from "@/components/studio/StatusBadge";
import { useLocale } from "@/components/LocaleProvider";
import type { CreatorContent } from "@/types/channel";

export default function StudioDashboardPage() {
  return (
    <StudioLayout>
      <DashboardContent />
    </StudioLayout>
  );
}

function DashboardContent() {
  const { channel, loading: channelLoading } = useStudio();
  const { locale } = useLocale();
  const [contents, setContents] = useState<CreatorContent[]>([]);
  const [contentsLoading, setContentsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchContents() {
      try {
        const res = await fetch(
          `/api/creator/contents?lang=${locale}&limit=50`,
          { credentials: "include" },
        );
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled) {
          setContents(Array.isArray(data) ? data : data.contents ?? []);
        }
      } catch {
        // silently fail
      } finally {
        if (!cancelled) setContentsLoading(false);
      }
    }

    fetchContents();
    return () => {
      cancelled = true;
    };
  }, [locale]);

  if (channelLoading || contentsLoading) {
    return (
      <p style={{ color: "var(--muted)", padding: 16 }}>불러오는 중...</p>
    );
  }

  // Stats
  const total = contents.length;
  const published = contents.filter((c) => c.status === "PUBLISHED").length;
  const draft = contents.filter((c) => c.status === "DRAFT").length;
  const unlisted = contents.filter((c) => c.status === "UNLISTED").length;

  const recent = contents.slice(0, 5);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      {/* ─── A) Channel Card ────────────────────────────────────────── */}
      {channel && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            background: "var(--panel)",
            border: "1px solid var(--line)",
            borderRadius: "var(--r)",
            padding: 20,
          }}
        >
          {channel.profileImageUrl ? (
            <img
              src={channel.profileImageUrl}
              alt={channel.name}
              style={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                objectFit: "cover",
                flexShrink: 0,
              }}
            />
          ) : (
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                background:
                  "linear-gradient(135deg, var(--accent), var(--accent2, #6366f1))",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 24,
                fontWeight: 700,
                color: "#fff",
                flexShrink: 0,
              }}
            >
              {channel.name.charAt(0).toUpperCase()}
            </div>
          )}

          <div style={{ flex: 1, minWidth: 0 }}>
            <h2
              style={{
                fontSize: 18,
                fontWeight: 600,
                color: "var(--text)",
                margin: 0,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {channel.name}
            </h2>
            <p
              style={{
                fontSize: 13,
                color: "var(--muted)",
                margin: "4px 0 0",
              }}
            >
              @{channel.handle} &middot; 구독자{" "}
              {channel.subscriberCount.toLocaleString()}명
            </p>
          </div>

          <Link
            href={`/channels/${channel.handle}`}
            style={{
              padding: "8px 18px",
              borderRadius: "var(--r-sm)",
              fontSize: 13,
              fontWeight: 600,
              color: "var(--accent)",
              border: "1px solid var(--accent)",
              textDecoration: "none",
              whiteSpace: "nowrap",
              transition: "background 0.15s",
            }}
          >
            채널 보기
          </Link>
        </div>
      )}

      {/* ─── B) Stats Grid ──────────────────────────────────────────── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
          gap: 12,
        }}
      >
        <StatCard label="전체" count={total} color="var(--text)" />
        <StatCard label="공개" count={published} color="#22c55e" />
        <StatCard label="초안" count={draft} color="var(--muted)" />
        <StatCard label="비공개" count={unlisted} color="#eab308" />
      </div>

      {/* ─── C) Quick Actions ───────────────────────────────────────── */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <Link
          href="/studio/contents/new"
          className="btn-grad"
          style={{
            padding: "10px 24px",
            borderRadius: "var(--r-sm)",
            fontSize: 14,
            fontWeight: 600,
            textDecoration: "none",
            color: "#fff",
          }}
        >
          새 콘텐츠
        </Link>
        <Link
          href="/studio/channel"
          style={{
            padding: "10px 24px",
            borderRadius: "var(--r-sm)",
            fontSize: 14,
            fontWeight: 600,
            textDecoration: "none",
            color: "var(--text)",
            background: "var(--panel)",
            border: "1px solid var(--line)",
            transition: "border-color 0.15s",
          }}
        >
          채널 설정
        </Link>
      </div>

      {/* ─── D) Recent Contents ─────────────────────────────────────── */}
      <div>
        <h3
          style={{
            fontSize: 16,
            fontWeight: 600,
            color: "var(--text)",
            margin: "0 0 12px",
          }}
        >
          최근 콘텐츠
        </h3>

        {recent.length === 0 ? (
          <p style={{ color: "var(--muted)", fontSize: 14 }}>
            아직 콘텐츠가 없습니다.
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {recent.map((c) => (
              <RecentContentRow key={c.contentId} content={c} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Sub-components ────────────────────────────────────────────────────────

function StatCard({
  label,
  count,
  color,
}: {
  label: string;
  count: number;
  color: string;
}) {
  return (
    <div
      style={{
        background: "var(--panel)",
        border: "1px solid var(--line)",
        borderRadius: "var(--r)",
        padding: 16,
      }}
    >
      <div
        style={{
          fontSize: 28,
          fontWeight: 700,
          color,
          lineHeight: 1.2,
        }}
      >
        {count}
      </div>
      <div
        style={{
          fontSize: 12,
          color: "var(--muted)",
          marginTop: 4,
        }}
      >
        {label}
      </div>
    </div>
  );
}

function RecentContentRow({ content }: { content: CreatorContent }) {
  const dateStr = new Date(content.createdAt).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <Link
      href={`/studio/contents/${content.contentId}/edit`}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        padding: "12px 16px",
        background: "var(--panel)",
        border: "1px solid var(--line)",
        borderRadius: "var(--r)",
        textDecoration: "none",
        transition: "border-color 0.15s",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = "var(--accent)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = "var(--line)";
      }}
    >
      <div style={{ minWidth: 0, flex: 1 }}>
        <div
          style={{
            fontSize: 14,
            fontWeight: 500,
            color: "var(--text)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {content.title}
        </div>
        <div
          style={{
            fontSize: 12,
            color: "var(--muted)",
            marginTop: 2,
          }}
        >
          {dateStr}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          flexShrink: 0,
        }}
      >
        <StatusBadge status={content.status} />
        <VideoStatusBadge status={content.videoAssetStatus} />
      </div>
    </Link>
  );
}
