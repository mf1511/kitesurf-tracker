import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ProfileSettingsForm from "@/components/profile-settings-form";
import ThemeToggle from "@/components/theme-toggle";
import LogoutButton from "@/components/logout-button";

export default async function ParametresPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");
  const isAdmin = session.user.role === "admin";

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { email: true, name: true, weightKg: true },
  });
  if (!user) redirect("/login");

  return (
    <div className="trips-page parametres-page">
      <header className="community-header">
        <div>
          <h1>Profil</h1>
          <p className="subtitle">Compte, thème et raccourcis.</p>
        </div>
      </header>

      <section className="community-card">
        <h2>Profil</h2>
        <ProfileSettingsForm
          initialName={user.name ?? ""}
          initialWeightKg={user.weightKg}
          email={user.email}
        />
      </section>

      <section className="community-card">
        <h2>Thème</h2>
        <p className="community-lead">
          Auto suit le réglage de ton appareil (clair le jour, sombre la nuit).
        </p>
        <ThemeToggle />
      </section>

      <section className="community-card">
        <h2>Raccourcis</h2>
        <ul className="parametres-links">
          <li>
            <Link href="/materiel">Matériel</Link>
            <span>Ton quiver, factures, sorties</span>
          </li>
          <li>
            <Link href="/spots">Spots</Link>
            <span>Météo vent et taille d’aile conseillée</span>
          </li>
          <li>
            <Link href="/sessions">Sessions</Link>
            <span>Ton journal de nav</span>
          </li>
          <li>
            <Link href="/stats">Stats</Link>
            <span>Courbe XP, records, récap semaine</span>
          </li>
          <li>
            <Link href="/offline">Hors-ligne</Link>
            <span>Téléchargements & PWA</span>
          </li>
          <li>
            <Link href="/community">Communauté</Link>
            <span>Amis et invitations</span>
          </li>
          {isAdmin && (
            <li>
              <Link href="/admin">Admin</Link>
              <span>Gestion des figures et vidéos</span>
            </li>
          )}
        </ul>
      </section>

      <section className="community-card">
        <h2>Session</h2>
        <LogoutButton />
      </section>
    </div>
  );
}
