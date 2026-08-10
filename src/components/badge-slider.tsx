"use client";

import { useEffect, useRef, useState } from "react";

export type BadgeSlide = {
  id: string;
  name: string;
  description: string;
  icon: string;
  earned: boolean;
};

/** Rail horizontal avec chevrons — scroll-snap déjà en CSS */
export default function BadgeSlider({ badges }: { badges: BadgeSlide[] }) {
  const railRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  function syncEdges() {
    const el = railRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setCanPrev(el.scrollLeft > 4);
    setCanNext(el.scrollLeft < max - 4);
  }

  useEffect(() => {
    syncEdges();
    const el = railRef.current;
    if (!el) return;
    const onScroll = () => syncEdges();
    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", syncEdges);
    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", syncEdges);
    };
  }, [badges.length]);

  function scrollByDir(dir: -1 | 1) {
    const el = railRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.min(280, el.clientWidth * 0.7), behavior: "smooth" });
  }

  return (
    <div className="badge-slider">
      <div className="badge-slider-controls">
        <span className="badge-slider-hint">Glisse →</span>
        <div className="badge-slider-arrows">
          <button
            type="button"
            className="badge-slider-arrow"
            aria-label="Badges précédents"
            disabled={!canPrev}
            onClick={() => scrollByDir(-1)}
          >
            ←
          </button>
          <button
            type="button"
            className="badge-slider-arrow"
            aria-label="Badges suivants"
            disabled={!canNext}
            onClick={() => scrollByDir(1)}
          >
            →
          </button>
        </div>
      </div>
      <div
        ref={railRef}
        className="badge-rail"
        role="list"
        aria-label="Badges"
      >
        {badges.map((b) => (
          <div
            key={b.id}
            role="listitem"
            className={`badge-item ${b.earned ? "earned" : "locked"}`}
            title={b.description}
          >
            <div className="badge-icon" aria-hidden>
              {b.icon}
            </div>
            <strong>{b.name}</strong>
            <span>{b.earned ? "Débloqué" : b.description}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
