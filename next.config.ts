import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Experimental caching flags disabled — they caused stale fetch responses
  // in /portal polling. Re-enable only after validating against backend changes.
  cacheComponents: false,
  partialPrefetching: false,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "https://acac-api.duckdns.org/api/:path*",
      },
    ];
  },
};

export default nextConfig;
