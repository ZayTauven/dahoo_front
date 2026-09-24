import type { Metadata } from "next";

import { ModulePending } from "@/components/app/ModulePending";

export const metadata: Metadata = { title: "Biens" };

export default function Page() {
  return <ModulePending title="Biens" description="Vos biens, bâtiments et lots, avec leur statut d'occupation." />;
}
