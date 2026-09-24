import type { Metadata } from "next";

import { ModulePending } from "@/components/app/ModulePending";

export const metadata: Metadata = { title: "Échéances" };

export default function Page() {
  return <ModulePending title="Échéances" description="Les loyers et charges à encaisser, et leur état de paiement." />;
}
