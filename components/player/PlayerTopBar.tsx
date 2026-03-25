import Link from "next/link";

type Props = {
  showUI: boolean;
  onToggleFullscreen: () => void;
  isFullscreen: boolean;
};

export default function PlayerTopBar({ showUI, onToggleFullscreen, isFullscreen }: Props) {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 20,
        padding: "14px 18px",
        display: "flex",
        alignItems: "center",
        gap: 12,
        pointerEvents: showUI ? "auto" : "none",
        opacity: showUI ? 1 : 0,
        transition: "opacity .18s ease",
        background:
          "linear-gradient(to bottom, rgba(0,0,0,.65), rgba(0,0,0,.12), transparent)",
      }}
    >
      <Link href="/" style={{ fontWeight: 800, color: "rgba(255,255,255,.92)" }}>
        ← Back
      </Link>
      <div style={{ flex: 1 }} />
      <button onClick={onToggleFullscreen} aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}>
        {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
      </button>
    </div>
  );
}
