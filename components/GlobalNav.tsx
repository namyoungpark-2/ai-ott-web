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
          zIndex: 20,
          backdropFilter: "blur(16px)",
          background: "rgba(11,11,15,.85)",
          borderBottom: "1px solid var(--line)",
        }}
      >
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 20px" }}>
          {/* 상단 행: 로고 + 유틸 링크 */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              height: 52,
            }}
          >
            <Link href="/" style={{ flexShrink: 0 }}>
              <span
                style={{ fontWeight: 900, letterSpacing: 0.5, fontSize: 22 }}
              >
                <span style={{ color: "var(--accent)" }}>AI</span> OTT
              </span>
            </Link>

            <div style={{ flex: 1 }} />

            {/* loading 중에는 버튼 영역 비워서 레이아웃 shift 방지 */}
            {!loading && (
              <>
                {user ? (
                  <>
                    <Link href="/upload">
                      <button style={{ fontSize: 13, padding: "7px 12px" }}>
                        Upload
                      </button>
                    </Link>
                    <Link href="/admin">
                      <button style={{ fontSize: 13, padding: "7px 12px" }}>
                        Admin
                      </button>
                    </Link>
                    <span
                      style={{
                        fontSize: 13,
                        color: "var(--muted)",
                        padding: "0 4px",
                      }}
                    >
                      {user.username}
                    </span>
                    <button
                      onClick={logout}
                      style={{ fontSize: 13, padding: "7px 12px" }}
                    >
                      로그아웃
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setShowLogin(true)}
                    style={{
                      fontSize: 13,
                      padding: "7px 16px",
                      background: "var(--accent)",
                      border: "none",
                      borderRadius: 10,
                      fontWeight: 600,
                      color: "#fff",
                    }}
                  >
                    로그인
                  </button>
                )}
              </>
            )}
          </div>

          {/* 카테고리 내비게이션 행 */}
          <nav
            aria-label="카테고리 내비게이션"
            style={{ display: "flex", gap: 2, paddingBottom: 10 }}
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
                    padding: "6px 16px",
                    borderRadius: 8,
                    fontSize: 14,
                    fontWeight: isActive ? 700 : 400,
                    color: isActive ? "#fff" : "var(--muted)",
                    background: isActive
                      ? "rgba(109,94,252,.22)"
                      : "transparent",
                    borderBottom: isActive
                      ? "2px solid var(--accent)"
                      : "2px solid transparent",
                    transition: "all .15s",
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
