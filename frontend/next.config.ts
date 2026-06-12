import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api-proxy/:path*",
        destination: "http://54.252.229.180/api/:path*",
      },
    ];
  },
};

export default nextConfig;
