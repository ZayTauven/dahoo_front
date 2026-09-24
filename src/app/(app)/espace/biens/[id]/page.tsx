import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PropertyScreen } from "./PropertyScreen";

type Props = { params: Promise<{ id: string }> };

function parseId(raw: string): number | null {
  return /^\d+$/.test(raw) && Number(raw) > 0 ? Number(raw) : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return {
    title: parseId(id) ? `Bien n°${id}` : "Bien",
    description: "Fiche du bien : bâtiments, lots, statuts et taux d'occupation.",
  };
}

export default async function Page({ params }: Props) {
  const id = parseId((await params).id);
  if (!id) notFound();
  return <PropertyScreen id={id} />;
}
