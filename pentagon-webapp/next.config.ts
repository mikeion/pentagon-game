import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === 'production';

const nextConfig: NextConfig = {
  output: 'export',
  basePath: '',  // No basePath needed anymore!
  images: {
    unoptimized: true
  }
};

export default nextConfig;
