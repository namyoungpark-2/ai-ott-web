import type { VideoOrientation } from "@/types/video";

type Props = {
  src: string | null;
  isPlaying: boolean;
  orientation: VideoOrientation;
};

/**
 * Blurred thumbnail background behind the video.
 * More prominent for portrait videos (fills the side panels).
 */
export default function BlurredBackground({ src, isPlaying, orientation }: Props) {
  if (!src) return null;

  const isPortrait = orientation === "portrait";

  return (
    <img
      src={src}
      alt=""
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        objectFit: "cover",
        filter: isPortrait
          ? "blur(40px) saturate(1.3) brightness(.4)"
          : "blur(22px) saturate(1.15) brightness(.55)",
        transform: "scale(1.06)",
        opacity: isPlaying ? (isPortrait ? 0.5 : 0.25) : (isPortrait ? 0.65 : 0.45),
        transition: "opacity .25s ease, filter .3s ease",
      }}
    />
  );
}
