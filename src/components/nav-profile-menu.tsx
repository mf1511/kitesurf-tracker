"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

/** Initiales pour l’avatar (prénom/nom ou email) */
function initials(name?: string | null, email?: string | null): string {
  const n = name?.trim();
  if (n) {
    const parts = n.split(/\s+/);
    return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "?";
  }
  return (email?.[0] ?? "?").toUpperCase();
}

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

type Props = {
  /** Desktop = dropdown ; mobile = liste dans le drawer */
  variant: "desktop" | "mobile";
  onNavigate?: () => void;
};

export default function NavProfileMenu({ variant, onNavigate }: Props) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const user = session?.user;
  const label = user?.name?.trim() || user?.email || "Profil";
  const avatar = initials(user?.name, user?.email);
  const isAdmin = user?.role === "admin";

  // Ferme le dropdown au clic extérieur / Escape
  useEffect(() => {
    if (!open || variant !== "desktop") return;
    function onDoc(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, variant]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const items: { href: string; label: string; className?: string }[] = [
    { href: "/materiel", label: "Matériel" },
    { href: "/offline", label: "Hors-ligne" },
    { href: "/parametres", label: "Paramètres" },
  ];
  if (isAdmin) {
    items.push({ href: "/admin", label: "Admin", className: "nav-admin" });
  }

  function go() {
    setOpen(false);
    onNavigate?.();
  }

  if (variant === "mobile") {
    return (
      <div className="nav-profile-mobile">
        <div className="nav-profile-card">
          <span className="nav-avatar" aria-hidden>
            {avatar}
          </span>
          <div className="nav-profile-meta">
            <strong>{label}</strong>
            {user?.name && user?.email ? <span>{user.email}</span> : null}
          </div>
        </div>
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`${item.className ?? ""}${isActive(pathname, item.href) ? " nav-link-active" : ""}`}
            onClick={go}
          >
            {item.label}
          </Link>
        ))}
        <button
          type="button"
          className="nav-btn nav-logout"
          onClick={() => signOut({ callbackUrl: "/login" })}
        >
          Déconnexion
        </button>
      </div>
    );
  }

  return (
    <div className={`nav-profile ${open ? "open" : ""}`} ref={rootRef}>
      <button
        type="button"
        className="nav-profile-trigger"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="nav-avatar" aria-hidden>
          {avatar}
        </span>
        <span className="nav-profile-trigger-label">Profil</span>
        <span className="nav-caret" aria-hidden />
      </button>

      {open && (
        <div className="nav-profile-dropdown" role="menu">
          <div className="nav-profile-card">
            <span className="nav-avatar" aria-hidden>
              {avatar}
            </span>
            <div className="nav-profile-meta">
              <strong>{label}</strong>
              {user?.email ? <span>{user.email}</span> : null}
            </div>
          </div>
          <div className="nav-profile-sep" />
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              role="menuitem"
              className={`${item.className ?? ""}${isActive(pathname, item.href) ? " nav-link-active" : ""}`}
              onClick={go}
            >
              {item.label}
            </Link>
          ))}
          <div className="nav-profile-sep" />
          <button
            type="button"
            role="menuitem"
            className="nav-profile-logout"
            onClick={() => signOut({ callbackUrl: "/login" })}
          >
            Déconnexion
          </button>
        </div>
      )}
    </div>
  );
}
