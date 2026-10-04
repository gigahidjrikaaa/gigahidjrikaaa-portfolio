import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    // Serve AVIF/WebP from the built-in optimizer (falls back as needed)
    formats: ["image/avif", "image/webp"],
    // Local optimized sources change rarely; keep optimizer output cached for 30 days
    minimumCacheTTL: 60 * 60 * 24 * 30,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "encrypted-tbn0.gstatic.com",
      },
      {
        protocol: "https",
        hostname: "kompaspedia.kompas.id",
      },
      // Allow any external hostname for admin-managed URLs
      // (institution backgrounds, logos, etc. entered via admin panel)
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
