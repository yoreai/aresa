import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',  // Static export for embedding
  images: {
    unoptimized: true,  // Required for static export
  },
  // Disable server-side features for static export
  trailingSlash: true,
};

export default nextConfig;
