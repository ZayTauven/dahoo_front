import type { Metadata } from "next";

import { ModulePending } from "@/components/app/ModulePending";

export const metadata: Metadata = { title: "Demandes de démo" };

export default function Page() {
  return <ModulePending title="Demandes de démo" description="Les demandes de démonstration envoyées par les agences depuis le site." />;
}
