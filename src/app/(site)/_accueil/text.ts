import { formatNumber } from "@/lib/format";

/** « 1 annonce », « 9 annonces », « 1 250 annonces » (nombre formaté en français). */
export function countLabel(count: number, singular: string, plural = `${singular}s`): string {
  return `${formatNumber(count)} ${count > 1 ? plural : singular}`;
}
