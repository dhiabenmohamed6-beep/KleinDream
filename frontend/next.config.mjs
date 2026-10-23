/** @type {import('next').NextConfig} */
const nextConfig = {
  skipTrailingSlashRedirect: true,
  async rewrites() {
    // In local development, proxy to local Django server at port 8001.
    // On Vercel, routing is handled by the root vercel.json multi-service rewrites.
    if (process.env.VERCEL) {
      return [];
    }
    const backend = process.env.BACKEND_URL || 'http://127.0.0.1:8001';
    return [
      {
        source: '/api/v1/:path*',
        destination: `${backend}/api/v1/:path*`,
      },
      {
        source: '/media/:path*',
        destination: `${backend}/media/:path*`,
      },
    ];
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'raw.githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: '*.vercel.app',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
  },
  // API/media routing is handled by the root vercel.json rewrites
  // (./vercel.json) so the same domain serves frontend + backend.
};

export default nextConfig;