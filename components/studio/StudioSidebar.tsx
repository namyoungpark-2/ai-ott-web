"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/studio", label: "대시보드", icon: "📊" },
  { href: "/studio/channel", label: "채널 설정", icon: "⚙️" },
  { href: "/studio/contents", label: "내 콘텐츠", icon: "🎬" },
  { href: "/studio/series", label: "시리즈", icon: "📁" },
];

export default function StudioSidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/studio") return pathname === "/studio";
    return pathname.startsWith(href);
  };

  return (
    <nav
      style={{
        width: 220,
        minHeight: "calc(100vh - 80px)",
        background: "var(--panel)",
        borderRight: "1px solid var(--line)",
        padding: "16px 0",
        flexShrink: 0,
      }}
    >
      <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
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
                  color: active ? "var(--accent)" : "var(--text)",
                  background: active
                    ? "color-mix(in srgb, var(--accent) 12%, transparent)"
                    : "transparent",
                  fontWeight: active ? 600 : 400,
                  textDecoration: "none",
                  fontSize: 14,
                  borderRadius: "var(--r-sm)",
                  margin: "2px 8px",
                  transition: "background 0.15s, color 0.15s",
                }}
              >
                <span style={{ fontSize: 18 }}>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
