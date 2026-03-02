import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Docker 자체 호스팅 빌드 시에만 standalone 출력 활성화
  // Vercel에서는 불필요하며 RSC 스트리밍 에러를 유발함
  output: process.env.NEXT_OUTPUT === "standalone" ? "standalone" : undefined,
  images: {
    remotePatterns: [
      { hostname: "*.supabase.co" },
    ],
  },
};

export default nextConfig;
