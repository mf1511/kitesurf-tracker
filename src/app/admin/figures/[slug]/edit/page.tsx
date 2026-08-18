import { redirect, notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AdminFigureForm from "@/components/AdminFigureForm";
import AdminFigureVideos from "@/components/admin-figure-videos";
import { getCategoryOrder } from "@/lib/category-order";
import { sortCategories } from "@/lib/gamification";

export default async function EditFigurePage({
  params,
}: {
  params: { slug: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");
  if (session.user.role !== "admin") redirect("/dashboard");

  const figure = await prisma.figure.findUnique({
    where: { slug: params.slug },
    include: {
      prerequisites: { select: { slug: true } },
      videos: { orderBy: [{ order: "asc" }, { createdAt: "asc" }] },
    },
  });
  if (!figure) notFound();

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
      <h1>Modifier « {figure.name} »</h1>
      <AdminFigureForm
        mode="edit"
        categories={categories}
        allFigures={figures}
        initial={{
          slug: figure.slug,
          name: figure.name,
          category: figure.category,
          description: figure.description,
          steps: JSON.parse(figure.steps),
          order: figure.order,
          prerequisiteSlugs: figure.prerequisites.map((p) => p.slug),
        }}
      />
      <AdminFigureVideos
        slug={figure.slug}
        initialVideos={figure.videos.map((v) => ({
          id: v.id,
          url: v.url,
          storagePath: v.storagePath,
          title: v.title,
          mimeType: v.mimeType,
          sizeBytes: v.sizeBytes,
          order: v.order,
        }))}
      />
    </div>
  );
}
