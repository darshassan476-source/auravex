import type { NextConfig } from "next";

// Set on the frontend-only deployment (Netlify): the API and the tracked
// redirects are served by the backend (Render), proxied so the browser still
// sees one origin and the session cookie stays first-party.
const backend = process.env.AURAVEX_BACKEND_URL?.replace(/\/+$/, "");

const nextConfig: NextConfig = {
  images: {
    // Hero plates are large and soft; one quality level is enough.
    qualities: [82],
    formats: ["image/avif", "image/webp"],
  },
  // No floating dev badge or dev overlay on the page.
  devIndicators: false,
  // Server-only libraries are loaded from node_modules at runtime, not bundled.
  serverExternalPackages: ["web-push", "@anthropic-ai/sdk", "nodemailer", "@ffmpeg-installer/ffmpeg"],
  ...(backend
    ? {
        async rewrites() {
          return {
            // Before the app's own routes, which exist in this build but have no database.
            beforeFiles: [
              { source: "/api/:path*", destination: `${backend}/api/:path*` },
              { source: "/go/:path*", destination: `${backend}/go/:path*` },
            ],
            afterFiles: [],
            fallback: [],
          };
        },
      }
    : {}),
};

export default nextConfig;
