import type { Metadata } from "next";

import { ModulePending } from "@/components/app/ModulePending";

export const metadata: Metadata = { title: "Équipe" };

export default function Page() {
  return <ModulePending title="Équipe" description="Les membres de votre agence et leurs rôles." />;
}
