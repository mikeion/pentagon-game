import type { NextConfig } from "next";

// Detect if we're on Vercel or building for GitHub Pages
const isVercel = process.env.VERCEL === '1';

const nextConfig: NextConfig = {
  // Only use static export for GitHub Pages, not Vercel
  output: isVercel ? undefined : 'export',
  // No basePath needed for either deployment now
  basePath: '',
  images: {
    unoptimized: true
  }
};

export default nextConfig;
