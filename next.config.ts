import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      { hostname: "*.supabase.co" },
    ],
  },
};

export default nextConfig;
