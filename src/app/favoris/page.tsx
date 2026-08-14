import { redirect } from "next/navigation";

/** Ancienne page → filtre Favoris sur le catalogue */
export default function FavorisRedirectPage() {
  redirect("/figures?favorites=1");
}
