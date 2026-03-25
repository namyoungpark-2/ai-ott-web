import { useEffect, useState, type RefObject } from "react";
import { buildVideoMeta, type VideoMeta, type VideoOrientation } from "@/types/video";

type UseVideoOrientationOptions = {
  /** Pre-known dimensions from backend (avoids layout shift before loadedmetadata) */
  initialWidth?: number | null;
  initialHeight?: number | null;
};

type UseVideoOrientationResult = {
  orientation: VideoOrientation;
  meta: VideoMeta | null;
  isLoading: boolean;
};

const UNKNOWN_RESULT: UseVideoOrientationResult = {
  orientation: "unknown",
  meta: null,
  isLoading: true,
};

/**
 * Detects video orientation from the <video> element's intrinsic dimensions.
 *
 * 1. If backend-provided initialWidth/Height are given, uses them immediately.
 * 2. Listens to `loadedmetadata` for accurate intrinsic dimensions.
 * 3. Listens to `resize` to handle mid-stream dimension changes (rare but possible).
 */
export function useVideoOrientation(
  videoRef: RefObject<HTMLVideoElement | null>,
  options: UseVideoOrientationOptions = {},
): UseVideoOrientationResult {
  const { initialWidth, initialHeight } = options;

  const [result, setResult] = useState<UseVideoOrientationResult>(() => {
    if (initialWidth && initialHeight && initialWidth > 0 && initialHeight > 0) {
      const meta = buildVideoMeta(initialWidth, initialHeight);
      return { orientation: meta.orientation, meta, isLoading: false };
    }
    return UNKNOWN_RESULT;
  });

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    function update() {
      const v = videoRef.current;
      if (!v) return;
      const w = v.videoWidth;
      const h = v.videoHeight;
      if (w > 0 && h > 0) {
        const meta = buildVideoMeta(w, h);
        setResult({ orientation: meta.orientation, meta, isLoading: false });
      }
    }

    // Check if metadata is already available (e.g., component re-mount)
    if (video.videoWidth > 0 && video.videoHeight > 0) {
      update();
    }

    video.addEventListener("loadedmetadata", update);
    video.addEventListener("resize", update);

    return () => {
      video.removeEventListener("loadedmetadata", update);
      video.removeEventListener("resize", update);
    };
  }, [videoRef]);

  return result;
}
