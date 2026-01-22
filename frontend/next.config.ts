import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // API のベース URL を設定（必要に応じて）
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost/api/:path*", // Laravel API へのプロキシ
      },
    ];
  },
};

export default nextConfig;
