/** Avatar photo ou initiales */
export default function UserAvatar({
  name,
  email,
  image,
  className = "nav-avatar",
}: {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  className?: string;
}) {
  const initials = (() => {
    const n = name?.trim();
    if (n) {
      const parts = n.split(/\s+/);
      return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "?";
    }
    return (email?.[0] ?? "?").toUpperCase();
  })();

  if (image) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- URL Storage dynamique
      <img src={image} alt="" className={`${className} has-photo`} />
    );
  }
  return (
    <span className={className} aria-hidden>
      {initials}
    </span>
  );
}
