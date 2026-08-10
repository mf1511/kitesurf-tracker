"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast";

/** Bouton « Inviter un ami » + dialog (lien + ajout par email) */
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

  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [emailOk, setEmailOk] = useState("");
  const [emailBusy, setEmailBusy] = useState(false);

  useEffect(() => {
    setUrl(`${window.location.origin}${path}`);
  }, [path]);

  // Escape + focus trap léger
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

  async function sendRequest(e: React.FormEvent) {
    e.preventDefault();
    setEmailError("");
    setEmailOk("");
    setEmailBusy(true);
    const res = await fetch("/api/friends", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json().catch(() => ({}));
    setEmailBusy(false);
    if (!res.ok) {
      setEmailError(data.error || "Erreur");
      return;
    }
    setEmailOk(data.autoAccepted ? "Vous êtes maintenant amis !" : "Demande envoyée");
    setEmail("");
    router.refresh();
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
              <h3>Lien d&apos;invitation</h3>
              <p className="community-lead">
                Partage ce lien : ton pote crée son compte et vous devenez amis automatiquement.
              </p>
              <div className="invite-link-row">
                <code className="invite-code">{url}</code>
                <button type="button" className="btn btn-primary" onClick={copy}>
                  {copied ? "Copié !" : "Copier"}
                </button>
              </div>
              <div className="invite-meta">
                <span>
                  Code <strong>{code}</strong> · {usedCount}/{maxUses} utilisations
                </span>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={regenerate}
                  disabled={regenBusy}
                >
                  Nouveau lien
                </button>
              </div>
            </section>

            <section className="invite-dialog-block">
              <h3>Ajouter par email</h3>
              <p className="community-lead">
                S&apos;il a déjà un compte, envoie une demande. Sinon, utilise ton lien
                d&apos;invitation.
              </p>
              <form onSubmit={sendRequest} className="friend-email-form">
                <input
                  type="email"
                  placeholder="ami@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <button type="submit" className="btn btn-primary" disabled={emailBusy}>
                  {emailBusy ? "…" : "Inviter"}
                </button>
              </form>
              {emailError && <p className="form-error">{emailError}</p>}
              {emailOk && <p className="form-ok">{emailOk}</p>}
            </section>
          </div>
        </div>
      )}
    </>
  );
}
