import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function Home() {
  const session = await getServerSession(authOptions);
  if (session?.user) {
    redirect("/dashboard");
  }

  const figureCount = await prisma.figure.count();

  return (
    <div className="hero">
      <span className="hero-kicker">Ton aventure kitesurf commence ici</span>
      <h1>
        Kitesurf <span>Tracker</span>
      </h1>
      <p>
        Gagne de l’XP, débloque des badges, enchaîne les quêtes et conquiers
        {figureCount > 0 ? ` ${figureCount}` : " toutes les"} figures —
        des bases IKO jusqu’aux mobes et kiteloops.
      </p>
      <div className="hero-actions">
        <Link href="/register" className="btn btn-primary">
          Commencer l’aventure
        </Link>
        <Link href="/login" className="btn btn-ghost">
          Se connecter
        </Link>
      </div>
      <div className="hero-stats">
        <div className="hero-stat">
          <strong>{figureCount || "200+"}</strong>
          <span>figures</span>
        </div>
        <div className="hero-stat">
          <strong>XP</strong>
          <span>et niveaux</span>
        </div>
        <div className="hero-stat">
          <strong>12</strong>
          <span>badges</span>
        </div>
      </div>
    </div>
  );
}
