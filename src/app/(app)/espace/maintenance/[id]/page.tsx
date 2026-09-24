import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { TicketScreen } from "../_components/TicketScreen";

type Props = { params: Promise<{ id: string }> };

function parseId(value: string): number | null {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const id = parseId((await params).id);
  return {
    title: id ? `Ticket n°${id} · Maintenance` : "Maintenance",
    description: "Fiche d'un ticket de maintenance : statut, affectation et journal d'intervention.",
  };
}

export default async function Page({ params }: Props) {
  const id = parseId((await params).id);
  if (!id) notFound();
  return <TicketScreen id={id} />;
}
