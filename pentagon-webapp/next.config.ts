import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  basePath: '/pentagon-game',
  images: {
    unoptimized: true
  }
};

export default nextConfig;
