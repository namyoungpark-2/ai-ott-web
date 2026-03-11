export const developmentConfig = {
  env: 'development' as const,
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080',
    timeout: 30000,
  },
  next: {
    rewrites: [
      {
        source: '/api/uploads',
        destination: 'http://localhost:8080/api/uploads',
      },
      {
        source: '/stream/:path*',
        destination: 'http://localhost:8080/stream/:path*',
      },
      {
        source: '/thumbnails/:path*',
        destination: 'http://localhost:8080/thumbnails/:path*',
      },
    ],
    proxyClientMaxBodySize: '1024mb',
  },
  features: {
    enableAnalytics: false,
    enableErrorReporting: false,
    enableDebugLogs: true,
  },
  app: {
    name: 'AI OTT',
    version: process.env.NEXT_PUBLIC_APP_VERSION || '0.1.0',
  },
};
