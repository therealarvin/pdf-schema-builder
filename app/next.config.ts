import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    // Ignore ESLint errors during production builds
    ignoreDuringBuilds: true,
  },
  typescript: {
    // TypeScript errors are already checked
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
