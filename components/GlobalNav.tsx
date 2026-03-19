"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAuth } from "./AuthProvider";
import LoginModal from "./LoginModal";

type Category = { label: string; slug: string };

const CATEGORIES: Category[] = [
  { label: "홈", slug: "" },
  { label: "영화", slug: "movie" },
  { label: "드라마", slug: "drama" },
  { label: "예능", slug: "variety" },
  { label: "애니메이션", slug: "animation" },
];

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

export default function GlobalNav() {
  const pathname = usePathname();
  const { user, loading, logout } = useAuth();
  const [showLogin, setShowLogin] = useState(false);

  return (
    <>
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          backdropFilter: "blur(24px) saturate(180%)",
          WebkitBackdropFilter: "blur(24px) saturate(180%)",
          background: "rgba(7, 7, 15, 0.82)",
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
              aria-label="검색"
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
                      로그아웃
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowLogin(true)}
                    className="btn-grad"
                    style={{ fontSize: 14, padding: "9px 22px" }}
                  >
                    시작하기
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
            {CATEGORIES.map(({ label, slug }) => {
              const href = slug ? `/categories/${slug}` : "/";
              const isActive =
                slug === ""
                  ? pathname === "/"
                  : pathname === href || pathname.startsWith(`${href}/`);

              return (
                <Link
                  key={slug || "home"}
                  href={href}
                  style={{
                    flexShrink: 0,
                    padding: "5px 16px",
                    borderRadius: 999,
                    fontSize: 13,
                    fontWeight: isActive ? 600 : 400,
                    color: isActive ? "#fff" : "var(--muted)",
                    background: isActive
                      ? "rgba(139, 92, 246, .20)"
                      : "transparent",
                    border: `1px solid ${isActive ? "rgba(139,92,246,.40)" : "transparent"}`,
                    transition: "all .15s",
                    whiteSpace: "nowrap",
                  }}
                >
                  {label}
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
