import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { LeaseScreen } from "./LeaseScreen";

type Props = { params: Promise<{ id: string }> };

function parseId(raw: string): number | null {
  return /^\d+$/.test(raw) && Number(raw) > 0 ? Number(raw) : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return {
    title: parseId(id) ? `Bail n°${id}` : "Bail",
    description: "Fiche du bail : parties, montants, dates, cycle de vie et échéancier.",
  };
}

export default async function Page({ params }: Props) {
  const id = parseId((await params).id);
  if (!id) notFound();
  return <LeaseScreen id={id} />;
}
