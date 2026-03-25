type Props = {
  showUI: boolean;
  isPlaying: boolean;
};

export default function PlayerBottomHint({ showUI, isPlaying }: Props) {
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 10,
        padding: 18,
        pointerEvents: "none",
        opacity: showUI && isPlaying ? 1 : 0,
        transition: "opacity .18s ease",
        background:
          "linear-gradient(to top, rgba(0,0,0,.65), rgba(0,0,0,.10), transparent)",
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          color: "rgba(255,255,255,.75)",
          fontSize: 12,
        }}
      >
        Space: 재생/일시정지 &middot; ←/→: 5초 이동 &middot; F: 전체화면
      </div>
    </div>
  );
}
