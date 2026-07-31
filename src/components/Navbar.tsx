"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Ferme le menu au changement de page
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Empêche le scroll body quand le menu est ouvert
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <nav className={`navbar ${open ? "nav-open" : ""}`}>
      <div className="nav-bar-row">
        <Link href={status === "authenticated" ? "/dashboard" : "/"} className="brand">
          Kitesurf Tracker
        </Link>

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

        <div className="nav-links nav-links-desktop">
          <NavLinks session={session} status={status} />
        </div>
      </div>

      {/* Panneau mobile */}
      <div className={`nav-drawer ${open ? "open" : ""}`} id="nav-drawer">
        <div className="nav-links nav-links-mobile">
          <NavLinks session={session} status={status} />
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
    </nav>
  );
}

function NavLinks({
  session,
  status,
}: {
  session: ReturnType<typeof useSession>["data"];
  status: string;
}) {
  return (
    <>
      <Link href="/figures">Figures</Link>
      {status === "authenticated" && (
        <>
          <Link href="/dashboard">Mon aventure</Link>
          <Link href="/trips">Séjours</Link>
          <Link href="/community">Communauté</Link>
          {session?.user?.role === "admin" && (
            <Link href="/admin" className="nav-admin">Admin</Link>
          )}
          <span className="nav-email">{session?.user?.email}</span>
          <button className="nav-btn" onClick={() => signOut({ callbackUrl: "/login" })}>
            Déconnexion
          </button>
        </>
      )}
      {status === "unauthenticated" && (
        <>
          <Link href="/login">Connexion</Link>
          <Link href="/register" className="nav-cta">
            Jouer
          </Link>
        </>
      )}
    </>
  );
}
