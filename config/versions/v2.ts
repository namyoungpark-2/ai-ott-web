/**
 * 버전 2.0 설정
 * 향후 확장을 위한 설정
 */
export const v2Config = {
  version: '2.0.0',
  pages: {
    home: {
      itemsPerPage: 30,
      heroAspectRatio: '21/9',
      gridColumns: 'repeat(auto-fill, minmax(190px, 1fr))',
      enableSearch: true,
      enableRefresh: true,
      enableFilters: true,
    },
    watch: {
      enableHls: true,
      enableSubtitles: true,
      enableQualitySelector: true,
      defaultQuality: 'auto',
      enableWatchEvents: true,
      uiAutoHideDelay: 3000,
      enableChapters: true,
    },
    upload: {
      maxFileSize: 5 * 1024 * 1024 * 1024, // 5GB
      allowedFormats: ['video/mp4', 'video/webm'],
      enableTitleInput: true,
      defaultMode: 'MOVIE',
      enableSeriesUpload: true,
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
      series: '/api/series',
    },
    defaultLanguage: 'en',
  },
  features: {
    series: true,
    playlists: true,
    recommendations: true,
  },
};
