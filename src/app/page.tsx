import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import BrandMark from "@/components/brand-mark";

export default async function Home() {
  const session = await getServerSession(authOptions);
  if (session?.user) {
    redirect("/dashboard");
  }

  const figureCount = await prisma.figure.count({ where: { active: true } });
  const countLabel = figureCount > 0 ? String(figureCount) : "200+";

  return (
    <div className="landing">
      {/* Hero : une composition — marque + promesse + CTA + plan visuel */}
      <section className="landing-hero" aria-label="Accueil KiteQuest">
        <div className="landing-hero-scene" aria-hidden>
          <svg
            className="landing-hero-art"
            viewBox="0 0 1200 720"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="xMidYMid slice"
          >
            <defs>
              <linearGradient id="lqSky" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#c8eaf6" />
                <stop offset="55%" stopColor="#d4eef8" />
                <stop offset="100%" stopColor="#7ec8d8" />
              </linearGradient>
              <linearGradient id="lqWater" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#5eb8c9" />
                <stop offset="100%" stopColor="#2a9bb0" />
              </linearGradient>
              <linearGradient id="lqSand" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f2e6c9" />
                <stop offset="100%" stopColor="#e8c97a" />
              </linearGradient>
            </defs>
            <rect width="1200" height="720" fill="url(#lqSky)" />
            {/* Soleil soft */}
            <circle cx="980" cy="120" r="54" fill="#fff6d6" opacity="0.85" />
            <circle cx="980" cy="120" r="78" fill="#fff6d6" opacity="0.25" />
            {/* Nuages */}
            <g className="landing-cloud" fill="#ffffff" opacity="0.55">
              <ellipse cx="180" cy="110" rx="70" ry="28" />
              <ellipse cx="230" cy="105" rx="48" ry="22" />
              <ellipse cx="140" cy="118" rx="40" ry="18" />
            </g>
            {/* Lagune */}
            <path
              d="M0 420 C220 380 420 460 600 430 C820 390 980 450 1200 410 L1200 720 L0 720 Z"
              fill="url(#lqWater)"
            />
            <path
              className="landing-wave"
              d="M0 480 Q150 455 300 480 T600 480 T900 480 T1200 480"
              fill="none"
              stroke="#e8f4fc"
              strokeWidth="3"
              opacity="0.35"
            />
            {/* Plage */}
            <path
              d="M0 620 C280 560 520 640 760 590 C960 550 1100 610 1200 580 L1200 720 L0 720 Z"
              fill="url(#lqSand)"
            />
            {/* Aile kite en vol */}
            <g className="landing-kite">
              <path
                d="M720 160 C780 120 860 130 900 180 C850 200 780 210 720 160 Z"
                fill="#2a9bb0"
              />
              <path
                d="M720 160 C760 150 820 155 860 175"
                fill="none"
                stroke="#ff7a6e"
                strokeWidth="4"
                strokeLinecap="round"
              />
              <path
                d="M780 185 L640 420"
                stroke="#1a3a52"
                strokeWidth="1.5"
                opacity="0.45"
              />
              <path
                d="M820 190 L670 425"
                stroke="#1a3a52"
                strokeWidth="1.5"
                opacity="0.35"
              />
            </g>
          </svg>
          <div className="landing-hero-scrim" />
        </div>

        <div className="landing-hero-content">
          <div className="landing-brand">
            <BrandMark className="landing-brand-mark" size={72} />
            <p className="landing-wordmark">
              Kite<span>Quest</span>
            </p>
          </div>
          <h1 className="landing-headline">Ta progression kite, en mode quête</h1>
          <p className="landing-lead">
            XP, figures, crew et tutos hors-ligne — pour progresser au spot, même
            sans réseau.
          </p>
          <div className="landing-actions">
            <Link href="/login" className="btn btn-primary">
              Se connecter
            </Link>
            <Link href="/register" className="btn btn-ghost">
              J&apos;ai une invitation
            </Link>
          </div>
        </div>
      </section>

      {/* Une section = un job */}
      <section className="landing-section">
        <div className="landing-inner">
          <h2>Conquiers le lexique</h2>
          <p>
            {countLabel} figures actives, des bases IKO aux mobes et kiteloops —
            coche, gagne de l’XP, débloque la suite.
          </p>
          <Link href="/login" className="landing-link">
            Voir les figures →
          </Link>
        </div>
      </section>

      <section className="landing-section landing-section-alt">
        <div className="landing-inner">
          <h2>Embarque le crew</h2>
          <p>
            Crée un séjour, invite tes potes, partage une liste de figures et
            progressez ensemble — chacun à son rythme.
          </p>
          <Link href="/login" className="landing-link">
            Inviter le crew →
          </Link>
        </div>
      </section>

      <section className="landing-section">
        <div className="landing-inner">
          <h2>Tutos hors-ligne</h2>
          <p>
            Installe KiteQuest (PWA), télécharge les vidéos d’une figure ou d’un
            séjour, et révise les étapes même sans 4G sur le spot.
          </p>
          <Link href="/login" className="landing-link">
            Préparer le hors-ligne →
          </Link>
        </div>
      </section>

      <section className="landing-cta">
        <div className="landing-inner">
          <h2>Prêt à enchaîner ?</h2>
          <p>Sur invitation uniquement — connecte-toi ou utilise ton lien.</p>
          <Link href="/login" className="btn btn-primary">
            Se connecter
          </Link>
        </div>
      </section>
    </div>
  );
}
