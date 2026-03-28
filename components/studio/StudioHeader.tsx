"use client";

import Link from "next/link";
import { useLocale } from "@/components/LocaleProvider";
import type { Channel } from "@/types/channel";

type Props = { channel: Channel | null };

export default function StudioHeader({ channel }: Props) {
  const { t } = useLocale();

  return (
    <header
      style={{
        height: 56,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 20px",
        background: "var(--panel)",
        borderBottom: "1px solid var(--line)",
        flexShrink: 0,
      }}
    >
      {/* Left: avatar + channel name */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {channel?.profileImageUrl ? (
          <img
            src={channel.profileImageUrl}
            alt={channel.name}
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              objectFit: "cover",
            }}
          />
        ) : (
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: "linear-gradient(135deg, var(--accent), #6366f1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontSize: 14,
              fontWeight: 700,
            }}
          >
            {channel?.name?.charAt(0) ?? "?"}
          </div>
        )}
        <span style={{ fontWeight: 600, fontSize: 15, color: "var(--text)" }}>
          {channel?.name ?? t("studio.title")}
        </span>
      </div>

      {/* Right: view channel link */}
      {channel && (
        <Link
          href={`/channels/${channel.handle}`}
          style={{
            color: "var(--accent)",
            fontSize: 13,
            fontWeight: 500,
            textDecoration: "none",
          }}
        >
          {t("studio.viewChannel")}
        </Link>
      )}
    </header>
  );
}
