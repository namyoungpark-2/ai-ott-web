"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import StudioSidebar from "@/components/studio/StudioSidebar";
import type { Channel } from "@/types/channel";
import { useLocale } from "@/components/LocaleProvider";

export default function StudioDashboardPage() {
  const { locale } = useLocale();
  const [channel, setChannel] = useState<Channel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchChannel() {
      try {
        const res = await fetch(`/api/creator/channel?lang=${locale}`, {
          credentials: "include",
          cache: "no-store",
        });
        if (!res.ok) throw new Error("채널 정보를 불러올 수 없습니다.");
        const data = await res.json();
        if (!cancelled) setChannel(data);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "채널 정보를 불러올 수 없습니다."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchChannel();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg)" }}>
      <StudioSidebar />

      <div style={{ flex: 1, padding: "32px 40px", maxWidth: 960 }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 32,
          }}
        >
          <h1
            style={{
              fontSize: 24,
              fontWeight: 700,
              color: "var(--text)",
              margin: 0,
            }}
          >
            크리에이터 스튜디오
          </h1>
          {channel?.handle && (
            <Link
              href={`/channels/${channel.handle}`}
              className="btn-grad"
              style={{
                padding: "8px 20px",
                borderRadius: "var(--r-sm)",
                fontSize: 14,
                fontWeight: 600,
                textDecoration: "none",
                color: "#fff",
              }}
            >
              채널 보기
            </Link>
          )}
        </div>

        {/* Loading / Error */}
        {loading && (
          <p style={{ color: "var(--muted)" }}>불러오는 중...</p>
        )}
        {error && (
          <p style={{ color: "#f44" }}>{error}</p>
        )}

        {/* Channel info card */}
        {channel && !loading && (
          <>
            <div
              style={{
                background: "var(--panel)",
                border: "1px solid var(--line)",
                borderRadius: "var(--r)",
                padding: 24,
                marginBottom: 24,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                {channel.profileImageUrl ? (
                  <img
                    src={channel.profileImageUrl}
                    alt={channel.name}
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: "50%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: "50%",
                      background: "var(--panel2)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 24,
                      color: "var(--muted)",
                    }}
                  >
                    🎬
                  </div>
                )}
                <div>
                  <h2
                    style={{
                      fontSize: 18,
                      fontWeight: 600,
                      color: "var(--text)",
                      margin: 0,
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
                    @{channel.handle} · 구독자{" "}
                    {channel.subscriberCount.toLocaleString()}명
                  </p>
                </div>
              </div>
            </div>

            {/* Quick links */}
            <h3
              style={{
                fontSize: 16,
                fontWeight: 600,
                color: "var(--text)",
                marginBottom: 12,
              }}
            >
              빠른 이동
            </h3>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              {[
                { href: "/studio/channel", label: "채널 설정", icon: "⚙️" },
                { href: "/studio/contents", label: "콘텐츠 관리", icon: "🎬" },
                { href: "/studio/series", label: "시리즈 관리", icon: "📁" },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    background: "var(--panel2)",
                    border: "1px solid var(--line)",
                    borderRadius: "var(--r-sm)",
                    padding: "12px 20px",
                    color: "var(--text)",
                    textDecoration: "none",
                    fontSize: 14,
                    fontWeight: 500,
                    transition: "border-color 0.15s",
                  }}
                >
                  <span style={{ fontSize: 18 }}>{link.icon}</span>
                  {link.label}
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
