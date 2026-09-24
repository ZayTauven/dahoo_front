import type { Metadata } from "next";

import { ModulePending } from "@/components/app/ModulePending";

export const metadata: Metadata = { title: "Locataires" };

export default function Page() {
  return <ModulePending title="Locataires" description="L'annuaire des locataires de votre agence et leurs baux." />;
}
