"use client";

import { useEffect, useState } from "react";

const COLORS = ["#2a9bb0", "#ff7a6e", "#e8c97a", "#3cb88a", "#7ec8d8", "#ffb4ad"];

type Piece = { id: number; dx: string; dy: string; color: string; left: string };

/** Burst confetti + toast XP — monté brièvement après une acquisition */
export default function Celebration({ xp, onDone }: { xp: number; onDone: () => void }) {
  const [show, setShow] = useState(false);
  const [pieces] = useState<Piece[]>(() =>
    Array.from({ length: 18 }, (_, i) => {
      const angle = (Math.PI * 2 * i) / 18;
      const dist = 80 + Math.random() * 100;
      return {
        id: i,
        dx: `${Math.cos(angle) * dist}px`,
        dy: `${Math.sin(angle) * dist - 40}px`,
        color: COLORS[i % COLORS.length],
        left: `${45 + Math.random() * 10}%`,
      };
    })
  );

  useEffect(() => {
    // Apparition du toast au frame suivant
    const t1 = requestAnimationFrame(() => setShow(true));
    const t2 = setTimeout(() => {
      setShow(false);
      onDone();
    }, 1400);
    return () => {
      cancelAnimationFrame(t1);
      clearTimeout(t2);
    };
  }, [onDone]);

  return (
    <>
      <div className="confetti-burst" aria-hidden>
        {pieces.map((p) => (
          <span
            key={p.id}
            className="confetti-piece"
            style={{
              background: p.color,
              left: p.left,
              // CSS custom props for animation
              ["--dx" as string]: p.dx,
              ["--dy" as string]: p.dy,
            }}
          />
        ))}
      </div>
      <div className={`xp-toast ${show ? "show" : ""}`} role="status">
        +{xp} XP 🎉
      </div>
    </>
  );
}
