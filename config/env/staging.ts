export const stagingConfig = {
  env: 'staging' as const,
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'https://9bdcca0e1c45.ngrok.app',
    timeout: 30000,
  },
  next: {
    rewrites: [
      {
        source: '/api/uploads',
        destination: `${process.env.NEXT_PUBLIC_API_BASE_URL || 'https://9bdcca0e1c45.ngrok.app'}/api/uploads`,
      },
      {
        source: '/stream/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_BASE_URL || 'https://9bdcca0e1c45.ngrok.app'}/stream/:path*`,
      },
      {
        source: '/thumbnails/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_BASE_URL || 'https://9bdcca0e1c45.ngrok.app'}/thumbnails/:path*`,
      },
    ],
    proxyClientMaxBodySize: '1024mb',
  },
  features: {
    enableAnalytics: true,
    enableErrorReporting: true,
    enableDebugLogs: true,
  },
  app: {
    name: 'AI OTT (Staging)',
    version: process.env.NEXT_PUBLIC_APP_VERSION || '0.1.0',
  },
};
