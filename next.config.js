/** @type {import('next').NextConfig} */
// 환경 설정
const env = process.env.NODE_ENV || 'development';
const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 
  (env === 'production' 
    ? 'https://api.example.com' 
    : env === 'staging' 
    ? 'https://staging-api.example.com' 
    : 'http://localhost:8080');

const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/uploads',
        destination: `${apiBaseUrl}/api/uploads`,
      },
      {
        source: '/stream/:path*',
        destination: `${apiBaseUrl}/stream/:path*`,
      },
      {
        source: '/thumbnails/:path*',
        destination: `${apiBaseUrl}/thumbnails/:path*`,
      },
    ];
  },
  experimental: {
    proxyClientMaxBodySize: '1024mb',
  },
  env: {
    NEXT_PUBLIC_ENV: env,
    NEXT_PUBLIC_APP_VERSION: process.env.NEXT_PUBLIC_APP_VERSION || '0.1.0',
    NEXT_PUBLIC_API_BASE_URL: apiBaseUrl,
  },
};

module.exports = nextConfig;
