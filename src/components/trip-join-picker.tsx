"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

export type JoinSeat = {
  id: string;
  displayName: string;
  image: string | null;
  claimed: boolean;
  isMine: boolean;
};

/** Grille « Qui es-tu ? » sur le lien d’invitation séjour */
export default function TripJoinPicker({
  inviteCode,
  seats,
  isLoggedIn,
}: {
  inviteCode: string;
  seats: JoinSeat[];
  isLoggedIn: boolean;
}) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function pick(seat: JoinSeat) {
    if (seat.claimed && !seat.isMine) return;
    setError("");

    if (!isLoggedIn) {
      const qs = new URLSearchParams({
        trip: inviteCode,
        seat: seat.id,
      });
      router.push(`/login?${qs.toString()}`);
      return;
    }

    setBusyId(seat.id);
    const res = await fetch("/api/trips/join", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: inviteCode, seatId: seat.id }),
    });
    const data = await res.json().catch(() => ({}));
    setBusyId(null);
    if (!res.ok) {
      setError(data.error || "Impossible de rejoindre");
      return;
    }
    router.push(`/trips/${data.tripId}`);
    router.refresh();
  }

  return (
    <div className="trip-join-picker">
      <h2>Qui es-tu ?</h2>
      <p className="community-lead">Choisis ta place dans le crew.</p>
      {error && <p className="form-error">{error}</p>}
      <ul className="trip-join-grid">
        {seats.map((s) => {
          const locked = s.claimed && !s.isMine;
          return (
            <li key={s.id}>
              <button
                type="button"
                className={`trip-join-card${locked ? " locked" : ""}${
                  s.isMine ? " mine" : ""
                }`}
                disabled={locked || busyId === s.id}
                onClick={() => void pick(s)}
              >
                {s.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={s.image} alt="" className="trip-seat-avatar lg" />
                ) : (
                  <span className="trip-seat-avatar lg placeholder" aria-hidden>
                    {s.displayName[0]?.toUpperCase() ?? "?"}
                  </span>
                )}
                <strong>{s.displayName}</strong>
                <span className="feed-meta">
                  {busyId === s.id
                    ? "…"
                    : s.isMine
                    ? "C’est toi — entrer"
                    : locked
                    ? "Déjà pris"
                    : "C’est moi"}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      {!isLoggedIn && (
        <p className="auth-switch" style={{ marginTop: 16 }}>
          Déjà un compte ?{" "}
          <Link href={`/login?trip=${inviteCode}`}>Se connecter</Link>
          {" · "}
          <Link href={`/register?trip=${inviteCode}`}>Créer un compte</Link>
        </p>
      )}
    </div>
  );
}
