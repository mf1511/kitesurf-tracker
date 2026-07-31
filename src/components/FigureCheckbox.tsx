"use client";

import { useState, useTransition, useCallback } from "react";
import { useRouter } from "next/navigation";
import Celebration from "./Celebration";

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
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const clearCelebration = useCallback(() => setCelebrate(false), []);

  async function toggle() {
    if (locked) return;
    const next = !completed;
    setCompleted(next);
    if (next) setCelebrate(true);

    await fetch("/api/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ figureId, completed: next }),
    });
    startTransition(() => router.refresh());
  }

  return (
    <>
      <button
        className={`checkbox ${size} ${completed ? "checked" : ""} ${locked ? "locked" : ""}`}
        onClick={toggle}
        disabled={locked || isPending}
        title={
          locked
            ? "Prérequis non validés"
            : completed
            ? "Marquer comme non acquis"
            : `Marquer comme acquis (+${xpReward} XP)`
        }
        aria-pressed={completed}
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
