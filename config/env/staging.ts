export const stagingConfig = {
  env: 'staging' as const,
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'https://staging-api.example.com',
    timeout: 30000,
  },
  next: {
    rewrites: [
      {
        source: '/api/uploads',
        destination: `${process.env.NEXT_PUBLIC_API_BASE_URL || 'https://staging-api.example.com'}/api/uploads`,
      },
      {
        source: '/stream/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_BASE_URL || 'https://staging-api.example.com'}/stream/:path*`,
      },
      {
        source: '/thumbnails/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_BASE_URL || 'https://staging-api.example.com'}/thumbnails/:path*`,
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
