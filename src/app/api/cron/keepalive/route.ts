import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Endpoint optionnel pour un cron Vercel / externe.
 * Protégé par CRON_SECRET (header Authorization: Bearer <secret>).
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "CRON_SECRET non configuré" }, { status: 503 });
  }

  const auth = req.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (token !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await prisma.$queryRawUnsafe("SELECT 1");
    return NextResponse.json({ ok: true, at: new Date().toISOString() });
  } catch (err) {
    console.error("[cron/keepalive]", err);
    return NextResponse.json({ error: "DB unreachable" }, { status: 500 });
  }
}
