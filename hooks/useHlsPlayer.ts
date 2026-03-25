import { useEffect, useRef, type RefObject } from "react";
import Hls from "hls.js";
import { getThumbnailUrl } from "@/app/lib/url";
import { BASE_URL } from "@/app/constants";
import type { ContentData } from "./useContentPolling";

/**
 * Attaches HLS.js (or native HLS on Safari) to a <video> element
 * when the content reaches READY status.
 */
export function useHlsPlayer(
  videoRef: RefObject<HTMLVideoElement | null>,
  content: ContentData | null,
) {
  const hlsRef = useRef<Hls | null>(null);

  useEffect(() => {
    if (!content || content.status !== "READY") return;
    if (!videoRef.current || !content.streamUrl) return;

    const src = getThumbnailUrl(content.streamUrl, BASE_URL);
    if (!src) return;

    const video = videoRef.current;

    // iOS/Safari native HLS
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src;
      return;
    }

    if (Hls.isSupported()) {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }

      const hls = new Hls();
      hlsRef.current = hls;
      hls.loadSource(src);
      hls.attachMedia(video);

      return () => {
        hls.destroy();
        hlsRef.current = null;
      };
    }
  }, [content, videoRef]);
}
