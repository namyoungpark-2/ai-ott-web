"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale } from "@/components/LocaleProvider";

const NAV_ITEMS = [
  { href: "/studio", labelKey: "studio.dashboard", icon: "📊" },
  { href: "/studio/channel", labelKey: "studio.channelSettings", icon: "⚙️" },
  { href: "/studio/contents", labelKey: "studio.myContents", icon: "🎬" },
  { href: "/studio/series", labelKey: "studio.series", icon: "📁" },
];

export default function StudioSidebar() {
  const pathname = usePathname();
  const { t } = useLocale();

  const isActive = (href: string) => {
    if (href === "/studio") return pathname === "/studio";
    return pathname.startsWith(href);
  };

  return (
    <nav
      style={{
        width: 220,
        minHeight: "100%",
        background: "var(--panel)",
        borderRight: "1px solid var(--line)",
        padding: "16px 0",
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <ul style={{ listStyle: "none", margin: 0, padding: 0, flex: 1 }}>
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 20px",
                  color: active ? "var(--text)" : "var(--muted)",
                  background: active
                    ? "color-mix(in srgb, var(--accent) 12%, transparent)"
                    : "transparent",
                  fontWeight: active ? 600 : 400,
                  textDecoration: "none",
                  fontSize: 14,
                  borderLeft: `3px solid ${active ? "var(--accent)" : "transparent"}`,
                  transition: "background 0.15s, color 0.15s, border-color 0.15s",
                }}
              >
                <span style={{ fontSize: 18 }}>{item.icon}</span>
                <span>{t(item.labelKey)}</span>
              </Link>
            </li>
          );
        })}
      </ul>

      {/* Bottom divider + home link */}
      <div
        style={{
          borderTop: "1px solid var(--line)",
          padding: "12px 0 4px",
          margin: "0",
        }}
      >
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "10px 20px",
            color: "var(--muted)",
            textDecoration: "none",
            fontSize: 14,
            borderLeft: "3px solid transparent",
          }}
        >
          <span style={{ fontSize: 18 }}>🏠</span>
          <span>홈으로</span>
        </Link>
      </div>
    </nav>
  );
}
