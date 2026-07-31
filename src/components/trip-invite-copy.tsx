"use client";

import { useEffect, useState } from "react";

export default function TripInviteCopy({ code }: { code: string }) {
  const path = `/trips/join/${code}`;
  const [url, setUrl] = useState(path);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setUrl(`${window.location.origin}${path}`);
  }, [path]);

  async function copy() {
    await navigator.clipboard.writeText(`${window.location.origin}${path}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  return (
    <div className="invite-link-row">
      <code className="invite-code">{url}</code>
      <button type="button" className="btn btn-primary" onClick={copy}>
        {copied ? "Copié !" : "Inviter le crew"}
      </button>
    </div>
  );
}
