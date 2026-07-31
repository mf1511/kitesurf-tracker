"use client";

import { useEffect, useState } from "react";

/** Carte lien d'invitation + copie presse-papiers */
export default function CommunityInviteCard({
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
  const [code, setCode] = useState(initialCode);
  const [path, setPath] = useState(initialPath);
  const [url, setUrl] = useState(initialPath);
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setUrl(`${window.location.origin}${path}`);
  }, [path]);

  async function copy() {
    const link = `${window.location.origin}${path}`;
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  async function regenerate() {
    setBusy(true);
    const res = await fetch("/api/invites", { method: "POST" });
    setBusy(false);
    if (!res.ok) return;
    const data = await res.json();
    setCode(data.code);
    setPath(data.path);
  }

  return (
    <div className="community-card invite-card">
      <h2>Inviter des amis</h2>
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
        <button type="button" className="nav-btn" onClick={regenerate} disabled={busy}>
          Nouveau lien
        </button>
      </div>
    </div>
  );
}
