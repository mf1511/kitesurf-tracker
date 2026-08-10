"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function RegisterForm() {
  const searchParams = useSearchParams();
  const inviteCode = searchParams.get("invite") || "";
  const tripCode = searchParams.get("trip") || "";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        email,
        password,
        inviteCode: inviteCode || undefined,
      }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Erreur lors de la création du compte");
      setLoading(false);
      return;
    }

    const signInRes = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (signInRes?.error) {
      router.push("/login");
      return;
    }

    if (tripCode) {
      router.push(`/trips/join/${tripCode}`);
    } else if (inviteCode) {
      router.push("/community");
    } else {
      // Nouveau rider → onboarding pour pré-cocher son niveau
      router.push("/onboarding");
    }
    router.refresh();
  }

  const loginQs = [
    inviteCode ? `invite=${inviteCode}` : "",
    tripCode ? `trip=${tripCode}` : "",
  ]
    .filter(Boolean)
    .join("&");

  return (
    <form onSubmit={handleSubmit} className="auth-form">
      <h1>Créer un compte</h1>
      {inviteCode && (
        <p className="invite-banner">
          Tu rejoins via une invitation — vous serez amis dès l&apos;inscription.
        </p>
      )}
      {tripCode && (
        <p className="invite-banner">
          Tu vas rejoindre un séjour kite après inscription.
        </p>
      )}
      <label>
        Prénom
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
      </label>
      <label>
        Email
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
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
