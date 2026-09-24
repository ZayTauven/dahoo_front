import type { Metadata } from "next";

import { AgencyScreen } from "./AgencyScreen";

export const metadata: Metadata = {
  title: "Mon agence",
  description: "Les informations de votre agence et votre abonnement Dahoo.",
};

export default function Page() {
  return <AgencyScreen />;
}
