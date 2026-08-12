/** @type {import('next').NextConfig} */
const nextConfig = {
  // Garde les pages déjà visitées en cache client (évite skeleton à chaque retour)
  experimental: {
    staleTimes: {
      dynamic: 60,
      static: 300,
    },
  },
};

const withPWA = require("@ducanh2912/next-pwa").default({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  // false : un micro-drop 4G pendant un gros download ne doit PAS recharger Safari
  reloadOnOnline: false,
  // Fallback document si NetworkFirst n’a rien (évite l’erreur FetchEvent.respondWith)
  fallbacks: {
    document: "/~offline",
  },
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
        // ignoreSearch : ?from=/offline ne doit pas rater le cache
        urlPattern: /\/(?:figures|trips|offline|dashboard|~offline)(?:\/.*)?$/i,
        handler: "NetworkFirst",
        options: {
          cacheName: "kitequest-pages",
          networkTimeoutSeconds: 5,
          matchOptions: { ignoreSearch: true },
          expiration: { maxEntries: 64, maxAgeSeconds: 60 * 60 * 24 * 7 },
        },
      },
    ],
  },
});

module.exports = withPWA(nextConfig);
