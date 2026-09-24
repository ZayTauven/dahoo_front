import type { EnumEntry } from "@/lib/labels";

/** Pastille de statut : <StatusBadge entries={LEASE_STATUS} value={lease.status} />. */
export function StatusBadge({ entries, value }: { entries: Record<string, EnumEntry>; value: string | null | undefined }) {
  if (!value) return <span className="text-text-subtle">—</span>;
  const entry = entries[value] ?? { label: value, tone: "neutral" as const };
  return (
    <span className={`ax-badge ax-badge--soft ax-badge--${entry.tone}`}>
      <span className="ax-badge__dot" aria-hidden="true" />
      {entry.label}
    </span>
  );
}
