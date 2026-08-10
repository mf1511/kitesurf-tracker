import type { Metadata, Viewport } from "next";
import { Fredoka, Nunito } from "next/font/google";
// Design system découpé : ordre d'import = ordre de cascade
import "@/styles/tokens.css";
import "@/styles/base.css";
import "@/styles/components.css";
import "@/styles/pages.css";
import Providers from "@/components/Providers";
import Navbar from "@/components/Navbar";
import BottomNav from "@/components/bottom-nav";

// Polices expressives auto-hébergées (zéro FOUT, pas d'appel Google Fonts)
const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
});
const nunito = Nunito({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-body",
});

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

/**
 * Applique le thème avant le premier paint (anti-flash) :
 * localStorage "kq-theme" = "light" | "dark", sinon préférence système.
 */
const THEME_INIT_SCRIPT = `(function(){try{var s=localStorage.getItem("kq-theme");var d=s?s==="dark":window.matchMedia("(prefers-color-scheme: dark)").matches;var t=d?"dark":"light";document.documentElement.dataset.theme=t;var m=document.querySelector('meta[name="theme-color"]');if(m)m.setAttribute("content",d?"#0d2233":"#d4eef8");}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${fredoka.variable} ${nunito.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body>
        <a href="#main" className="skip-link">
          Aller au contenu
        </a>
        <Providers>
          <Navbar />
          <main id="main" className="page">
            {children}
          </main>
          <BottomNav />
        </Providers>
      </body>
    </html>
  );
}
