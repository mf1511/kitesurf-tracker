"use client";

import { useState, useTransition, useCallback } from "react";
import { useRouter } from "next/navigation";
import Celebration from "./Celebration";
import { useToast } from "@/components/ui/toast";

export default function FigureCheckbox({
  figureId,
  initialCompleted,
  locked,
  size = "md",
  xpReward = 20,
}: {
  figureId: string;
  initialCompleted: boolean;
  locked?: boolean;
  size?: "sm" | "md";
  /** XP affiché dans le toast à l'acquisition */
  xpReward?: number;
}) {
  const [completed, setCompleted] = useState(initialCompleted);
  const [celebrate, setCelebrate] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const toast = useToast();

  const clearCelebration = useCallback(() => setCelebrate(false), []);

  async function toggle() {
    if (locked || saving) return;
    const next = !completed;
    // Optimiste, mais avec rollback si l'API échoue
    setCompleted(next);
    setSaving(true);

    try {
      const res = await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ figureId, completed: next }),
      });
      if (!res.ok) throw new Error();
      // Célébration seulement une fois l'acquisition confirmée
      if (next) setCelebrate(true);
      startTransition(() => router.refresh());
    } catch {
      setCompleted(!next);
      toast("Impossible d'enregistrer, vérifie ta connexion.", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <button
        className={`checkbox ${size} ${completed ? "checked" : ""} ${locked ? "locked" : ""}`}
        onClick={toggle}
        disabled={locked || saving || isPending}
        title={
          locked
            ? "Prérequis non validés"
            : completed
            ? "Marquer comme non acquis"
            : `Marquer comme acquis (+${xpReward} XP)`
        }
        aria-pressed={completed}
        aria-label={
          locked
            ? "Figure verrouillée, prérequis non validés"
            : completed
            ? "Marquer comme non acquis"
            : `Marquer comme acquis (+${xpReward} XP)`
        }
      >
        {completed && (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
        {locked && !completed && (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="5" y="11" width="14" height="9" rx="2" />
            <path d="M8 11V8a4 4 0 0 1 8 0v3" />
          </svg>
        )}
      </button>
      {celebrate && <Celebration xp={xpReward} onDone={clearCelebration} />}
    </>
  );
}
