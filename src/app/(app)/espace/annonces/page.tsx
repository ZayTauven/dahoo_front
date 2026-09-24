import type { Metadata } from "next";

import { ListingsScreen } from "./_components/ListingsScreen";

export const metadata: Metadata = {
  title: "Annonces",
  description: "Annonces de l'agence sur le portail Dahoo : création, photos, publication et demandes de visite.",
};

export default function Page() {
  return <ListingsScreen />;
}
