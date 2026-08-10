"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast";

/** Bouton « Inviter un ami » + dialog (lien + ajout par @pseudo / email) */
export default function CommunityInviteDialog({
  initialCode,
  initialPath,
  usedCount,
  maxUses,
}: {
  initialCode: string;
  initialPath: string;
  usedCount: number;
  maxUses: number;
}) {
  const router = useRouter();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const [code, setCode] = useState(initialCode);
  const [path, setPath] = useState(initialPath);
  const [url, setUrl] = useState(initialPath);
  const [copied, setCopied] = useState(false);
  const [regenBusy, setRegenBusy] = useState(false);

  const [query, setQuery] = useState("");
  const [emailFallback, setEmailFallback] = useState("");
  const [showEmailFallback, setShowEmailFallback] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setUrl(`${window.location.origin}${path}`);
  }, [path]);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        setOpen(false);
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}${path}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      toast("Copie impossible — sélectionne le lien manuellement.", "error");
    }
  }

  async function regenerate() {
    setRegenBusy(true);
    try {
      const res = await fetch("/api/invites", { method: "POST" });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setCode(data.code);
      setPath(data.path);
      toast("Nouveau lien d'invitation généré.", "success");
    } catch {
      toast("Impossible de générer un nouveau lien.", "error");
    } finally {
      setRegenBusy(false);
    }
  }

  async function sendFriendRequest(payload: { query?: string; email?: string }) {
    setBusy(true);
    setError("");
    setOk("");
    const res = await fetch("/api/friends", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);

    if (!res.ok) {
      if (data.code === "USERNAME_NOT_FOUND") {
        setShowEmailFallback(true);
        setError(data.error || "Pseudo introuvable");
        return;
      }
      setError(data.error || "Erreur");
      return;
    }

    setOk(
      data.autoAccepted ? "Vous êtes maintenant amis !" : "Demande envoyée"
    );
    setQuery("");
    setEmailFallback("");
    setShowEmailFallback(false);
    router.refresh();
  }

  async function onSubmitQuery(e: React.FormEvent) {
    e.preventDefault();
    setShowEmailFallback(false);
    await sendFriendRequest({ query });
  }

  async function onSubmitEmail(e: React.FormEvent) {
    e.preventDefault();
    await sendFriendRequest({ email: emailFallback });
  }

  return (
    <>
      <button type="button" className="btn btn-primary" onClick={() => setOpen(true)}>
        Inviter un ami
      </button>

      {open && (
        <div className="confirm-overlay" onClick={() => setOpen(false)}>
          <div
            ref={dialogRef}
            className="confirm-dialog invite-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="invite-dialog-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="invite-dialog-head">
              <h2 id="invite-dialog-title">Inviter un ami</h2>
              <button
                ref={closeRef}
                type="button"
                className="btn btn-ghost"
                onClick={() => setOpen(false)}
                aria-label="Fermer"
              >
                Fermer
              </button>
            </div>

            <section className="invite-dialog-block">
              <h3>Ajouter par pseudo</h3>
              <p className="community-lead">
                Cherche son @pseudo. S&apos;il n&apos;a pas encore de compte, tu
                pourras l&apos;inviter par email.
              </p>
              <form onSubmit={onSubmitQuery} className="friend-email-form">
                <input
                  type="text"
                  placeholder="@marin_kite ou email"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  required
                  autoComplete="off"
                />
                <button type="submit" className="btn btn-primary" disabled={busy}>
                  {busy ? "…" : "Ajouter"}
                </button>
              </form>

              {showEmailFallback && (
                <form onSubmit={onSubmitEmail} className="friend-email-form" style={{ marginTop: 10 }}>
                  <input
                    type="email"
                    placeholder="ami@email.com"
                    value={emailFallback}
                    onChange={(e) => setEmailFallback(e.target.value)}
                    required
                  />
                  <button type="submit" className="btn btn-secondary" disabled={busy}>
                    {busy ? "…" : "Inviter par email"}
                  </button>
                </form>
              )}

              {error && <p className="form-error">{error}</p>}
              {ok && <p className="form-ok">{ok}</p>}
            </section>

            <section className="invite-dialog-block">
              <h3>Lien d&apos;invitation</h3>
              <p className="community-lead">
                Pour quelqu&apos;un qui n&apos;a pas encore de compte KiteQuest.
              </p>
              <div className="invite-link-row">
                <code className="invite-code">{url}</code>
                <button type="button" className="btn btn-secondary" onClick={() => void copy()}>
                  {copied ? "Copié" : "Copier"}
                </button>
              </div>
              <div className="invite-meta">
                <span>
                  {usedCount}/{maxUses} utilisations · code {code}
                </span>
                <button
                  type="button"
                  className="btn btn-ghost"
                  disabled={regenBusy}
                  onClick={() => void regenerate()}
                >
                  Nouveau lien
                </button>
              </div>
            </section>
          </div>
        </div>
      )}
    </>
  );
}
