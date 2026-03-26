export const stagingConfig = {
  env: 'staging' as const,
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'https://18aa8e56e5bc.ngrok.app',
    timeout: 30000,
  },
  next: {
    rewrites: [
      {
        source: '/api/uploads',
        destination: `${process.env.NEXT_PUBLIC_API_BASE_URL || 'https://18aa8e56e5bc.ngrok.app'}/api/uploads`,
      },
      {
        source: '/stream/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_BASE_URL || 'https://18aa8e56e5bc.ngrok.app'}/stream/:path*`,
      },
      {
        source: '/thumbnails/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_BASE_URL || 'https://18aa8e56e5bc.ngrok.app'}/thumbnails/:path*`,
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
