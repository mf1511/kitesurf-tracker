"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import UserAvatar from "@/components/user-avatar";

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

type Props = {
  /** Dropdown desktop (le mobile passe par la bottom nav) */
  variant: "desktop";
};

export default function NavProfileMenu(_props: Props) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const user = session?.user;
  const label = user?.name?.trim() || user?.email || "Profil";
  const isAdmin = user?.role === "admin";

  // Ferme le dropdown au clic extérieur / Escape ; flèches = navigation clavier
  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        return;
      }
      if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(e.key)) return;
      const items = rootRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]');
      if (!items?.length) return;
      e.preventDefault();
      const list = Array.from(items);
      const idx = list.indexOf(document.activeElement as HTMLElement);
      let next = 0;
      if (e.key === "ArrowDown") next = idx < list.length - 1 ? idx + 1 : 0;
      else if (e.key === "ArrowUp") next = idx > 0 ? idx - 1 : list.length - 1;
      else if (e.key === "End") next = list.length - 1;
      list[next].focus();
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

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

  return (
    <div className={`nav-profile ${open ? "open" : ""}`} ref={rootRef}>
      <button
        type="button"
        className="nav-profile-trigger"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Menu profil"
        onClick={() => setOpen((v) => !v)}
      >
        <UserAvatar
          name={user?.name}
          email={user?.email}
          image={user?.image}
          className="nav-avatar"
        />
        <span className="nav-profile-trigger-label">Profil</span>
        <span className="nav-caret" aria-hidden />
      </button>

      {open && (
        <div className="nav-profile-dropdown" role="menu">
          <div className="nav-profile-card">
            <UserAvatar
              name={user?.name}
              email={user?.email}
              image={user?.image}
              className="nav-avatar"
            />
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
              onClick={() => setOpen(false)}
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
