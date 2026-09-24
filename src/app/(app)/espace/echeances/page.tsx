import type { Metadata } from "next";

import { SchedulesScreen } from "./SchedulesScreen";

export const metadata: Metadata = {
  title: "Échéances",
  description:
    "Loyers et charges à encaisser, échéances en retard et encaissements du mois.",
};

export default function Page() {
  return <SchedulesScreen />;
}
