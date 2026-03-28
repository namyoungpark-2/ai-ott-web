"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAuth } from "./AuthProvider";
import { useTheme } from "./ThemeProvider";
import { useLocale, SUPPORTED_LOCALES } from "./LocaleProvider";
import { useCatalogNav } from "./CatalogProvider";
import LoginModal from "./LoginModal";

/* ── SVG Icons ─────────────────────────────────────────────────────────── */
function SearchIcon() {
  return (
    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

export default function GlobalNav() {
  const pathname = usePathname();
  const { user, loading, logout } = useAuth();
  const { theme, toggle: toggleTheme } = useTheme();
  const { locale, setLocale, t } = useLocale();
  const { categories, genres } = useCatalogNav();
  const [showLogin, setShowLogin] = useState(false);

  const navItems = [
    { label: t("nav.home"), href: "/" },
    { label: t("nav.channels"), href: "/channels" },
    ...categories.map((c) => ({ label: c.label, href: `/categories/${c.slug}` })),
    ...genres.map((g) => ({ label: g.label, href: `/categories/genre/${g.slug}` })),
  ];

  // watch 페이지에서는 GlobalNav 숨김 (PlayerTopBar가 대체)
  if (pathname?.startsWith("/watch")) return null;

  return (
    <>
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          backdropFilter: "blur(24px) saturate(180%)",
          WebkitBackdropFilter: "blur(24px) saturate(180%)",
          background: theme === "dark" ? "rgba(7, 7, 15, 0.82)" : "rgba(255, 255, 255, 0.85)",
          borderBottom: "1px solid var(--line)",
        }}
      >
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 24px" }}>
          {/* Top row */}
          <div style={{ display: "flex", alignItems: "center", gap: 16, height: 60 }}>
            {/* Logo */}
            <Link href="/" style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 6 }}>
              <span
                style={{
                  display: "inline-block",
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  background: "var(--grad-brand)",
                  boxShadow: "0 0 16px rgba(139,92,246,.50)",
                }}
              />
              <span style={{ fontWeight: 900, letterSpacing: -0.5, fontSize: 20 }}>
                <span
                  style={{
                    background: "var(--grad-brand)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  AI
                </span>{" "}
                <span style={{ color: "var(--text)", opacity: 0.9 }}>OTT</span>
              </span>
            </Link>

            <div style={{ flex: 1 }} />

            {/* Search */}
            <Link
              href="/search"
              aria-label={t("nav.search")}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 38,
                height: 38,
                borderRadius: 10,
                color: "var(--muted)",
                border: "1px solid transparent",
                transition: "all .15s",
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.color = "var(--text)";
                el.style.background = "rgba(255,255,255,.07)";
                el.style.borderColor = "var(--line2)";
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.color = "var(--muted)";
                el.style.background = "transparent";
                el.style.borderColor = "transparent";
              }}
            >
              <SearchIcon />
            </Link>

            {/* Locale selector */}
            <select
              value={locale}
              onChange={(e) => setLocale(e.target.value as "ko" | "en")}
              aria-label="Language"
              style={{
                background: "transparent",
                border: "1px solid transparent",
                borderRadius: 10,
                padding: "6px 8px",
                fontSize: 13,
                color: "var(--muted)",
                cursor: "pointer",
                transition: "all .15s",
                outline: "none",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--line2)";
                e.currentTarget.style.color = "var(--text)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "transparent";
                e.currentTarget.style.color = "var(--muted)";
              }}
            >
              {SUPPORTED_LOCALES.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.label}
                </option>
              ))}
            </select>

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              aria-label={theme === "dark" ? "라이트 모드로 전환" : "다크 모드로 전환"}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 38,
                height: 38,
                borderRadius: 10,
                color: "var(--muted)",
                background: "transparent",
                border: "1px solid transparent",
                cursor: "pointer",
                transition: "all .15s",
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.color = "var(--text)";
                el.style.background = theme === "dark" ? "rgba(255,255,255,.07)" : "rgba(0,0,0,.05)";
                el.style.borderColor = "var(--line2)";
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.color = "var(--muted)";
                el.style.background = "transparent";
                el.style.borderColor = "transparent";
              }}
            >
              {theme === "dark" ? <SunIcon /> : <MoonIcon />}
            </button>

            {/* Auth controls */}
            {!loading && (
              <>
                {user ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    {/* User avatar chip */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        padding: "6px 12px 6px 8px",
                        borderRadius: 999,
                        background: "rgba(139,92,246,.12)",
                        border: "1px solid rgba(139,92,246,.25)",
                        fontSize: 13,
                        fontWeight: 500,
                        color: "#a78bfa",
                      }}
                    >
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: 22,
                          height: 22,
                          borderRadius: "50%",
                          background: "var(--grad-brand)",
                          color: "#fff",
                        }}
                      >
                        <UserIcon />
                      </span>
                      {user.username}
                    </div>

                    <button
                      onClick={logout}
                      style={{
                        fontSize: 13,
                        padding: "7px 14px",
                        color: "var(--muted)",
                        background: "transparent",
                        border: "1px solid var(--line2)",
                        borderRadius: 10,
                        cursor: "pointer",
                        transition: "all .15s",
                      }}
                    >
                      {t("nav.logout")}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowLogin(true)}
                    className="btn-grad"
                    style={{ fontSize: 14, padding: "9px 22px" }}
                  >
                    {t("nav.start")}
                  </button>
                )}
              </>
            )}
          </div>

          {/* Category nav row */}
          <nav
            aria-label="카테고리 내비게이션"
            style={{ display: "flex", gap: 4, paddingBottom: 12, overflowX: "auto" }}
            className="rail-scroll"
          >
            {navItems.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`cat-pill${isActive ? " active" : ""}`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
    </>
  );
}
