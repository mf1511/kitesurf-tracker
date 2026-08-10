import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AdminFigureActiveToggle from "@/components/admin-figure-active-toggle";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");
  if (session.user.role !== "admin") redirect("/dashboard");

  const figures = await prisma.figure.findMany({
    orderBy: [{ category: "asc" }, { order: "asc" }],
    include: { _count: { select: { prerequisites: true, videos: true } } },
  });

  const categories = Array.from(new Set(figures.map((f) => f.category)));
  const activeCount = figures.filter((f) => f.active).length;

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1>Administration des figures</h1>
        <div className="trip-figure-actions">
          <Link href="/admin/invites" className="btn btn-secondary">
            Pré-invitations
          </Link>
          <Link href="/admin/figures/new" className="btn btn-primary">
            + Nouvelle figure
          </Link>
        </div>
      </div>
      <p className="subtitle">
        {figures.length} figures · {activeCount} actives · {categories.length} catégories
      </p>

      <div className="admin-table-wrap">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Actif</th>
            <th>Nom</th>
            <th>Catégorie</th>
            <th>Prérequis</th>
            <th>Vidéos</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {figures.map((f) => (
            <tr key={f.id} className={f.active ? undefined : "admin-row-inactive"}>
              <td>
                <AdminFigureActiveToggle slug={f.slug} initialActive={f.active} />
              </td>
              <td>{f.name}</td>
              <td><span className="badge sm">{f.category}</span></td>
              <td>{f._count.prerequisites}</td>
              <td>{f._count.videos}</td>
              <td className="admin-table-actions">
                <Link href={`/figures/${f.slug}`}>Voir</Link>
                <Link href={`/admin/figures/${f.slug}/edit`}>Modifier</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
}
