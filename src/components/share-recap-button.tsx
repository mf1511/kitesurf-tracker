"use client";

import { useState } from "react";
import { useToast } from "@/components/ui/toast";

export type RecapCardData = {
  riderName: string;
  period: string;
  level: number;
  title: string;
  xp: number;
  figuresDone: number;
  weekFigures: number;
  weekXp: number;
  weekSessions: number;
  weekMinutes: number;
};

/** Dessine la carte récap sur un canvas (1080×1350, format story) */
function drawCard(canvas: HTMLCanvasElement, d: RecapCardData) {
  const W = 1080;
  const H = 1350;
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  // Fond dégradé océan
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, "#0d2233");
  bg.addColorStop(0.55, "#16324a");
  bg.addColorStop(1, "#2a9bb0");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Vagues décoratives
  ctx.strokeStyle = "rgba(126, 200, 216, 0.25)";
  ctx.lineWidth = 3;
  for (let row = 0; row < 4; row++) {
    ctx.beginPath();
    const baseY = 950 + row * 90;
    for (let px = 0; px <= W; px += 8) {
      const py = baseY + Math.sin((px / W) * Math.PI * 4 + row) * 18;
      px === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
    }
    ctx.stroke();
  }

  const center = W / 2;
  ctx.textAlign = "center";

  // Marque
  ctx.fillStyle = "#7ec8d8";
  ctx.font = "700 52px Fredoka, system-ui, sans-serif";
  ctx.fillText("🪁 KiteQuest", center, 130);

  // Période + rider
  ctx.fillStyle = "rgba(232, 244, 252, 0.75)";
  ctx.font = "600 40px Nunito, system-ui, sans-serif";
  ctx.fillText(d.period, center, 210);

  ctx.fillStyle = "#ffffff";
  ctx.font = "700 76px Fredoka, system-ui, sans-serif";
  ctx.fillText(d.riderName, center, 320);

  ctx.fillStyle = "#e8c97a";
  ctx.font = "700 44px Nunito, system-ui, sans-serif";
  ctx.fillText(`Niv. ${d.level} · ${d.title}`, center, 395);

  // Stats de la semaine (gros blocs)
  const stats: [string, string][] = [
    [`${d.weekFigures}`, d.weekFigures > 1 ? "figures validées" : "figure validée"],
    [`+${d.weekXp}`, "XP gagnés"],
    [`${d.weekSessions}`, d.weekSessions > 1 ? "sessions kite" : "session kite"],
    [
      d.weekMinutes >= 60
        ? `${Math.floor(d.weekMinutes / 60)}h${String(d.weekMinutes % 60).padStart(2, "0")}`
        : `${d.weekMinutes}min`,
      "sur l’eau",
    ],
  ];

  stats.forEach(([value, label], i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const cx = col === 0 ? W * 0.28 : W * 0.72;
    const cy = 560 + row * 210;

    ctx.fillStyle = "#ffffff";
    ctx.font = "700 96px Fredoka, system-ui, sans-serif";
    ctx.fillText(value, cx, cy);
    ctx.fillStyle = "rgba(232, 244, 252, 0.7)";
    ctx.font = "600 36px Nunito, system-ui, sans-serif";
    ctx.fillText(label, cx, cy + 56);
  });

  // Total carrière en pied
  ctx.fillStyle = "rgba(232, 244, 252, 0.85)";
  ctx.font = "600 38px Nunito, system-ui, sans-serif";
  ctx.fillText(`${d.figuresDone} figures au total · ${d.xp} XP`, center, 1150);

  ctx.fillStyle = "rgba(232, 244, 252, 0.5)";
  ctx.font = "600 30px Nunito, system-ui, sans-serif";
  ctx.fillText("kitequest.fr", center, 1290);
}

/** Génère la carte récap semaine et la partage (Web Share) ou la télécharge */
export function ShareRecapButton({ data }: { data: RecapCardData }) {
  const toast = useToast();
  const [busy, setBusy] = useState(false);

  async function share() {
    setBusy(true);
    try {
      const canvas = document.createElement("canvas");
      drawCard(canvas, data);
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/png")
      );
      if (!blob) throw new Error("toBlob");
      const file = new File([blob], "kitequest-recap.png", { type: "image/png" });

      // Partage natif si possible (mobile), sinon téléchargement
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: "Ma semaine KiteQuest",
        });
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "kitequest-recap.png";
        a.click();
        URL.revokeObjectURL(url);
        toast("Carte récap téléchargée 🖼️", "success");
      }
    } catch (err) {
      // AbortError = partage annulé par l'utilisateur, pas une erreur
      if ((err as Error)?.name !== "AbortError") {
        toast("Impossible de générer la carte", "error");
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <button type="button" className="btn btn-primary" onClick={share} disabled={busy}>
      {busy ? "Génération…" : "📤 Partager ma semaine"}
    </button>
  );
}
