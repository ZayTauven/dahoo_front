import type { Metadata } from "next";

import { ModulePending } from "@/components/app/ModulePending";

export const metadata: Metadata = { title: "Baux" };

export default function Page() {
  return <ModulePending title="Baux" description="La création, l'activation et le suivi des contrats de location." />;
}
