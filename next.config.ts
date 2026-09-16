import type { NextConfig } from "next";

const extraOrigins =
  process.env.ALLOWED_DEV_ORIGINS?.split(",")
    .map((item) => item.trim())
    .filter(Boolean) ?? [];

const nextConfig: NextConfig = {
  // Preview from cursor.com / Desktop tunnels is a different Origin than
  // 127.0.0.1. Next.js 16 blocks /_next/* from unknown hosts with 403.
  allowedDevOrigins: [
    "127.0.0.1",
    "localhost",
    "cursor.com",
    "**.cursor.com",
    "cursor.sh",
    "**.cursor.sh",
    "cursorusercontent.com",
    "**.cursorusercontent.com",
    ...extraOrigins,
  ],
  experimental: {
    serverActions: {
      bodySizeLimit: "2gb",
    },
    proxyClientMaxBodySize: "2gb",
  },
};

export default nextConfig;
