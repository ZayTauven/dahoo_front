"use client";

import { IconChevronDown } from "@tabler/icons-react";

import { StatusBadge } from "@/components/app/ui/StatusBadge";
import { enumOptions, UNIT_STATUS } from "@/lib/labels";

import type { Unit, UnitStatus } from "./data";

/**
 * Statut d'un lot, modifiable sur place : la pastille reste visible et un <select> natif transparent
 * la recouvre. Le sélecteur natif fonctionne au clavier, au lecteur d'écran et sur mobile, et n'est
 * pas coupé par le défilement horizontal du tableau (contrairement à un menu positionné).
 */
export function UnitStatusControl({
  unit,
  editable,
  pending,
  onChange,
}: {
  unit: Unit;
  editable: boolean;
  pending: boolean;
  onChange: (status: UnitStatus) => void;
}) {
  if (!editable) return <StatusBadge entries={UNIT_STATUS} value={unit.status} />;

  return (
    <span
      className={`relative inline-flex items-center gap-1 rounded-full focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-(--ax-focus-ring)${pending ? " opacity-60" : ""}`}
      aria-busy={pending}
    >
      <StatusBadge entries={UNIT_STATUS} value={unit.status} />
      <IconChevronDown className="text-text-subtle size-3.5 shrink-0" stroke={2} aria-hidden="true" />
      <select
        className="absolute inset-0 size-full cursor-pointer appearance-none text-base opacity-0 disabled:cursor-wait"
        aria-label={`Statut du lot ${unit.reference}`}
        value={unit.status}
        disabled={pending}
        onChange={(event) => onChange(event.target.value as UnitStatus)}
      >
        {enumOptions(UNIT_STATUS).map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </span>
  );
}
