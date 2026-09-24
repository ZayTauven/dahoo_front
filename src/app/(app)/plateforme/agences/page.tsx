import type { Metadata } from "next";

import { ModulePending } from "@/components/app/ModulePending";

export const metadata: Metadata = { title: "Agences clientes" };

export default function Page() {
  return <ModulePending title="Agences clientes" description="La gestion des agences, de leurs essais et de leurs abonnements." />;
}
