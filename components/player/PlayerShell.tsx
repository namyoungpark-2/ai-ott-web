"use client";

import { forwardRef, type ReactNode } from "react";
import type { VideoOrientation } from "@/types/video";

type Props = {
  orientation: VideoOrientation;
  isPlaying: boolean;
  onDoubleClick?: () => void;
  children: ReactNode;
};

/**
 * The outermost player container that adapts its layout strategy
 * based on video orientation.
 *
 * Landscape: maximize width (16:9 cinematic feel)
 * Portrait:  maximize height (9:16, TikTok/Reels-like, blurred side panels)
 * Square:    balanced sizing
 * Unknown:   defaults to landscape behavior
 */
const PlayerShell = forwardRef<HTMLElement, Props>(function PlayerShell(
  { orientation, isPlaying, onDoubleClick, children },
  ref,
) {
  return (
    <section
      ref={ref}
      id="player-root"
      data-orientation={orientation}
      onDoubleClick={onDoubleClick}
      style={{
        height: "100vh",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#000",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {children}
    </section>
  );
});

export default PlayerShell;

// ─── Video element with orientation-aware sizing ──────────────────────────────

type VideoContainerProps = {
  orientation: VideoOrientation;
  aspectRatio: number;
  children: ReactNode;
};

/**
 * Wraps the <video> element with orientation-responsive sizing.
 */
export function VideoContainer({ orientation, aspectRatio, children }: VideoContainerProps) {
  const style = getVideoContainerStyle(orientation, aspectRatio);

  return (
    <div style={{ position: "relative", zIndex: 2, ...style, transition: "all .3s ease" }}>
      {children}
    </div>
  );
}

function getVideoContainerStyle(
  orientation: VideoOrientation,
  aspectRatio: number,
): React.CSSProperties {
  switch (orientation) {
    case "portrait":
      return {
        height: "min(88vh, calc(100vh - 60px))",
        // Width derived from height * aspect ratio, but capped
        maxWidth: "min(92vw, 500px)",
        width: `calc(min(88vh, calc(100vh - 60px)) * ${aspectRatio || 0.5625})`,
      };

    case "square":
      return {
        width: "min(80vh, 80vw, 700px)",
        height: "min(80vh, 80vw, 700px)",
      };

    case "landscape":
    case "unknown":
    default:
      return {
        width: "min(1200px, 92vw)",
        aspectRatio: "16 / 9",
        maxHeight: "80vh",
      };
  }
}
