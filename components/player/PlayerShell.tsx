"use client";

import { forwardRef, type ReactNode } from "react";
import type { VideoOrientation } from "@/types/video";

type Props = {
  orientation: VideoOrientation;
  isPlaying: boolean;
  isFullscreen: boolean;
  onDoubleClick?: () => void;
  children: ReactNode;
};

/**
 * Player container:
 * - Normal mode: inline player with aspect ratio, page scrollable below
 * - Fullscreen: fills entire screen (100vh)
 */
const PlayerShell = forwardRef<HTMLElement, Props>(function PlayerShell(
  { orientation, isPlaying, isFullscreen, onDoubleClick, children },
  ref,
) {
  return (
    <section
      ref={ref}
      id="player-root"
      data-orientation={orientation}
      onDoubleClick={onDoubleClick}
      style={{
        width: "100%",
        ...(isFullscreen
          ? { height: "100vh", position: "fixed" as const, inset: 0, zIndex: 50 }
          : { position: "relative" as const }
        ),
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#000",
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
  isFullscreen: boolean;
  children: ReactNode;
};

/**
 * Wraps the <video> element with orientation-responsive sizing.
 */
export function VideoContainer({ orientation, aspectRatio, isFullscreen, children }: VideoContainerProps) {
  const style = getVideoContainerStyle(orientation, aspectRatio, isFullscreen);

  return (
    <div style={{ position: "relative", zIndex: 2, ...style, transition: "all .3s ease" }}>
      {children}
    </div>
  );
}

function getVideoContainerStyle(
  orientation: VideoOrientation,
  aspectRatio: number,
  isFullscreen: boolean,
): React.CSSProperties {
  // Fullscreen: fill the entire screen
  if (isFullscreen) {
    return {
      width: "100%",
      height: "100%",
    };
  }

  // Normal (inline) mode
  switch (orientation) {
    case "portrait":
      return {
        width: "100%",
        maxWidth: "min(92vw, 400px)",
        aspectRatio: `${aspectRatio || 0.5625}`,
        maxHeight: "70vh",
        margin: "0 auto",
      };

    case "square":
      return {
        width: "100%",
        aspectRatio: "1 / 1",
        maxHeight: "70vh",
      };

    case "landscape":
    case "unknown":
    default:
      return {
        width: "100%",
        aspectRatio: "16 / 9",
      };
  }
}
