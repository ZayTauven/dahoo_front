import type { Metadata } from "next";

import { ModulePending } from "@/components/app/ModulePending";

export const metadata: Metadata = { title: "Maintenance" };

export default function Page() {
  return <ModulePending title="Maintenance" description="Les tickets d'intervention, leur affectation et leur suivi." />;
}
