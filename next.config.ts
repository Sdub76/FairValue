import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'yellowstone',
        port: '28090',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '8090',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '28090',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8090',
      }
    ],
  },
  async rewrites() {
    return [
      {
        source: '/pb/:path*',
        destination: 'http://127.0.0.1:8090/:path*',
      },
    ]
  },
};

export default nextConfig;
