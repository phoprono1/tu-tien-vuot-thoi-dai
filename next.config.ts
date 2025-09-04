import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Basic optimizations
  poweredByHeader: false,
  reactStrictMode: true,
  compress: true,

  // Development optimizations
  ...(process.env.NODE_ENV === 'development' && {
    generateEtags: false,
    onDemandEntries: {
      maxInactiveAge: 500,
      pagesBufferLength: 1,
    },
  }),

  // Experimental features
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', '*.vercel.app'],
    },
  },

  // Image optimization
  images: {
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
  },

  // Headers for security and cache control
  async headers() {
    const headers = [
      // API routes
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
      // Static assets
      {
        source: '/manifest.json',
        headers: [
          { key: 'Content-Type', value: 'application/manifest+json' },
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/sw.js',
        headers: [
          { key: 'Content-Type', value: 'application/javascript' },
          { key: 'Service-Worker-Allowed', value: '/' },
          { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' },
        ],
      },
    ];

    return headers; // Loại bỏ cấu hình cache cho /_next/static trong môi trường dev
  },

  // Simple redirects
  async redirects() {
    return [
      {
        source: '/dashboard',
        destination: '/',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
