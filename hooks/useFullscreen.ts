import { useCallback, useEffect, useState } from "react";
import type { VideoOrientation } from "@/types/video";

type FullscreenDoc = Document & {
  webkitFullscreenElement?: Element;
  mozFullScreenElement?: Element;
  webkitExitFullscreen?: () => void;
};
type FullscreenEl = Element & {
  requestFullscreen?: () => Promise<void>;
  webkitRequestFullscreen?: () => void;
};

type ScreenOrientationEx = ScreenOrientation & {
  lock?: (orientation: string) => Promise<void>;
  unlock?: () => void;
};

/**
 * Fullscreen toggle with orientation-aware locking for mobile.
 *
 * - Landscape video → locks to "landscape" in fullscreen
 * - Portrait video  → locks to "portrait" in fullscreen
 * - Falls back gracefully on unsupported browsers
 */
export function useFullscreen(
  elementId: string,
  orientation: VideoOrientation = "unknown",
) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const onChange = () => {
      const doc = document as FullscreenDoc;
      const active = !!(doc.fullscreenElement || doc.webkitFullscreenElement || doc.mozFullScreenElement);
      setIsFullscreen(active);

      // Release orientation lock on exit
      if (!active) {
        try {
          const so = screen.orientation as ScreenOrientationEx;
          so.unlock?.();
        } catch {
          // unsupported
        }
      }
    };

    document.addEventListener("fullscreenchange", onChange);
    document.addEventListener("webkitfullscreenchange", onChange);
    return () => {
      document.removeEventListener("fullscreenchange", onChange);
      document.removeEventListener("webkitfullscreenchange", onChange);
    };
  }, []);

  const toggle = useCallback(() => {
    const el = document.getElementById(elementId);
    if (!el) return;

    const doc = document as FullscreenDoc;
    const fsEl = el as FullscreenEl;

    const isActive = !!(doc.fullscreenElement || doc.webkitFullscreenElement || doc.mozFullScreenElement);

    if (!isActive) {
      const enterFn = fsEl.requestFullscreen ?? fsEl.webkitRequestFullscreen;
      enterFn?.call(fsEl);

      // Attempt orientation lock based on video orientation
      if (orientation === "landscape" || orientation === "portrait") {
        try {
          const so = screen.orientation as ScreenOrientationEx;
          so.lock?.(orientation === "landscape" ? "landscape" : "portrait").catch(() => {});
        } catch {
          // unsupported
        }
      }
    } else {
      (doc.exitFullscreen ?? doc.webkitExitFullscreen)?.call(doc);
    }
  }, [elementId, orientation]);

  return { isFullscreen, toggle };
}
