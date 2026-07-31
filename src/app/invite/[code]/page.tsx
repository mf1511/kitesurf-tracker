import { redirect } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ensureAcceptedFriendship, riderLabel } from "@/lib/community";

export default async function InvitePage({
  params,
}: {
  params: { code: string };
}) {
  const code = params.code.trim().toLowerCase();
  const invite = await prisma.invite.findUnique({
    where: { code },
    include: { creator: { select: { id: true, name: true, email: true } } },
  });

  if (!invite) {
    return (
      <div className="hero">
        <h1>Invitation introuvable</h1>
        <p>Ce lien n&apos;est plus valide. Demande un nouveau lien à ton ami.</p>
        <div className="hero-actions">
          <Link href="/register" className="btn btn-primary">Créer un compte</Link>
        </div>
      </div>
    );
  }

  if (invite.expiresAt && invite.expiresAt < new Date()) {
    return (
      <div className="hero">
        <h1>Invitation expirée</h1>
        <p>Demande un nouveau lien à {riderLabel(invite.creator)}.</p>
        <div className="hero-actions">
          <Link href="/register" className="btn btn-primary">Créer un compte</Link>
        </div>
      </div>
    );
  }

  if (invite.usedCount >= invite.maxUses) {
    return (
      <div className="hero">
        <h1>Invitation complète</h1>
        <p>Ce lien a atteint sa limite d&apos;utilisations.</p>
        <div className="hero-actions">
          <Link href="/register" className="btn btn-primary">Créer un compte</Link>
        </div>
      </div>
    );
  }

  const session = await getServerSession(authOptions);

  // Déjà connecté → devenir ami tout de suite
  if (session?.user?.id) {
    if (session.user.id !== invite.creatorId) {
      await ensureAcceptedFriendship(invite.creatorId, session.user.id);
    }
    redirect("/community");
  }

  const host = riderLabel(invite.creator);

  return (
    <div className="hero">
      <span className="hero-kicker">Invitation de {host}</span>
      <h1>
        Rejoins <span>l&apos;aventure</span>
      </h1>
      <p>
        {host} t&apos;invite sur Kitesurf Tracker. Crée ton compte pour comparer vos
        progressions, le classement XP et célébrer les figures validées ensemble.
      </p>
      <div className="hero-actions">
        <Link href={`/register?invite=${invite.code}`} className="btn btn-primary">
          Accepter &amp; créer mon compte
        </Link>
        <Link href={`/login?invite=${invite.code}`} className="btn btn-ghost">
          J&apos;ai déjà un compte
        </Link>
      </div>
    </div>
  );
}
