import type { Metadata, Viewport } from "next";
import "./globals.css";
import Providers from "@/components/Providers";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "KiteQuest",
  description:
    "KiteQuest — progression ludique sur les figures de kitesurf : XP, quêtes, séjours crew.",
  metadataBase: new URL("https://kitequest.fr"),
  manifest: "/manifest.webmanifest",
  applicationName: "KiteQuest",
  appleWebApp: {
    capable: true,
    title: "KiteQuest",
    statusBarStyle: "default",
  },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/brand-mark.svg", type: "image/svg+xml" }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#d4eef8",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        {/* Polices expressives : Fredoka (display) + Nunito (UI) */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600;700&family=Nunito:wght@500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Providers>
          <Navbar />
          <main className="page">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
