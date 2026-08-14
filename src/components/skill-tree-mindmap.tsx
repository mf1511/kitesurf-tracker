"use client";

import Link from "next/link";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import {
  layoutMindmap,
  mindmapSectionKey,
  type MindmapCategoryInput,
  type MindmapNode,
} from "@/lib/mindmap-layout";
import { figureHref } from "@/lib/nav-return";

const COLLAPSED_KEY = "arbre-mindmap-collapsed-v2";
const ZOOM_KEY = "arbre-mindmap-zoom-v2";
const ZOOM_MIN = 0.5;
const ZOOM_MAX = 2.4;

function readCollapsed(categoryNames: string[]): Set<string> {
  try {
    const raw = sessionStorage.getItem(COLLAPSED_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as unknown;
      if (Array.isArray(parsed)) {
        return new Set(
          parsed.filter((x): x is string => typeof x === "string")
        );
      }
    }
  } catch {
    /* ignore */
  }
  // Défaut : toutes repliées
  return new Set(categoryNames);
}

function writeCollapsed(set: Set<string>) {
  try {
    sessionStorage.setItem(COLLAPSED_KEY, JSON.stringify([...set]));
  } catch {
    /* ignore */
  }
}

function clampZoom(z: number) {
  return Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, Math.round(z * 100) / 100));
}

function readZoom(): number {
  try {
    const raw = sessionStorage.getItem(ZOOM_KEY);
    if (raw) return clampZoom(Number(raw));
  } catch {
    /* ignore */
  }
  return 1;
}

function writeZoom(z: number) {
  try {
    sessionStorage.setItem(ZOOM_KEY, String(z));
  } catch {
    /* ignore */
  }
}

/** Connecteur horizontal (coudé), parent → enfant */
function edgePath(from: MindmapNode, to: MindmapNode): string {
  const x1 = from.x + from.w;
  const y1 = from.y + from.h / 2;
  const x2 = to.x;
  const y2 = to.y + to.h / 2;
  const mx = (x1 + x2) / 2;
  return `M ${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`;
}

/** Mindmap gauche→droite — pan, zoom, réorganisation */
export default function SkillTreeMindmap({
  categories,
  returnTo,
}: {
  categories: MindmapCategoryInput[];
  returnTo: string;
}) {
  const foldKeys = useMemo(() => {
    const keys: string[] = [];
    for (const c of categories) {
      keys.push(c.name);
      for (const s of c.sections ?? []) {
        keys.push(mindmapSectionKey(c.name, s.name));
      }
    }
    return keys;
  }, [categories]);
  const [collapsed, setCollapsed] = useState<Set<string>>(() => new Set());
  const [hydrated, setHydrated] = useState(false);
  const [zoom, setZoom] = useState(1);
  const viewportRef = useRef<HTMLDivElement>(null);
  const zoomRef = useRef(1);
  const pendingScroll = useRef<{ left: number; top: number } | null>(null);
  const [dragging, setDragging] = useState(false);
  const drag = useRef<{
    pointerId: number;
    x: number;
    y: number;
    scrollLeft: number;
    scrollTop: number;
    moved: boolean;
  } | null>(null);

  const scrollKey = `mindmap-scroll-v2:${returnTo}`;

  useEffect(() => {
    const z = readZoom();
    zoomRef.current = z;
    setZoom(z);
    setCollapsed(readCollapsed(foldKeys));
    setHydrated(true);
  }, [foldKeys]);

  const layout = useMemo(
    () =>
      layoutMindmap(
        categories,
        hydrated ? collapsed : new Set(foldKeys),
        "Figures"
      ),
    [categories, collapsed, hydrated, foldKeys]
  );

  const didInitScroll = useRef(false);
  useEffect(() => {
    const el = viewportRef.current;
    if (!el || !hydrated || didInitScroll.current) return;
    didInitScroll.current = true;
    try {
      const raw = sessionStorage.getItem(scrollKey);
      if (raw) {
        const { left, top } = JSON.parse(raw) as {
          left: number;
          top: number;
        };
        el.scrollLeft = left;
        el.scrollTop = top;
        return;
      }
    } catch {
      /* ignore */
    }
    // Centre le hub au premier affichage
    el.scrollLeft = Math.max(
      0,
      (layout.width * zoomRef.current - el.clientWidth) / 2
    );
    el.scrollTop = Math.max(
      0,
      (layout.height * zoomRef.current - el.clientHeight) / 2
    );
  }, [scrollKey, hydrated, layout.width, layout.height]);

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

  /** Zoom autour d’un point (curseur ou centre du viewport) */
  function applyZoom(next: number, clientX?: number, clientY?: number) {
    const el = viewportRef.current;
    const z = clampZoom(next);
    if (z === zoomRef.current) return;
    if (el) {
      const rect = el.getBoundingClientRect();
      const ox = (clientX ?? rect.left + rect.width / 2) - rect.left;
      const oy = (clientY ?? rect.top + rect.height / 2) - rect.top;
      pendingScroll.current = {
        left: ((el.scrollLeft + ox) / zoomRef.current) * z - ox,
        top: ((el.scrollTop + oy) / zoomRef.current) * z - oy,
      };
    }
    zoomRef.current = z;
    setZoom(z);
    writeZoom(z);
  }

  useEffect(() => {
    const el = viewportRef.current;
    const p = pendingScroll.current;
    if (!el || !p) return;
    el.scrollLeft = p.left;
    el.scrollTop = p.top;
    pendingScroll.current = null;
    saveScroll();
  }, [zoom]);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el || !hydrated) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const factor = e.deltaY > 0 ? 0.9 : 1.1;
      applyZoom(zoomRef.current * factor, e.clientX, e.clientY);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [hydrated]);

  function persistCollapsed(next: Set<string>) {
    setCollapsed(next);
    writeCollapsed(next);
  }

  function toggleCat(name: string) {
    const next = new Set(collapsed);
    if (next.has(name)) next.delete(name);
    else next.add(name);
    persistCollapsed(next);
  }

  function expandAll() {
    persistCollapsed(new Set());
  }

  function collapseAll() {
    persistCollapsed(new Set(foldKeys));
  }

  /** Comme Make Rearrange : grille propre, zoom lisible, vue sur le hub */
  function rearrange() {
    zoomRef.current = 1;
    setZoom(1);
    writeZoom(1);
    pendingScroll.current = { left: 0, top: 0 };
    const el = viewportRef.current;
    if (el) {
      el.scrollLeft = 0;
      el.scrollTop = 0;
    }
    saveScroll();
  }

  function onPointerDown(e: ReactPointerEvent<HTMLDivElement>) {
    if ((e.target as HTMLElement).closest("a,button")) return;
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

  return (
    <div className="mindmap-wrap">
      <div className="mindmap-toolbar">
        <button type="button" className="btn btn-ghost" onClick={expandAll}>
          Tout ouvrir
        </button>
        <button type="button" className="btn btn-ghost" onClick={collapseAll}>
          Tout replier
        </button>
        <div className="mindmap-zoom" role="group" aria-label="Zoom">
          <button
            type="button"
            className="mindmap-zoom-btn"
            onClick={() => applyZoom(zoom / 1.2)}
            aria-label="Zoom arrière"
          >
            −
          </button>
          <span className="mindmap-zoom-pct">{Math.round(zoom * 100)}%</span>
          <button
            type="button"
            className="mindmap-zoom-btn"
            onClick={() => applyZoom(zoom * 1.2)}
            aria-label="Zoom avant"
          >
            +
          </button>
          <button
            type="button"
            className="btn btn-ghost mindmap-zoom-fit"
            onClick={rearrange}
          >
            Réorganiser
          </button>
        </div>
        <span className="tree-legend-hint">
          Clic catégorie / sous-module · glisse · molette
        </span>
      </div>

      <div
        ref={viewportRef}
        className={`skill-tree-viewport mindmap-viewport${
          dragging ? " is-dragging" : ""
        }`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <div
          className="mindmap-scaler"
          style={{
            width: layout.width * zoom,
            height: layout.height * zoom,
          }}
        >
          <div
            className="skill-tree-canvas mindmap-canvas"
            style={{
              width: layout.width,
              height: layout.height,
              transform: `scale(${zoom})`,
            }}
          >
            <svg
              className="skill-tree-edges"
              width={layout.width}
              height={layout.height}
              aria-hidden
            >
              {layout.edges.map((e, i) => {
                const a = byId.get(e.from);
                const b = byId.get(e.to);
                if (!a || !b) return null;
                return (
                  <path
                    key={`${e.from}-${e.to}-${i}`}
                    d={edgePath(a, b)}
                    className={`mindmap-edge color-${e.colorIndex % 8}`}
                    fill="none"
                  />
                );
              })}
            </svg>

            {layout.nodes.map((n) => {
              if (n.kind === "hub") {
                return (
                  <div
                    key={n.id}
                    className="mindmap-node hub"
                    style={{ left: n.x, top: n.y, width: n.w, height: n.h }}
                  >
                    {n.label}
                  </div>
                );
              }
              if (n.kind === "category" || n.kind === "section") {
                const foldKey =
                  n.kind === "section"
                    ? mindmapSectionKey(n.category, n.section)
                    : n.category;
                const fillPct =
                  n.figureCount > 0
                    ? Math.round((n.doneCount / n.figureCount) * 100)
                    : 0;
                const complete = n.figureCount > 0 && n.doneCount === n.figureCount;
                return (
                  <button
                    key={n.id}
                    type="button"
                    className={`mindmap-node ${n.kind} color-${n.colorIndex % 8}${
                      n.collapsed ? " is-collapsed" : ""
                    }${complete ? " is-complete" : ""}`}
                    style={{
                      left: n.x,
                      top: n.y,
                      width: n.w,
                      minHeight: n.h,
                    }}
                    onClick={() => toggleCat(foldKey)}
                    aria-expanded={!n.collapsed}
                    title={`${n.label} — ${n.doneCount}/${n.figureCount}`}
                  >
                    {/* Remplissage LTR (catégorie et sous-module) */}
                    <span
                      className="mindmap-fill"
                      style={{ width: `${fillPct}%` }}
                      aria-hidden
                    />
                    <span className="mindmap-cat-chevron" aria-hidden>
                      {complete ? "✓" : n.collapsed ? "▸" : "▾"}
                    </span>
                    <span className="mindmap-node-label">{n.label}</span>
                    <span className="mindmap-cat-count">
                      {n.doneCount}/{n.figureCount}
                    </span>
                  </button>
                );
              }
              const className = `mindmap-node figure ${n.state} color-${
                n.colorIndex % 8
              }${n.active === false ? " inactive" : ""}`;
              const style = {
                left: n.x,
                top: n.y,
                width: n.w,
                minHeight: n.h,
              };
              if (n.active === false) {
                return (
                  <div key={n.id} className={className} style={style}>
                    <span className="mindmap-node-label">{n.label}</span>
                    <span
                      className={`skill-tree-node-soon${
                        n.soonHighlight ? " avance-new" : ""
                      }`}
                    >
                      Bientôt
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
                  title={`${n.label} (+${n.xp} XP)`}
                  onClick={saveScroll}
                >
                  <span className="skill-tree-node-status" aria-hidden>
                    {n.state === "done" ? "✓" : n.state === "locked" ? "·" : "○"}
                  </span>
                  <span className="mindmap-node-label">{n.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
