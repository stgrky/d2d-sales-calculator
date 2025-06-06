/* eslint-disable @typescript-eslint/no-require-imports */
const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,

  // ---------------------------------------------
  // ← Add this to skip precaching `app-build-manifest.json`
  buildExcludes: [/app-build-manifest\.json$/],

  runtimeCaching: [
    {
      // Cache the jsPDF CDN so PDF still works offline
      urlPattern:
        /^https:\/\/cdnjs\.cloudflare\.com\/ajax\/libs\/jspdf\/2\.5\.1\/jspdf\.umd\.min\.js$/,
      handler: "StaleWhileRevalidate",
      options: {
        cacheName: "jsdelivr-jspdf",
        expiration: {
          maxEntries: 1,
          maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
        },
      },
    },
    // …you can add more runtimeCaching rules here if needed…
  ],
});

module.exports = withPWA({
  reactStrictMode: true,
  // (remove swcMinify—Next 15+ does SWC minification by default)
});
