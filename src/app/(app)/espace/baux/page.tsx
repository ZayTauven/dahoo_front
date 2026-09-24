import type { Metadata } from "next";

import { LeasesScreen } from "./LeasesScreen";

export const metadata: Metadata = {
  title: "Baux",
  description: "Contrats de location de l'agence : création, activation, résiliation et suivi des échéances.",
};

export default function Page() {
  return <LeasesScreen />;
}
