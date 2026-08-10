"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";

/** Onglets mobile — Profil regroupe Matériel / Hors-ligne / Paramètres / Admin */
const TABS = [
  {
    href: "/dashboard",
    label: "Home",
    icon: (
      <path d="M3 11.5 12 4l9 7.5M5.5 10v9a1 1 0 0 0 1 1H10v-5.5h4V20h3.5a1 1 0 0 0 1-1v-9" />
    ),
  },
  {
    href: "/figures",
    label: "Figures",
    icon: (
      <path d="m12 3 2.5 5.6 6 .6-4.5 4 1.3 5.9L12 16l-5.3 3.1L8 13.2l-4.5-4 6-.6L12 3z" />
    ),
  },
  {
    href: "/trips",
    label: "Séjours",
    icon: (
      <path d="M4 20h16M6 20V9a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v11M10 7V5a2 2 0 0 1 4 0v2M10 11h4" />
    ),
  },
  {
    href: "/community",
    label: "Amis",
    icon: (
      <path d="M8 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm8 1a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM3 19c0-2.8 2.2-5 5-5s5 2.2 5 5m1-1c.4-1.9 2-3 3.5-3 2 0 3.5 1.5 3.5 3.5" />
    ),
  },
  {
    href: "/parametres",
    label: "Profil",
    icon: (
      <path d="M12 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zm-7 9c0-3.9 3.1-6.5 7-6.5s7 2.6 7 6.5" />
    ),
  },
] as const;

function tabActive(pathname: string, href: string) {
  if (href === "/parametres") {
    // L'onglet Profil couvre aussi ses sous-pages
    return ["/parametres", "/materiel", "/offline", "/admin", "/spots", "/sessions", "/stats"].some(
      (p) => pathname === p || pathname.startsWith(`${p}/`)
    );
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function BottomNav() {
  const { status } = useSession();
  const pathname = usePathname();
  if (status !== "authenticated") return null;

  return (
    <nav className="bottom-nav" aria-label="Navigation principale">
      {TABS.map((tab) => {
        const active = tabActive(pathname, tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`bottom-nav-tab ${active ? "active" : ""}`}
            aria-current={active ? "page" : undefined}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              {tab.icon}
            </svg>
            <span>{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
