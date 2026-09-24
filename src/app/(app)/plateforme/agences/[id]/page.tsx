import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { OrganizationScreen } from "./OrganizationScreen";

type Props = { params: Promise<{ id: string }> };

function parseId(raw: string): number | null {
  return /^\d+$/.test(raw) && Number(raw) > 0 ? Number(raw) : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return {
    title: parseId(id) ? `Agence n°${id}` : "Agence",
    description: "Fiche d'une agence cliente : informations, accès, essai, abonnements et membres.",
    robots: { index: false, follow: false },
  };
}

export default async function Page({ params }: Props) {
  const id = parseId((await params).id);
  if (!id) notFound();
  return <OrganizationScreen id={id} />;
}
