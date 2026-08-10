"use client";

import { signOut } from "next-auth/react";

export default function LogoutButton() {
  return (
    <button
      type="button"
      className="btn btn-danger"
      onClick={() => signOut({ callbackUrl: "/login" })}
    >
      Déconnexion
    </button>
  );
}
