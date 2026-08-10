/** @type {import('next').NextConfig} */
const nextConfig = {};

const withPWA = require("@ducanh2912/next-pwa").default({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  workboxOptions: {
    disableDevLogs: true,
    // Les vidéos Storage restent en téléchargement explicite (Cache Storage app)
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*/i,
        handler: "CacheFirst",
        options: {
          cacheName: "google-fonts",
          expiration: { maxEntries: 16, maxAgeSeconds: 60 * 60 * 24 * 365 },
        },
      },
      {
        urlPattern: /\/_next\/static\/.*/i,
        handler: "CacheFirst",
        options: {
          cacheName: "next-static",
          expiration: { maxEntries: 64, maxAgeSeconds: 60 * 60 * 24 * 30 },
        },
      },
      {
        urlPattern: /\/(?:figures|trips|offline|dashboard)(?:\/.*)?$/i,
        handler: "NetworkFirst",
        options: {
          cacheName: "kitequest-pages",
          networkTimeoutSeconds: 8,
          expiration: { maxEntries: 48, maxAgeSeconds: 60 * 60 * 24 * 7 },
        },
      },
    ],
  },
});

module.exports = withPWA(nextConfig);
