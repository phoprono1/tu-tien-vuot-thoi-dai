/** @type {import('next').NextConfig} */
const nextConfig = {
    // Enable experimental features for better performance
    experimental: {
        // Enable PPR for better performance
        ppr: false,
        // Enable server actions
        serverActions: {
            allowedOrigins: ['localhost:3000', '*.vercel.app'],
        },
    },

    // PWA and production optimizations
    poweredByHeader: false,

    // Optimize images and static assets
    images: {
        formats: ['image/webp', 'image/avif'],
        minimumCacheTTL: 60,
    },

    // Enable compression
    compress: true,

    // Headers for security and performance
    async headers() {
        return [
            {
                source: '/api/:path*',
                headers: [
                    { key: 'Access-Control-Allow-Origin', value: '*' },
                    { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
                    { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
                ],
            },
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
    },

    // Redirects for better UX
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

module.exports = nextConfig;
