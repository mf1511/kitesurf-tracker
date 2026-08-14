import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AdminFiguresPanel from "@/components/admin-figures-panel";
import { getCategoryOrder } from "@/lib/category-order";
import { resolveFigureSection } from "@/lib/figure-sections";
import { sortCategories } from "@/lib/gamification";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");
  if (session.user.role !== "admin") redirect("/dashboard");

  const [figures, categoryOrder] = await Promise.all([
    prisma.figure.findMany({
      orderBy: [{ category: "asc" }, { order: "asc" }],
      include: { _count: { select: { prerequisites: true, videos: true } } },
    }),
    getCategoryOrder(),
  ]);

  const rows = figures.map((f) => ({
    id: f.id,
    slug: f.slug,
    name: f.name,
    category: f.category,
    order: f.order,
    active: f.active,
    adminDone: f.adminDone,
    prerequisites: f._count.prerequisites,
    videos: f._count.videos,
    section: resolveFigureSection(
      f.category,
      f.description,
      f.order,
      f.slug,
      f.name
    ),
  }));

  const present = Array.from(new Set(figures.map((f) => f.category)));
  const initialCategoryOrder = sortCategories(present, categoryOrder);

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

      <AdminFiguresPanel
        initialFigures={rows}
        initialCategoryOrder={initialCategoryOrder}
      />
    </div>
  );
}
