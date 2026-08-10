import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AdminPreInvites from "@/components/admin-pre-invites";

export const metadata = { title: "Invitations — Admin KiteQuest" };

export default async function AdminInvitesPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");
  if (session.user.role !== "admin") redirect("/dashboard");

  const rows = await prisma.preInvite.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      usedBy: { select: { id: true, name: true, email: true } },
    },
  });

  const invites = rows.map((i) => ({
    id: i.id,
    email: i.email,
    name: i.name,
    image: i.image,
    code: i.code,
    path: `/register?invite=${i.code}`,
    createdAt: i.createdAt.toISOString(),
    usedAt: i.usedAt?.toISOString() ?? null,
    usedBy: i.usedBy,
  }));

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <Link href="/admin" className="back-link">
            ← Figures
          </Link>
          <h1>Pré-invitations</h1>
        </div>
      </div>
      <p className="subtitle">
        Inscription fermée : seuls les invités (pré-invite ou lien ami) peuvent
        créer un compte.
      </p>
      <AdminPreInvites initialInvites={invites} />
    </div>
  );
}
