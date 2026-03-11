import { currentVersion } from '../versions';

export const homePageConfig = {
  ...currentVersion.pages.home,
  // 페이지별 추가 설정
  metadata: {
    title: 'AI OTT - Home',
    description: 'AI-powered OTT platform',
  },
  ui: {
    headerHeight: 60,
    heroHeight: '40vh',
    gridGap: 14,
  },
};
