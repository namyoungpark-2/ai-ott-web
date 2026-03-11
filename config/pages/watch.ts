import { currentVersion } from '../versions';

export const watchPageConfig = {
  ...currentVersion.pages.watch,
  // 페이지별 추가 설정
  metadata: {
    title: 'AI OTT - Watch',
    description: 'Watch video content',
  },
  player: {
    controls: {
      enablePlayPause: true,
      enableVolume: true,
      enableFullscreen: true,
      enableProgress: true,
    },
    keyboard: {
      enableShortcuts: true,
      spaceToPlayPause: true,
      arrowKeysToSeek: true,
    },
  },
};
