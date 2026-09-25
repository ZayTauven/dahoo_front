import type { Metadata } from "next";

import { PlatformDashboard } from "./_components/PlatformDashboard";

export const metadata: Metadata = { title: "Vue d'ensemble" };

export default function PlatformHomePage() {
  return <PlatformDashboard />;
}
