import { useEffect, type RefObject } from "react";

type Options = {
  onToggleFullscreen?: () => void;
};

/**
 * Player keyboard shortcuts:
 *   Space  — play/pause
 *   ←/→    — seek ±5s
 *   F      — toggle fullscreen
 */
export function useKeyboardShortcuts(
  videoRef: RefObject<HTMLVideoElement | null>,
  options: Options = {},
) {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const v = videoRef.current;
      if (!v) return;

      const tag = (e.target as HTMLElement | null)?.tagName?.toLowerCase();
      if (tag === "input" || tag === "textarea") return;

      if (e.code === "Space") {
        e.preventDefault();
        if (e.repeat) return;
        if (v.paused) v.play().catch(() => {});
        else v.pause();
      }

      if (e.code === "ArrowLeft") {
        e.preventDefault();
        v.currentTime = Math.max(0, v.currentTime - 5);
      }
      if (e.code === "ArrowRight") {
        e.preventDefault();
        v.currentTime = Math.min(v.duration || Number.MAX_SAFE_INTEGER, v.currentTime + 5);
      }

      if (e.code === "KeyF") {
        e.preventDefault();
        options.onToggleFullscreen?.();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [videoRef, options]);
}
