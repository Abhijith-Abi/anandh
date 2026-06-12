import type { NextConfig } from "next";

// Proxy all /api-proxy/* calls server-side to the backend.
// Browser only ever calls the same Vercel origin (HTTPS) — no mixed-content issues.
// Locally, override with: BACKEND_URL=http://localhost:8000 in .env.local
const BACKEND_URL = process.env.BACKEND_URL || "http://54.252.229.180";

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
