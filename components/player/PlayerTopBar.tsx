"use client";

import { useRouter } from "next/navigation";

type Props = {
  showUI: boolean;
  onToggleFullscreen: () => void;
  isFullscreen: boolean;
  title?: string;
};

export default function PlayerTopBar({ showUI, onToggleFullscreen, isFullscreen, title }: Props) {
  const router = useRouter();

  function handleBack() {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  }

  // ── Normal mode: simple top bar above player ────────────────────────────
  if (!isFullscreen) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "10px 20px",
          maxWidth: 1200,
          margin: "0 auto",
        }}
      >
        <button
          onClick={handleBack}
          aria-label="뒤로 가기"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "8px 14px",
            borderRadius: 10,
            border: "1px solid var(--line2)",
            background: "transparent",
            color: "var(--text)",
            fontSize: 13,
            fontWeight: 500,
            cursor: "pointer",
            transition: "all .15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(139,92,246,.08)";
            e.currentTarget.style.borderColor = "rgba(139,92,246,.25)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.borderColor = "var(--line2)";
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          뒤로
        </button>

        {title && (
          <span
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: "var(--text)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              flex: 1,
              minWidth: 0,
            }}
          >
            {title}
          </span>
        )}
      </div>
    );
  }

  // ── Fullscreen mode: floating overlay ───────────────────────────────────
  return (
    <>
      {/* Back button — always visible */}
      <button
        onClick={handleBack}
        aria-label="뒤로 가기"
        style={{
          position: "fixed",
          top: 14,
          left: 18,
          zIndex: 51,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 42,
          height: 42,
          borderRadius: "50%",
          border: "none",
          background: "rgba(0,0,0,.45)",
          color: "#fff",
          fontSize: 20,
          cursor: "pointer",
          transition: "background .15s, transform .12s",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(0,0,0,.7)"; e.currentTarget.style.transform = "scale(1.05)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(0,0,0,.45)"; e.currentTarget.style.transform = "scale(1)"; }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>

      {/* Title + fullscreen exit — fades with mouse */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          padding: "14px 18px 14px 72px",
          display: "flex",
          alignItems: "center",
          gap: 14,
          pointerEvents: showUI ? "auto" : "none",
          opacity: showUI ? 1 : 0,
          transition: "opacity .2s ease",
          background: "linear-gradient(to bottom, rgba(0,0,0,.75), rgba(0,0,0,.15), transparent)",
        }}
      >
        {title && (
          <span
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: "rgba(255,255,255,.85)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              flex: 1,
              minWidth: 0,
            }}
          >
            {title}
          </span>
        )}
        {!title && <div style={{ flex: 1 }} />}

        <button
          onClick={onToggleFullscreen}
          aria-label="전체화면 해제"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 40,
            height: 40,
            borderRadius: "50%",
            border: "none",
            background: "rgba(255,255,255,.1)",
            color: "#fff",
            cursor: "pointer",
            transition: "background .15s",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,.2)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,.1)"; }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 3v3a2 2 0 0 1-2 2H3" />
            <path d="M21 8h-3a2 2 0 0 1-2-2V3" />
            <path d="M3 16h3a2 2 0 0 1 2 2v3" />
            <path d="M16 21v-3a2 2 0 0 1 2-2h3" />
          </svg>
        </button>
      </div>
    </>
  );
}
