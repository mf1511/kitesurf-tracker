import Link from "next/link";
import { returnLabel, safeReturnPath } from "@/lib/nav-return";

/** Lien « précédent » mobile — respecte ?from= sinon fallback */
export default function BackLink({
  from,
  fallbackHref,
  fallbackLabel,
}: {
  from?: string | null;
  fallbackHref: string;
  fallbackLabel: string;
}) {
  const href = safeReturnPath(from) ?? fallbackHref;
  const label = safeReturnPath(from)
    ? returnLabel(href, fallbackLabel)
    : fallbackLabel;

  return (
    <Link href={href} className="back-link">
      {label}
    </Link>
  );
}
