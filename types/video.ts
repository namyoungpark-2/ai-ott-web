// ─── Video Domain Types ──────────────────────────────────────────────────────

export type VideoOrientation = "landscape" | "portrait" | "square" | "unknown";

export type VideoMeta = {
  width: number;
  height: number;
  orientation: VideoOrientation;
  /** width / height — e.g. 1.78 for 16:9, 0.56 for 9:16 */
  aspectRatio: number;
};

/**
 * Derive orientation from width/height.
 *   landscape : w/h >= 1.2
 *   portrait  : w/h <= 0.8
 *   square    : in between
 */
export function resolveOrientation(width: number, height: number): VideoOrientation {
  if (width <= 0 || height <= 0) return "unknown";
  const ratio = width / height;
  if (ratio >= 1.2) return "landscape";
  if (ratio <= 0.8) return "portrait";
  return "square";
}

export function buildVideoMeta(width: number, height: number): VideoMeta {
  return {
    width,
    height,
    orientation: resolveOrientation(width, height),
    aspectRatio: height > 0 ? width / height : 0,
  };
}
