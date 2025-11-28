import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,

  async rewrites() {
    return [
      {
        source: '/backend-auth/:path*',
        destination: 'http://localhost:8000/auth/:path*',
      },
    ];
  },
};

export default nextConfig;

