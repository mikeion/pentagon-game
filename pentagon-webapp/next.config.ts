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
  },
  // Redirect all Vercel traffic to GitHub Pages
  async redirects() {
    if (isVercel) {
      return [
        {
          source: '/:path*',
          destination: 'https://pentagon-game.github.io/:path*',
          permanent: true,
        },
      ];
    }
    return [];
  },
};

export default nextConfig;
