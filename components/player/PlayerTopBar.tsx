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
    // 히스토리가 있으면 뒤로, 없으면 홈으로
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  }

  return (
    <>
      {/* Back button — always visible and clickable */}
      <button
        onClick={handleBack}
        aria-label="뒤로 가기"
        style={{
          position: "fixed",
          top: 14,
          left: 18,
          zIndex: 21,
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
          flexShrink: 0,
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

      {/* Top bar — fades with mouse activity */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 20,
          padding: "14px 18px 14px 72px",
          display: "flex",
          alignItems: "center",
          gap: 14,
          pointerEvents: showUI ? "auto" : "none",
          opacity: showUI ? 1 : 0,
          transition: "opacity .2s ease",
          background:
            "linear-gradient(to bottom, rgba(0,0,0,.75), rgba(0,0,0,.15), transparent)",
        }}
      >
        {/* Title (shown during playback) */}
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

        {/* Fullscreen button */}
        <button
          onClick={onToggleFullscreen}
          aria-label={isFullscreen ? "전체화면 해제" : "전체화면"}
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
            fontSize: 18,
            cursor: "pointer",
            transition: "background .15s",
            flexShrink: 0,
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,.2)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,.1)"; }}
        >
          {isFullscreen ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 3v3a2 2 0 0 1-2 2H3" />
              <path d="M21 8h-3a2 2 0 0 1-2-2V3" />
              <path d="M3 16h3a2 2 0 0 1 2 2v3" />
              <path d="M16 21v-3a2 2 0 0 1 2-2h3" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 3H5a2 2 0 0 0-2 2v3" />
              <path d="M21 8V5a2 2 0 0 0-2-2h-3" />
              <path d="M3 16v3a2 2 0 0 0 2 2h3" />
              <path d="M16 21h3a2 2 0 0 0 2-2v-3" />
            </svg>
          )}
        </button>
      </div>
    </>
  );
}
