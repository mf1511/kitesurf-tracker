import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AdminFigureForm from "@/components/AdminFigureForm";
import { getCategoryOrder } from "@/lib/category-order";
import { sortCategories } from "@/lib/gamification";

export default async function NewFigurePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");
  if (session.user.role !== "admin") redirect("/dashboard");

  const [figures, categoryOrder] = await Promise.all([
    prisma.figure.findMany({
      select: { id: true, slug: true, name: true, category: true },
      orderBy: { name: "asc" },
    }),
    getCategoryOrder(),
  ]);
  const categories = sortCategories(
    Array.from(new Set(figures.map((f) => f.category))),
    categoryOrder
  );

  return (
    <div className="admin-page">
      <h1>Nouvelle figure</h1>
      <AdminFigureForm mode="create" categories={categories} allFigures={figures} />
    </div>
  );
}
