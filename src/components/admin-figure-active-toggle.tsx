"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

/** Colonne Actif : coche = visible pour les users */
export default function AdminFigureActiveToggle({
  slug,
  initialActive,
}: {
  slug: string;
  initialActive: boolean;
}) {
  const router = useRouter();
  const [active, setActive] = useState(initialActive);
  const [busy, setBusy] = useState(false);

  async function onChange(next: boolean) {
    setBusy(true);
    const prev = active;
    setActive(next); // optimistic
    const res = await fetch(`/api/admin/figures/${slug}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: next }),
    });
    setBusy(false);
    if (!res.ok) {
      setActive(prev);
      return;
    }
    router.refresh();
  }

  return (
    <label className="admin-active-toggle" title={active ? "Visible" : "Masquée"}>
      <input
        type="checkbox"
        checked={active}
        disabled={busy}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className="sr-only">Actif</span>
    </label>
  );
}
