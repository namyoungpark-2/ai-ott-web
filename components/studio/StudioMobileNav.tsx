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

export default function StudioMobileNav() {
  const pathname = usePathname();
  const { t } = useLocale();

  const isActive = (href: string) => {
    if (href === "/studio") return pathname === "/studio";
    return pathname.startsWith(href);
  };

  return (
    <nav
      className="rail-scroll"
      style={{
        display: "flex",
        gap: 8,
        padding: "8px 16px",
        overflowX: "auto",
        background: "var(--panel)",
        borderBottom: "1px solid var(--line)",
      }}
    >
      {NAV_ITEMS.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`cat-pill${isActive(item.href) ? " active" : ""}`}
        >
          <span>{item.icon}</span>{" "}
          <span>{t(item.labelKey)}</span>
        </Link>
      ))}
    </nav>
  );
}
