"use client";

import { useEffect, useState } from "react";

type Mode = "auto" | "light" | "dark";

const OPTIONS: { value: Mode; label: string }[] = [
  { value: "auto", label: "Auto" },
  { value: "light", label: "Clair" },
  { value: "dark", label: "Sombre" },
];

/** Applique le thème résolu sur <html> + met à jour la couleur PWA */
function apply(mode: Mode) {
  const dark =
    mode === "auto"
      ? window.matchMedia("(prefers-color-scheme: dark)").matches
      : mode === "dark";
  document.documentElement.dataset.theme = dark ? "dark" : "light";
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", dark ? "#0d2233" : "#d4eef8");
}

export default function ThemeToggle() {
  const [mode, setMode] = useState<Mode>("auto");

  // Hydrate l'état depuis la préférence stockée
  useEffect(() => {
    const stored = localStorage.getItem("kq-theme");
    if (stored === "light" || stored === "dark") setMode(stored);
  }, []);

  // En mode auto, suit les changements système en direct
  useEffect(() => {
    if (mode !== "auto") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => apply("auto");
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [mode]);

  function select(next: Mode) {
    setMode(next);
    if (next === "auto") localStorage.removeItem("kq-theme");
    else localStorage.setItem("kq-theme", next);
    apply(next);
  }

  return (
    <div className="theme-toggle" role="group" aria-label="Thème de l'application">
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          type="button"
          className={mode === opt.value ? "active" : undefined}
          aria-pressed={mode === opt.value}
          onClick={() => select(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
