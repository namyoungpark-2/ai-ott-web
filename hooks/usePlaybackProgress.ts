import { useEffect, type RefObject } from "react";
import type { ContentData } from "./useContentPolling";

/**
 * Saves playback position on pause and beforeunload events.
 */
export function usePlaybackProgress(
  videoRef: RefObject<HTMLVideoElement | null>,
  content: ContentData | null,
) {
  useEffect(() => {
    if (!content || content.status !== "READY") return;
    const v = videoRef.current;
    if (!v) return;

    async function saveProgress() {
      if (!v || !content) return;
      const positionMs = Math.floor(v.currentTime * 1000);
      if (positionMs <= 0) return;
      try {
        await fetch(`/api/me/playback-progress/${content.id}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ positionMs }),
          keepalive: true,
        });
      } catch {
        // 네트워크 오류는 조용히 무시
      }
    }

    const onPause = () => {
      saveProgress();
    };
    v.addEventListener("pause", onPause);

    const onBeforeUnload = () => {
      saveProgress();
    };
    window.addEventListener("beforeunload", onBeforeUnload);

    return () => {
      v.removeEventListener("pause", onPause);
      window.removeEventListener("beforeunload", onBeforeUnload);
    };
  }, [content, videoRef]);
}
