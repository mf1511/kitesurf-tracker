"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function RegisterForm() {
  const searchParams = useSearchParams();
  const inviteFromUrl = searchParams.get("invite") || "";
  const tripCode = searchParams.get("trip") || "";
  const seatId = searchParams.get("seat") || "";

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [inviteCode, setInviteCode] = useState(inviteFromUrl);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const viaTrip = !!tripCode;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const code = viaTrip ? tripCode.trim() : inviteCode.trim();
    if (!code) {
      setError("Une invitation est obligatoire pour créer un compte");
      setLoading(false);
      return;
    }

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        username,
        email,
        password,
        inviteCode: viaTrip ? undefined : code,
        tripCode: viaTrip ? code : undefined,
      }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Erreur lors de la création du compte");
      setLoading(false);
      return;
    }

    const signInRes = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    setLoading(false);
    if (signInRes?.error) {
      router.push("/login");
      return;
    }

    if (tripCode) {
      const qs = seatId ? `?seat=${encodeURIComponent(seatId)}` : "";
      router.push(`/trips/join/${tripCode}${qs}`);
    } else if (code) {
      router.push("/community");
    } else {
      router.push("/onboarding");
    }
    router.refresh();
  }

  const loginQs = [
    inviteCode ? `invite=${encodeURIComponent(inviteCode.trim())}` : "",
    tripCode ? `trip=${encodeURIComponent(tripCode)}` : "",
    seatId ? `seat=${encodeURIComponent(seatId)}` : "",
  ]
    .filter(Boolean)
    .join("&");

  return (
    <form onSubmit={handleSubmit} className="auth-form">
      <h1>Créer un compte</h1>
      {viaTrip ? (
        <p className="invite-banner">
          Tu rejoins un séjour — après inscription tu pourras confirmer qui tu
          es.
        </p>
      ) : (
        <p className="invite-banner">
          KiteQuest est sur invitation uniquement — utilise le lien reçu ou
          colle ton code ci-dessous.
        </p>
      )}
      {!viaTrip && (
        <label>
          Code d&apos;invitation
          <input
            type="text"
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value)}
            required
            autoComplete="off"
            placeholder="ex: a1b2c3d4"
          />
        </label>
      )}
      <label>
        Prénom
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
      </label>
      <label>
        Pseudo
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          autoComplete="username"
          placeholder="marin_kite"
          minLength={3}
          maxLength={20}
          pattern="[A-Za-z0-9_]+"
          title="3–20 caractères : lettres, chiffres, _"
        />
        <span className="field-hint">
          Tes amis te retrouveront avec @{username.trim() || "tonpseudo"}
        </span>
      </label>
      <label>
        Email
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </label>
      <label>
        Mot de passe
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
        />
      </label>
      {error && <p className="form-error">{error}</p>}
      <button type="submit" className="btn btn-primary" disabled={loading}>
        {loading ? "Création..." : "Créer mon compte"}
      </button>
      <p className="auth-switch">
        Déjà un compte ?{" "}
        <Link href={loginQs ? `/login?${loginQs}` : "/login"}>Se connecter</Link>
      </p>
    </form>
  );
}

export default function RegisterPage() {
  return (
    <div className="auth-page">
      <Suspense
        fallback={
          <div className="auth-form" aria-hidden>
            <h1>Créer un compte</h1>
            <span className="skeleton skeleton-line w-90" />
            <span className="skeleton skeleton-line w-90" />
            <span className="skeleton skeleton-line w-60" />
          </div>
        }
      >
        <RegisterForm />
      </Suspense>
    </div>
  );
}
