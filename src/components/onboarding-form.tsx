"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useToast } from "@/components/ui/toast";
import { sortCategories } from "@/lib/gamification";

type OnboardingFigure = {
  id: string;
  name: string;
  category: string;
  xp: number;
};

/**
 * Onboarding nouveau rider : coche les figures déjà maîtrisées pour
 * démarrer avec le bon niveau (validation en masse via /api/progress/bulk).
 */
export function OnboardingForm({
  figures,
  riderName,
}: {
  figures: OnboardingFigure[];
  riderName: string | null;
}) {
  const router = useRouter();
  const toast = useToast();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);

  const categories = useMemo(
    () => sortCategories(Array.from(new Set(figures.map((f) => f.category)))),
    [figures]
  );
  const xpPreview = useMemo(
    () => figures.filter((f) => selected.has(f.id)).reduce((sum, f) => sum + f.xp, 0),
    [figures, selected]
  );

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  async function submit() {
    if (selected.size === 0) {
      router.push("/dashboard");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/progress/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ figureIds: Array.from(selected) }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error);
      toast(`${data.count} figures validées — bienvenue rider ! 🤙`, "success");
      router.push("/dashboard");
      router.refresh();
    } catch {
      toast("Impossible d'enregistrer — réessaie", "error");
      setBusy(false);
    }
  }

  return (
    <div className="figures-page onboarding-page">
      <h1>Bienvenue{riderName ? `, ${riderName}` : ""} 🪁</h1>
      <p className="figures-lead">
        Coche les figures que tu maîtrises déjà : ton niveau, ton XP et tes
        quêtes seront calculés à partir de là. Tu peux aussi passer et tout
        cocher plus tard.
      </p>

      <div className="onboarding-summary" role="status">
        <strong>{selected.size}</strong> figure{selected.size > 1 ? "s" : ""} ·{" "}
        <strong>+{xpPreview} XP</strong> de départ
      </div>

      {categories.map((cat) => {
        const list = figures.filter((f) => f.category === cat);
        const checkedCount = list.filter((f) => selected.has(f.id)).length;
        return (
          <details key={cat} className="onboarding-category" open={cat === categories[0]}>
            <summary>
              {cat}
              <span className="onboarding-cat-count">
                {checkedCount > 0 ? `${checkedCount}/${list.length}` : `${list.length} figures`}
              </span>
            </summary>
            <div className="session-gear-picker onboarding-picker">
              {list.map((f) => (
                <label
                  key={f.id}
                  className={`session-gear-option ${selected.has(f.id) ? "selected" : ""}`}
                >
                  <input
                    type="checkbox"
                    checked={selected.has(f.id)}
                    onChange={() => toggle(f.id)}
                  />
                  <strong>{f.name}</strong>
                </label>
              ))}
            </div>
          </details>
        );
      })}

      <div className="onboarding-actions">
        <button type="button" className="btn btn-primary" onClick={submit} disabled={busy}>
          {busy
            ? "Enregistrement…"
            : selected.size > 0
            ? `Valider mon niveau (${selected.size})`
            : "Commencer de zéro"}
        </button>
        <Link href="/dashboard" className="btn btn-ghost">
          Passer cette étape
        </Link>
      </div>
    </div>
  );
}
