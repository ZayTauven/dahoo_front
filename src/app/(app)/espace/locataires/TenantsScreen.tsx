"use client";

import { IconPencil, IconPlus, IconTrash, IconUsers } from "@tabler/icons-react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { EmptyState } from "@/components/app/EmptyState";
import { PageHead } from "@/components/app/shell/PageHead";
import { DataTable, type Column } from "@/components/app/ui/DataTable";
import { TextareaField, TextField } from "@/components/app/ui/fields";
import { ListToolbar } from "@/components/app/ui/ListToolbar";
import { ConfirmDialog, FormModal } from "@/components/app/ui/Modal";
import { useListParams } from "@/hooks/useListParams";
import { useNewParam } from "@/hooks/useNewParam";
import { api } from "@/lib/api/client";
import { unwrap } from "@/lib/api/errors";
import type { Schema } from "@/lib/api/types";
import { useApiMutation } from "@/lib/api/useApiMutation";
import { useSession } from "@/lib/auth/useSession";
import { formatDate } from "@/lib/format";

/*
 * Module de référence de la refonte (liste + recherche + création / modification / suppression).
 * Les autres modules de l'espace agence suivent la même structure.
 */

type Tenant = Schema<"Tenant">;
type TenantForm = Pick<Tenant, "phone" | "first_name" | "last_name" | "email" | "id_document_number" | "notes">;

const EMPTY_FORM: TenantForm = { phone: "", first_name: "", last_name: "", email: "", id_document_number: "", notes: "" };
const KEY = ["tenants"] as const;

export function TenantsScreen() {
  const { can, isReadOnly } = useSession();
  const list = useListParams([] as const);
  const [editing, setEditing] = useState<Tenant | "new" | null>(null);
  const shortcut = useNewParam();
  const [deleting, setDeleting] = useState<Tenant | null>(null);

  const tenants = useQuery({
    queryKey: [...KEY, list.query],
    queryFn: async () => unwrap(await api.GET("/api/v1/leases/tenants/", { params: { query: list.query } })),
    placeholderData: keepPreviousData,
  });

  const remove = useApiMutation({
    mutationFn: async (tenant: Tenant) =>
      unwrap(await api.DELETE("/api/v1/leases/tenants/{id}/", { params: { path: { id: tenant.id } } })),
    invalidate: [KEY],
    success: "Locataire supprimé.",
    onSuccess: () => setDeleting(null),
  });

  const canWrite = !isReadOnly;
  const columns: Column<Tenant>[] = [
    {
      key: "name",
      header: "Locataire",
      cell: (tenant) => (
        <div className="flex flex-col">
          <span className="text-text-strong font-medium">
            {tenant.first_name} {tenant.last_name}
          </span>
          {tenant.email && <span className="text-text-subtle text-xs">{tenant.email}</span>}
        </div>
      ),
    },
    { key: "phone", header: "Téléphone", cell: (tenant) => <span className="ax-num">{tenant.phone}</span> },
    { key: "leases", header: "Baux actifs", numeric: true, cell: (tenant) => tenant.active_leases },
    { key: "created", header: "Ajouté le", hideOnMobile: true, cell: (tenant) => formatDate(tenant.created_at, "short") },
    {
      key: "actions",
      header: "Actions",
      cell: (tenant) => (
        <div className="flex justify-end gap-1">
          {can("tenant.update") && canWrite && (
            <button type="button" className="ax-btn ax-btn--ghost ax-btn--icon ax-btn--sm" onClick={() => setEditing(tenant)} aria-label={`Modifier ${tenant.first_name} ${tenant.last_name}`}>
              <IconPencil className="ax-btn__icon" stroke={1.75} aria-hidden="true" />
            </button>
          )}
          {can("tenant.delete") && canWrite && (
            <button type="button" className="ax-btn ax-btn--ghost ax-btn--icon ax-btn--sm" onClick={() => setDeleting(tenant)} aria-label={`Supprimer ${tenant.first_name} ${tenant.last_name}`}>
              <IconTrash className="ax-btn__icon" stroke={1.75} aria-hidden="true" />
            </button>
          )}
        </div>
      ),
    },
  ];

  const addButton = can("tenant.create") && canWrite && (
    <button type="button" className="ax-btn ax-btn--primary" onClick={() => setEditing("new")}>
      <IconPlus className="ax-btn__icon" stroke={1.75} aria-hidden="true" />
      <span className="ax-btn__label">Ajouter un locataire</span>
    </button>
  );

  return (
    <>
      <PageHead
        title="Locataires"
        subtitle="L'annuaire des locataires de votre agence. Un locataire doit être enregistré avant la création de son bail."
        crumbs={[{ label: "Espace agence", href: "/espace" }, { label: "Locataires" }]}
        actions={addButton}
      />
      <section className="ax-card" aria-label="Liste des locataires">
        <div className="ax-card__body flex flex-col gap-5">
          <ListToolbar search={list.search} onSearch={list.setSearch} searchPlaceholder="Rechercher par nom ou téléphone" />
          <DataTable
            caption="Locataires de l'agence"
            columns={columns}
            rows={tenants.data?.results}
            rowKey={(tenant) => tenant.id}
            loading={tenants.isLoading}
            error={tenants.error}
            onRetry={() => tenants.refetch()}
            count={tenants.data?.count}
            page={list.page}
            onPageChange={list.setPage}
            empty={
              <EmptyState icon={IconUsers} title={list.search ? "Aucun locataire trouvé" : "Aucun locataire pour l'instant"} action={!list.search && addButton}>
                {list.search
                  ? "Essayez un autre nom ou numéro."
                  : "Enregistrez vos locataires pour pouvoir créer leurs baux et suivre leurs paiements."}
              </EmptyState>
            }
          />
        </div>
      </section>

      {(editing || (shortcut.requested && can("tenant.create") && canWrite)) && (
        <TenantFormModal
          tenant={editing && editing !== "new" ? editing : null}
          onClose={() => {
            setEditing(null);
            shortcut.clear();
          }}
        />
      )}

      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={() => deleting && remove.mutate(deleting)}
        pending={remove.isPending}
        title="Supprimer ce locataire ?"
        confirmLabel="Supprimer"
        danger
      >
        <p className="m-0">
          La fiche de {deleting?.first_name} {deleting?.last_name} sera supprimée. Un locataire qui a des baux ne peut pas être
          supprimé.
        </p>
        {remove.formError && <p className="text-danger mt-3 mb-0">{remove.formError}</p>}
      </ConfirmDialog>
    </>
  );
}

function TenantFormModal({ tenant, onClose }: { tenant: Tenant | null; onClose: () => void }) {
  const [form, setForm] = useState<TenantForm>(
    tenant
      ? { phone: tenant.phone, first_name: tenant.first_name, last_name: tenant.last_name, email: tenant.email ?? "", id_document_number: tenant.id_document_number ?? "", notes: tenant.notes ?? "" }
      : EMPTY_FORM,
  );
  const set = (field: keyof TenantForm) => (event: { target: { value: string } }) => setForm((current) => ({ ...current, [field]: event.target.value }));

  const save = useApiMutation({
    mutationFn: async (body: TenantForm) =>
      tenant
        ? unwrap(await api.PATCH("/api/v1/leases/tenants/{id}/", { params: { path: { id: tenant.id } }, body }))
        : unwrap(await api.POST("/api/v1/leases/tenants/", { body })),
    invalidate: [KEY],
    success: tenant ? "Locataire mis à jour." : "Locataire ajouté.",
    onSuccess: onClose,
  });
  const errors = save.fieldErrors;

  return (
    <FormModal
      open
      onClose={onClose}
      title={tenant ? "Modifier le locataire" : "Nouveau locataire"}
      submitLabel={tenant ? "Enregistrer" : "Ajouter"}
      onSubmit={() => save.mutate(tenant ? { ...form, phone: tenant.phone } : form)}
      pending={save.isPending}
      error={save.formError}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="Prénom" required value={form.first_name} onChange={set("first_name")} error={errors.first_name} autoComplete="off" />
        <TextField label="Nom" required value={form.last_name} onChange={set("last_name")} error={errors.last_name} autoComplete="off" />
      </div>
      <TextField
        label="Téléphone"
        required
        type="tel"
        inputMode="tel"
        placeholder="+221 77 123 45 67"
        value={form.phone}
        onChange={set("phone")}
        error={errors.phone}
        disabled={Boolean(tenant)}
        hint={tenant ? "Le téléphone identifie le locataire : il ne peut plus être modifié." : "Numéro au format international."}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="Email" type="email" value={form.email} onChange={set("email")} error={errors.email} />
        <TextField label="Pièce d'identité" placeholder="CNI, passeport…" value={form.id_document_number} onChange={set("id_document_number")} error={errors.id_document_number} />
      </div>
      <TextareaField label="Notes internes" value={form.notes} onChange={set("notes")} error={errors.notes} hint="Visibles uniquement par votre agence." />
    </FormModal>
  );
}
