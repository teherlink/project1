/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    unoptimized: false,
  },

  // Compression and performance
  compress: true,
  generateEtags: true,
  poweredByHeader: false,

  // Security headers
  headers: async () => [
    {
      source: '/:path*',
      headers: [
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff',
        },
        {
          key: 'X-Frame-Options',
          value: 'DENY',
        },
        {
          key: 'X-XSS-Protection',
          value: '1; mode=block',
        },
        {
          key: 'Referrer-Policy',
          value: 'strict-origin-when-cross-origin',
        },
        {
          key: 'Permissions-Policy',
          value: 'camera=(), microphone=(), geolocation=()',
        },
      ],
    },
  ],

  // Redirects for SEO (permanent redirects)
  redirects: async () => [
    {
      source: '/why-tether',
      destination: '/why-tether-link',
      permanent: true,
    },
  ],

  // Rewrite for sitemap API
  rewrites: async () => ({
    beforeFiles: [
      {
        source: '/sitemap.xml',
        destination: '/api/sitemap.xml',
      },
    ],
  }),

  // Enable strict mode for React in development
  reactStrictMode: true,

  // Optimize bundle size
  swcMinify: true,
};

module.exports = nextConfig;
