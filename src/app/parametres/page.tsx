import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ProfileSettingsForm from "@/components/profile-settings-form";

export default async function ParametresPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { email: true, name: true },
  });
  if (!user) redirect("/login");

  return (
    <div className="trips-page parametres-page">
      <header className="community-header">
        <div>
          <h1>Paramètres</h1>
          <p className="subtitle">Compte, profil et raccourcis.</p>
        </div>
      </header>

      <section className="community-card">
        <h2>Profil</h2>
        <ProfileSettingsForm initialName={user.name ?? ""} email={user.email} />
      </section>

      <section className="community-card">
        <h2>Raccourcis</h2>
        <ul className="parametres-links">
          <li>
            <Link href="/materiel">Matériel</Link>
            <span>Ton quiver, factures, sorties</span>
          </li>
          <li>
            <Link href="/offline">Hors-ligne</Link>
            <span>Téléchargements & PWA</span>
          </li>
          <li>
            <Link href="/community">Communauté</Link>
            <span>Amis et invitations</span>
          </li>
        </ul>
      </section>
    </div>
  );
}
