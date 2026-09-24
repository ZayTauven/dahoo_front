"use client";

import Link from "next/link";
import { useState } from "react";

import { SelectField, TextareaField } from "@/components/app/ui/fields";
import { FormModal } from "@/components/app/ui/Modal";
import { api } from "@/lib/api/client";
import { unwrap } from "@/lib/api/errors";
import { useApiMutation } from "@/lib/api/useApiMutation";
import { TICKET_PRIORITY } from "@/lib/labels";

import { KEYS, TICKET_PRIORITIES, asPriority, useCategories, useUnits, type Ticket, type TicketPriority } from "./data";

interface TicketForm {
  unit: string;
  category: string;
  priority: TicketPriority;
  description: string;
}

const PRIORITY_OPTIONS = TICKET_PRIORITIES.map((priority) => ({ value: priority, label: TICKET_PRIORITY[priority].label }));

/**
 * Création (lot, catégorie, priorité, description) ou modification d'un ticket.
 * En modification, le lot n'est pas modifiable : il identifie le signalement.
 */
export function TicketFormModal({ ticket, onClose, onCreated }: { ticket: Ticket | null; onClose: () => void; onCreated?: (ticket: Ticket) => void }) {
  const [form, setForm] = useState<TicketForm>({
    unit: ticket ? String(ticket.unit) : "",
    category: ticket?.category ? String(ticket.category) : "",
    priority: ticket?.priority ?? "MEDIUM",
    description: ticket?.description ?? "",
  });
  const [missingUnit, setMissingUnit] = useState(false);
  const categories = useCategories();
  const units = useUnits(!ticket);

  const save = useApiMutation({
    mutationFn: async (values: TicketForm) => {
      const body = {
        category: values.category ? Number(values.category) : null,
        priority: values.priority,
        description: values.description.trim(),
      };
      return ticket
        ? unwrap(await api.PATCH("/api/v1/maintenance/tickets/{id}/", { params: { path: { id: ticket.id } }, body }))
        : unwrap(await api.POST("/api/v1/maintenance/tickets/", { body: { ...body, unit: Number(values.unit) } }));
    },
    invalidate: ticket ? [KEYS.tickets, KEYS.ticket(ticket.id)] : [KEYS.tickets],
    success: ticket ? "Ticket mis à jour." : (created) => `Ticket n°${created.id} créé.`,
    onSuccess: (saved) => {
      onClose();
      if (!ticket) onCreated?.(saved);
    },
  });
  const errors = save.fieldErrors;

  const categoryList = categories.data ?? [];
  const noCategory = categories.isSuccess && categoryList.length === 0;
  const unitList = units.data ?? [];
  const noUnit = !ticket && units.isSuccess && unitList.length === 0;

  const submit = () => {
    if (!ticket && !form.unit) {
      setMissingUnit(true);
      return;
    }
    save.mutate(form);
  };

  return (
    <FormModal
      open
      onClose={onClose}
      title={ticket ? `Modifier le ticket n°${ticket.id}` : "Nouveau ticket"}
      submitLabel={ticket ? "Enregistrer" : "Créer le ticket"}
      onSubmit={submit}
      pending={save.isPending}
      error={save.formError}
    >
      {ticket ? (
        <div className="bg-surface-subtle rounded-lg border border-border-default px-4 py-3 text-sm">
          <span className="text-text-muted">Lot concerné</span>
          <p className="text-text-strong m-0 font-medium">{ticket.unit_label}</p>
        </div>
      ) : noUnit ? (
        <div className="ax-alert ax-alert--warning" role="status">
          <div className="ax-alert__content">
            <p className="ax-alert__message">
              Aucun lot n&apos;est encore enregistré. Ajoutez vos biens et leurs lots dans{" "}
              <Link href="/espace/biens" className="text-link">
                Biens
              </Link>{" "}
              avant de signaler une intervention.
            </p>
          </div>
        </div>
      ) : (
        <SelectField
          label="Lot concerné"
          required
          value={form.unit}
          onChange={(event) => {
            setMissingUnit(false);
            setForm((current) => ({ ...current, unit: event.target.value }));
          }}
          options={unitList.map((unit) => ({ value: unit.id, label: unit.label }))}
          placeholder={units.isLoading ? "Chargement des lots…" : "Choisir un lot"}
          disabled={units.isLoading}
          error={missingUnit ? "Choisissez le lot concerné." : (errors.unit ?? (units.error ? "Les lots n'ont pas pu être chargés." : undefined))}
        />
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField
          label="Catégorie"
          value={form.category}
          onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))}
          options={categoryList.map((category) => ({ value: category.id, label: category.label }))}
          placeholder={noCategory ? "Aucune catégorie" : "Sans catégorie"}
          disabled={categories.isLoading || noCategory}
          error={errors.category}
          hint={noCategory ? "Aucune catégorie n'est encore configurée : ce champ est facultatif." : "Facultatif."}
        />
        <SelectField
          label="Priorité"
          required
          value={form.priority}
          onChange={(event) => {
            const priority = asPriority(event.target.value);
            if (priority) setForm((current) => ({ ...current, priority }));
          }}
          options={PRIORITY_OPTIONS}
          error={errors.priority}
        />
      </div>

      <TextareaField
        label="Description"
        required
        rows={5}
        placeholder="Ex. : fuite sous l'évier de la cuisine, l'eau coule en continu depuis ce matin."
        value={form.description}
        onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
        error={errors.description}
        hint="Décrivez le problème, sa localisation dans le lot et depuis quand il est constaté."
      />
    </FormModal>
  );
}
