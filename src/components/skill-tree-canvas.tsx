"use client";

import Link from "next/link";
import {
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import type { SkillTreeLayout } from "@/lib/skill-tree-layout";
import { figureHref } from "@/lib/nav-return";

/** Viewport scrollable + drag-pan pour le skill-tree SVG */
export default function SkillTreeCanvas({
  layout,
  returnTo,
}: {
  layout: SkillTreeLayout;
  /** Chemin pour revenir ici après une fiche figure */
  returnTo: string;
}) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const drag = useRef<{
    pointerId: number;
    x: number;
    y: number;
    scrollLeft: number;
    scrollTop: number;
    moved: boolean;
  } | null>(null);

  const scrollKey = `skill-tree-scroll:${returnTo}`;

  // Restaure la position de pan après retour depuis une fiche
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    try {
      const raw = sessionStorage.getItem(scrollKey);
      if (!raw) return;
      const { left, top } = JSON.parse(raw) as { left: number; top: number };
      el.scrollLeft = left;
      el.scrollTop = top;
    } catch {
      /* ignore */
    }
  }, [scrollKey, layout.nodes.length]);

  function saveScroll() {
    const el = viewportRef.current;
    if (!el) return;
    try {
      sessionStorage.setItem(
        scrollKey,
        JSON.stringify({ left: el.scrollLeft, top: el.scrollTop })
      );
    } catch {
      /* ignore */
    }
  }

  function onPointerDown(e: ReactPointerEvent<HTMLDivElement>) {
    if ((e.target as HTMLElement).closest("a")) return;
    const el = viewportRef.current;
    if (!el) return;
    drag.current = {
      pointerId: e.pointerId,
      x: e.clientX,
      y: e.clientY,
      scrollLeft: el.scrollLeft,
      scrollTop: el.scrollTop,
      moved: false,
    };
    el.setPointerCapture(e.pointerId);
    setDragging(true);
  }

  function onPointerMove(e: ReactPointerEvent<HTMLDivElement>) {
    const el = viewportRef.current;
    const d = drag.current;
    if (!el || !d || d.pointerId !== e.pointerId) return;
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    if (Math.abs(dx) + Math.abs(dy) > 3) d.moved = true;
    el.scrollLeft = d.scrollLeft - dx;
    el.scrollTop = d.scrollTop - dy;
  }

  function onPointerUp(e: ReactPointerEvent<HTMLDivElement>) {
    const d = drag.current;
    if (d && d.pointerId === e.pointerId) {
      if (d.moved) saveScroll();
      drag.current = null;
      setDragging(false);
    }
  }

  const byId = new Map(layout.nodes.map((n) => [n.id, n]));

  function edgePath(fromId: string, toId: string): string {
    const a = byId.get(fromId);
    const b = byId.get(toId);
    if (!a || !b) return "";
    const x1 = a.x + a.w;
    const y1 = a.y + a.h / 2;
    const x2 = b.x;
    const y2 = b.y + b.h / 2;
    const mid = (x1 + x2) / 2;
    return `M ${x1} ${y1} C ${mid} ${y1}, ${mid} ${y2}, ${x2} ${y2}`;
  }

  if (layout.nodes.length === 0) {
    return <p className="quest-empty">Aucune figure dans cette catégorie.</p>;
  }

  return (
    <div
      ref={viewportRef}
      className={`skill-tree-viewport${dragging ? " is-dragging" : ""}`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      <div
        className="skill-tree-canvas"
        style={{ width: layout.width, height: layout.height }}
      >
        <svg
          className="skill-tree-edges"
          width={layout.width}
          height={layout.height}
          aria-hidden
        >
          {layout.edges.map((e, i) => {
            const to = byId.get(e.to);
            const state = to?.state ?? "locked";
            return (
              <path
                key={`${e.from}-${e.to}-${i}`}
                d={edgePath(e.from, e.to)}
                className={`skill-tree-edge ${state}`}
                fill="none"
              />
            );
          })}
        </svg>

        {layout.bands?.map((b) => (
          <div
            key={b.label}
            className="skill-tree-band"
            style={{ top: b.y, left: 28 }}
          >
            {b.label}
          </div>
        ))}

        {layout.nodes.map((n) => {
          const className = `skill-tree-node ${n.state}${
            n.active === false ? " inactive" : ""
          }`;
          const style = { left: n.x, top: n.y, width: n.w, height: n.h };
          const inner = (
            <>
              <span className="skill-tree-node-status" aria-hidden>
                {n.state === "done" ? "✓" : n.state === "locked" ? "·" : "○"}
              </span>
              <span className="skill-tree-node-name">{n.name}</span>
            </>
          );
          // Inactive : visible, pas de navigation + libellé explicite
          if (n.active === false) {
            return (
              <div
                key={n.id}
                className={className}
                style={{ ...style, height: "auto", minHeight: n.h }}
              >
                <span className="skill-tree-node-name">{n.name}</span>
                <span
                  className={`skill-tree-node-soon${
                    n.soonHighlight ? " avance-new" : ""
                  }`}
                >
                  Bientôt disponible
                </span>
              </div>
            );
          }
          return (
            <Link
              key={n.id}
              href={figureHref(n.slug, returnTo)}
              className={className}
              style={style}
              title={`${n.name} (+${n.xp} XP)`}
              onClick={saveScroll}
            >
              {inner}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
