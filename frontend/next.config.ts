import type { NextConfig } from "next";

// BACKEND_URL is a server-side only env var (no NEXT_PUBLIC_ prefix).
// The HTTP backend URL never reaches the browser — only used here in the proxy.
// On Vercel: set BACKEND_URL=http://54.252.229.180
// Locally: defaults to http://localhost:8000
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api-proxy/:path*",
        destination: `${BACKEND_URL}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
