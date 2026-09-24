import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ListingScreen } from "../_components/ListingScreen";

type Props = { params: Promise<{ id: string }> };

function parseId(raw: string): number | null {
  return /^\d+$/.test(raw) && Number(raw) > 0 ? Number(raw) : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return {
    title: parseId(id) ? `Annonce n°${id}` : "Annonce",
    description: "Fiche de l'annonce : informations, publication sur le portail, photos et demandes de visite.",
  };
}

export default async function Page({ params }: Props) {
  const id = parseId((await params).id);
  if (!id) notFound();
  return <ListingScreen id={id} />;
}
