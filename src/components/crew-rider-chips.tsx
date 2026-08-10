import type { CrewRiderChip } from "@/lib/trips";

/** Avatars initiales + prénoms des riders qui ont déjà la figure */
export default function CrewRiderChips({
  riders,
  emptyLabel,
}: {
  riders: CrewRiderChip[];
  emptyLabel?: string;
}) {
  if (riders.length === 0) {
    return emptyLabel ? (
      <span className="crew-chips-empty">{emptyLabel}</span>
    ) : null;
  }

  return (
    <ul className="crew-chips" aria-label="Déjà acquis par">
      {riders.map((r) => (
        <li key={r.userId} className={r.isMe ? "me" : undefined} title={r.firstName}>
          <span
            className="crew-avatar"
            style={{ background: `hsl(${r.hue} 42% 42%)` }}
            aria-hidden
          >
            {r.initials}
          </span>
          <span className="crew-firstname">{r.firstName}</span>
        </li>
      ))}
    </ul>
  );
}
