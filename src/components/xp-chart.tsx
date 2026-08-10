/** Courbe d'XP cumulé par mois — SVG pur, rendu serveur, zéro dépendance */
export type XpPoint = { label: string; xp: number };

export function XpChart({ points }: { points: XpPoint[] }) {
  if (points.length < 2) return null;

  const W = 600;
  const H = 200;
  const PAD = { top: 14, right: 14, bottom: 26, left: 40 };
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;
  const maxXp = Math.max(...points.map((p) => p.xp), 10);

  const x = (i: number) => PAD.left + (i / (points.length - 1)) * innerW;
  const y = (xp: number) => PAD.top + innerH - (xp / maxXp) * innerH;

  const line = points.map((p, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(p.xp).toFixed(1)}`).join(" ");
  const area = `${line} L${x(points.length - 1).toFixed(1)},${(PAD.top + innerH).toFixed(1)} L${PAD.left},${(PAD.top + innerH).toFixed(1)} Z`;

  // Graduations Y : 0, moitié, max
  const ticks = [0, Math.round(maxXp / 2), maxXp];

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="xp-chart"
      role="img"
      aria-label={`Courbe d'XP cumulé, actuellement ${points[points.length - 1].xp} XP`}
    >
      {ticks.map((t) => (
        <g key={t}>
          <line
            x1={PAD.left}
            y1={y(t)}
            x2={W - PAD.right}
            y2={y(t)}
            className="xp-chart-grid"
          />
          <text x={PAD.left - 8} y={y(t) + 4} textAnchor="end" className="xp-chart-tick">
            {t}
          </text>
        </g>
      ))}
      <path d={area} className="xp-chart-area" />
      <path d={line} className="xp-chart-line" />
      {points.map((p, i) => (
        <circle key={i} cx={x(i)} cy={y(p.xp)} r={3} className="xp-chart-dot" />
      ))}
      {points.map((p, i) =>
        // Un label sur deux pour éviter le chevauchement
        i % 2 === points.length % 2 ? (
          <text key={i} x={x(i)} y={H - 8} textAnchor="middle" className="xp-chart-label">
            {p.label}
          </text>
        ) : null
      )}
    </svg>
  );
}
