"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function LoginForm() {
  const searchParams = useSearchParams();
  const inviteCode = searchParams.get("invite") || "";
  const tripCode = searchParams.get("trip") || "";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      setError("Email ou mot de passe incorrect");
      return;
    }
    if (tripCode) {
      router.push(`/trips/join/${tripCode}`);
    } else if (inviteCode) {
      router.push(`/invite/${inviteCode}`);
    } else {
      router.push("/dashboard");
    }
    router.refresh();
  }

  const registerQs = [
    inviteCode ? `invite=${inviteCode}` : "",
    tripCode ? `trip=${tripCode}` : "",
  ]
    .filter(Boolean)
    .join("&");

  return (
    <form onSubmit={handleSubmit} className="auth-form">
      <h1>Connexion</h1>
      {inviteCode && (
        <p className="invite-banner">
          Après connexion, tu seras ami avec la personne qui t&apos;a invité.
        </p>
      )}
      {tripCode && (
        <p className="invite-banner">Après connexion, tu rejoindras le séjour.</p>
      )}
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
        />
      </label>
      {error && <p className="form-error">{error}</p>}
      <button type="submit" className="btn btn-primary" disabled={loading}>
        {loading ? "Connexion..." : "Se connecter"}
      </button>
      <p className="auth-switch">
        Pas encore de compte ?{" "}
        <Link href={registerQs ? `/register?${registerQs}` : "/register"}>
          Créer un compte
        </Link>
      </p>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="auth-page">
      <Suspense fallback={<div className="auth-form"><h1>Connexion</h1></div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
