import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { xpForCategory } from "@/lib/gamification";
import { OnboardingForm } from "@/components/onboarding-form";

export const metadata = { title: "Bienvenue — KiteQuest" };

export default async function OnboardingPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");
  const userId = session.user.id;

  // Déjà des figures validées → l'onboarding n'a plus de raison d'être
  const alreadyDone = await prisma.userProgress.count({
    where: { userId, completed: true },
  });
  if (alreadyDone > 0) redirect("/dashboard");

  const figures = await prisma.figure.findMany({
    where: { active: true },
    select: { id: true, name: true, category: true },
    orderBy: [{ category: "asc" }, { order: "asc" }],
  });

  return (
    <OnboardingForm
      figures={figures.map((f) => ({
        id: f.id,
        name: f.name,
        category: f.category,
        xp: xpForCategory(f.category),
      }))}
      riderName={session.user.name?.split(" ")[0] ?? null}
    />
  );
}
