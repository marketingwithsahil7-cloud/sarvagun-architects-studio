/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    formats: ["image/avif", "image/webp"],
    // Default deviceSizes starts at 640 — too coarse for small Android
    // screens, which this audience is disproportionately on.
    deviceSizes: [360, 420, 640, 828, 1080, 1280, 1920, 2560],
    // 2026-09-12: all photo/video media moved off the app bundle onto
    // Vercel Blob (public/'s footprint was 5.3GB — the whole reason for
    // this move — see README's "Blob media migration" section). next/image
    // refuses to optimize an external host unless it's explicitly
    // allowlisted; the wildcard subdomain (not a hardcoded store id) is
    // Vercel's own documented pattern for this, since a store's hostname is
    // otherwise a magic string this config would silently break on if the
    // store were ever recreated.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
    ],
  },
};

export default nextConfig;
