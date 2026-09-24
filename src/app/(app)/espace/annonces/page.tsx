import type { Metadata } from "next";

import { ModulePending } from "@/components/app/ModulePending";

export const metadata: Metadata = { title: "Annonces" };

export default function Page() {
  return <ModulePending title="Annonces" description="La publication de vos biens sur le portail Dahoo et les demandes des prospects." />;
}
