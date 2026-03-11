/**
 * 버전 1.0 설정
 * 초기 버전 설정
 */
export const v1Config = {
  version: '1.0.0',
  pages: {
    home: {
      itemsPerPage: 20,
      heroAspectRatio: '21/9',
      gridColumns: 'repeat(auto-fill, minmax(190px, 1fr))',
      enableSearch: true,
      enableRefresh: true,
    },
    watch: {
      enableHls: true,
      enableSubtitles: false,
      enableQualitySelector: false,
      defaultQuality: 'auto',
      enableWatchEvents: true,
      uiAutoHideDelay: 3000,
    },
    upload: {
      maxFileSize: 1024 * 1024 * 1024, // 1GB
      allowedFormats: ['video/mp4'],
      enableTitleInput: true,
      defaultMode: 'MOVIE',
    },
  },
  api: {
    endpoints: {
      feed: '/api/feed',
      contents: '/api/contents',
      uploads: '/api/uploads',
      watchEvents: '/api/watch-events',
      hls: '/hls',
      thumbnails: '/thumbnails',
    },
    defaultLanguage: 'en',
  },
  features: {
    series: false,
    playlists: false,
    recommendations: false,
  },
};
