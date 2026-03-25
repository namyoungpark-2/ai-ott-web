import { useEffect, useState } from "react";

/**
 * Shows player UI overlay on mouse/touch activity, hides after idle timeout.
 * Always shows when video is paused.
 */
export function usePlayerUI(isPlaying: boolean, hideDelayMs = 1800) {
  const [showUI, setShowUI] = useState(true);

  useEffect(() => {
    if (!isPlaying) {
      setTimeout(() => setShowUI(true), 0);
      return;
    }

    let timer: ReturnType<typeof setTimeout>;

    const bump = () => {
      setShowUI(true);
      clearTimeout(timer);
      timer = setTimeout(() => setShowUI(false), hideDelayMs);
    };

    window.addEventListener("mousemove", bump);
    window.addEventListener("touchstart", bump);

    bump();
    return () => {
      clearTimeout(timer);
      window.removeEventListener("mousemove", bump);
      window.removeEventListener("touchstart", bump);
    };
  }, [isPlaying, hideDelayMs]);

  return showUI;
}
