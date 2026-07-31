export function getEmbedUrl(url: string): string | null {
  try {
    const u = new URL(url);

    // YouTube (watch?v=, youtu.be, shorts)
    if (u.hostname.includes("youtube.com") || u.hostname.includes("youtu.be")) {
      let videoId = "";
      if (u.hostname.includes("youtu.be")) {
        videoId = u.pathname.slice(1);
      } else if (u.pathname.startsWith("/shorts/")) {
        videoId = u.pathname.split("/shorts/")[1];
      } else {
        videoId = u.searchParams.get("v") || "";
      }
      if (videoId) return `https://www.youtube.com/embed/${videoId}`;
    }

    // Vimeo
    if (u.hostname.includes("vimeo.com")) {
      const id = u.pathname.split("/").filter(Boolean).pop();
      if (id) return `https://player.vimeo.com/video/${id}`;
    }

    return null; // pas de format d'embed reconnu -> on affichera un simple lien
  } catch {
    return null;
  }
}
