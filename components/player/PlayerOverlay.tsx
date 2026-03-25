import type { ContentData } from "@/hooks/useContentPolling";
import type { VideoOrientation } from "@/types/video";

type Props = {
  content: ContentData | null;
  isPlaying: boolean;
  orientation: VideoOrientation;
  onClickPlay: () => void;
  onToggleFullscreen: () => void;
};

function ProcessingCard({ content }: { content: ContentData }) {
  return (
    <div
      style={{
        width: "min(520px, 88vw)",
        padding: 18,
        borderRadius: 16,
        border: "1px solid rgba(255,255,255,.10)",
        background: "rgba(0,0,0,.55)",
        backdropFilter: "blur(10px)",
      }}
    >
      <div style={{ fontSize: 12, color: "rgba(255,255,255,.70)" }}>Encoding…</div>
      <div style={{ fontSize: 20, fontWeight: 900, marginTop: 6 }}>
        {content.title ?? "Untitled"}
      </div>
      <div style={{ marginTop: 10, color: "rgba(255,255,255,.75)", fontSize: 13 }}>
        잠시만 기다려줘. HLS로 변환 중이야.
      </div>
      <div
        style={{
          marginTop: 12,
          height: 8,
          borderRadius: 999,
          background: "rgba(255,255,255,.10)",
        }}
      >
        <div
          style={{
            width: "45%",
            height: "100%",
            borderRadius: 999,
            background: "rgba(109,94,252,.55)",
            animation: "p 1.2s ease-in-out infinite alternate",
          }}
        />
      </div>
      <style>{`@keyframes p { from { width: 25% } to { width: 70% } }`}</style>
    </div>
  );
}

function FailedCard({ content }: { content: ContentData }) {
  return (
    <div
      style={{
        width: "min(520px, 88vw)",
        padding: 18,
        borderRadius: 16,
        border: "1px solid rgba(255,255,255,.10)",
        background: "rgba(0,0,0,.55)",
        backdropFilter: "blur(10px)",
      }}
    >
      <div style={{ fontSize: 12, color: "rgba(255,255,255,.70)" }}>Failed</div>
      <div style={{ fontSize: 20, fontWeight: 900, marginTop: 6 }}>
        {content.title ?? "Untitled"}
      </div>
      <div style={{ marginTop: 10, color: "rgba(255,255,255,.75)", fontSize: 13 }}>
        {content.errorMessage ?? "Unknown error"}
      </div>
    </div>
  );
}

function ReadyOverlay({
  content,
  orientation,
  onClickPlay,
  onToggleFullscreen,
}: {
  content: ContentData;
  orientation: VideoOrientation;
  onClickPlay: () => void;
  onToggleFullscreen: () => void;
}) {
  const isPortrait = orientation === "portrait";

  return (
    <div
      onClick={onClickPlay}
      role="button"
      aria-label="Play video"
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        alignItems: isPortrait ? "center" : "flex-start",
        padding: isPortrait ? "22px 16px" : 22,
        cursor: "pointer",
        background:
          "linear-gradient(to top, rgba(0,0,0,.72), rgba(0,0,0,.20), transparent)",
      }}
    >
      <div
        style={{
          width: isPortrait ? "min(400px, 88vw)" : "min(820px, 92vw)",
          textAlign: isPortrait ? "center" : "left",
        }}
      >
        <div style={{ fontSize: 12, color: "rgba(255,255,255,.72)" }}>Now Playing</div>
        <div
          style={{
            fontSize: isPortrait ? 26 : 34,
            fontWeight: 950,
            lineHeight: 1.05,
            letterSpacing: -0.2,
            marginTop: 6,
          }}
        >
          {content.title ?? "Untitled"}
        </div>

        <div
          style={{
            marginTop: 14,
            display: "flex",
            gap: 12,
            alignItems: "center",
            justifyContent: isPortrait ? "center" : "flex-start",
          }}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClickPlay();
            }}
            style={{
              padding: "12px 14px",
              borderRadius: 12,
              background: "rgba(109,94,252,.22)",
              borderColor: "rgba(109,94,252,.50)",
              fontWeight: 800,
            }}
          >
            ▶ Play
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFullscreen();
            }}
          >
            Fullscreen
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PlayerOverlay({
  content,
  isPlaying,
  orientation,
  onClickPlay,
  onToggleFullscreen,
}: Props) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 3,
        display: "grid",
        placeItems: "center",
        pointerEvents: isPlaying ? "none" : "auto",
      }}
    >
      {content?.status === "PROCESSING" && <ProcessingCard content={content} />}
      {content?.status === "FAILED" && <FailedCard content={content} />}
      {content?.status === "READY" && !isPlaying && (
        <ReadyOverlay
          content={content}
          orientation={orientation}
          onClickPlay={onClickPlay}
          onToggleFullscreen={onToggleFullscreen}
        />
      )}
    </div>
  );
}
