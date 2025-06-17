/* eslint-disable @typescript-eslint/no-require-imports */
const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,

  buildExcludes: [/app-build-manifest\.json$/],

  runtimeCaching: [
    {
      // Cache jsPDF for offline PDF generation
      urlPattern: /^https:\/\/cdnjs\.cloudflare\.com\/ajax\/libs\/jspdf\/2\.5\.1\/jspdf\.umd\.min\.js$/,
      handler: "StaleWhileRevalidate",
      options: {
        cacheName: "jsdelivr-jspdf",
        expiration: {
          maxEntries: 1,
          maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
        },
      },
    },
  ],
});

module.exports = withPWA({
  reactStrictMode: true,

  // Optional: if you're using images in next/image
  images: {
    domains: ["raw.githubusercontent.com"],
  },

  // Do NOT include "__PWA_START_URL__" here! It's set automatically at build time
});
