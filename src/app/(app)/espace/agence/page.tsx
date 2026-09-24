import type { Metadata } from "next";

import { ModulePending } from "@/components/app/ModulePending";

export const metadata: Metadata = { title: "Mon agence" };

export default function Page() {
  return <ModulePending title="Mon agence" description="Les informations de votre agence et votre abonnement." />;
}
