import type { Metadata } from "next";

import { ModulePending } from "@/components/app/ModulePending";

export const metadata: Metadata = { title: "Paiements" };

export default function Page() {
  return <ModulePending title="Paiements" description="L'enregistrement des encaissements et leur affectation aux échéances." />;
}
