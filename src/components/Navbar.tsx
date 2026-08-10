"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import BrandMark from "@/components/brand-mark";
import NavProfileMenu from "@/components/nav-profile-menu";

/** Liens produit — réservés aux sessions connectées (logout = LP + Connexion) */
const PRIMARY_LINKS = [
  { href: "/dashboard", label: "Home", auth: true },
  { href: "/figures", label: "Figures", auth: true },
  { href: "/spots", label: "Spots", auth: true },
  { href: "/sessions", label: "Sessions", auth: true },
  { href: "/trips", label: "Séjours", auth: true },
  { href: "/community", label: "Communauté", auth: true },
] as const;

function linkActive(pathname: string, href: string) {
  if (href === "/figures") {
    return pathname === "/figures" || pathname.startsWith("/figures/");
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function Navbar() {
  const { status } = useSession();
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const authed = status === "authenticated";
  const loadingSession = status === "loading";

  // Ferme le drawer au changement de page
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Empêche le scroll body quand le menu mobile est ouvert
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const primary = PRIMARY_LINKS.filter((l) => !("auth" in l && l.auth) || authed);

  return (
    <nav className={`navbar ${open ? "nav-open" : ""}`}>
      <div className="nav-bar-row">
        <Link href={authed ? "/dashboard" : "/"} className="brand">
          <BrandMark className="brand-mark" />
          <span>
            Kite<span className="brand-accent">Quest</span>
          </span>
        </Link>

        {/* Burger : visiteurs seulement — connecté, la bottom nav mobile prend le relais */}
        {status === "unauthenticated" && (
          <button
            type="button"
            className="nav-burger"
            aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <span />
            <span />
            <span />
          </button>
        )}

        <div className="nav-links nav-links-desktop">
          {primary.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={linkActive(pathname, l.href) ? "nav-link-active" : undefined}
              aria-current={linkActive(pathname, l.href) ? "page" : undefined}
            >
              {l.label}
            </Link>
          ))}
          {loadingSession ? (
            // Placeholder pendant la résolution de session : évite le "trou" UI
            <span className="nav-skeleton" aria-hidden>
              <span className="skeleton wide" />
              <span className="skeleton" />
            </span>
          ) : authed ? (
            <NavProfileMenu variant="desktop" />
          ) : (
            <>
              <Link href="/login">Connexion</Link>
              <Link href="/register" className="nav-cta">
                Inscription
              </Link>
            </>
          )}
        </div>
      </div>

      {status === "unauthenticated" && (
        <>
          <div className={`nav-drawer ${open ? "open" : ""}`} id="nav-drawer">
            <div className="nav-links nav-links-mobile">
              <Link href="/login" onClick={() => setOpen(false)}>
                Connexion
              </Link>
              <Link href="/register" className="nav-cta" onClick={() => setOpen(false)}>
                Inscription
              </Link>
            </div>
          </div>

          {open && (
            <button
              type="button"
              className="nav-backdrop"
              aria-label="Fermer le menu"
              onClick={() => setOpen(false)}
            />
          )}
        </>
      )}
    </nav>
  );
}
