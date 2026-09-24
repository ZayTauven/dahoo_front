"use client";

import { IconArrowLeft, IconBuildingOff, IconPencil, IconPlayerPause, IconPlayerPlay } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useState, type ReactNode } from "react";

import { EmptyState } from "@/components/app/EmptyState";
import { PageHead } from "@/components/app/shell/PageHead";
import { CheckboxField, TextField } from "@/components/app/ui/fields";
import { ConfirmDialog, FormModal } from "@/components/app/ui/Modal";
import { StatusBadge } from "@/components/app/ui/StatusBadge";
import { api } from "@/lib/api/client";
import { ApiError, unwrap } from "@/lib/api/errors";
import { useApiMutation } from "@/lib/api/useApiMutation";
import { formatDate } from "@/lib/format";
import { ACCESS_STATUS } from "@/lib/labels";

import { KEYS, ORGANIZATION_STATE, PLATFORM_CRUMB, type Organization } from "../../_components/data";
import { MembersCard } from "../../_components/MembersCard";
import { SubscriptionsCard } from "../../_components/SubscriptionsCard";
import { TrialCard } from "../../_components/TrialCard";

export function OrganizationScreen({ id }: { id: number }) {
  const [editing, setEditing] = useState(false);
  const [toggling, setToggling] = useState(false);

  const organization = useQuery({
    queryKey: [...KEYS.organizations, "detail", id],
    queryFn: async () => unwrap(await api.GET("/api/v1/platform/organizations/{id}/", { params: { path: { id } } })),
  });
  const data = organization.data;
  const suspended = data?.is_active === false;

  const toggle = useApiMutation({
    mutationFn: async (isActive: boolean) =>
      unwrap(await api.PATCH("/api/v1/platform/organizations/{id}/", { params: { path: { id } }, body: { is_active: isActive } })),
    invalidate: [KEYS.organizations],
    success: (result) => (result.is_active === false ? `Agence « ${result.name} » suspendue.` : `Agence « ${result.name} » réactivée.`),
    onSuccess: () => setToggling(false),
  });

  const baseCrumbs = [PLATFORM_CRUMB, { label: "Agences clientes", href: "/plateforme/agences" }];

  if (organization.error) {
    const notFound = organization.error instanceof ApiError && organization.error.status === 404;
    return (
      <>
        <PageHead title="Agence" crumbs={[...baseCrumbs, { label: `Agence n°${id}` }]} />
        <div className="ax-card">
          {notFound ? (
            <EmptyState icon={IconBuildingOff} title="Agence introuvable" action={<BackLink />}>
              Aucune agence ne correspond à cette adresse.
            </EmptyState>
          ) : (
            <div className="ax-card__body">
              <div className="ax-alert ax-alert--danger" role="alert">
                <div className="ax-alert__content">
                  <p className="ax-alert__message">{organization.error.message}</p>
                </div>
                <div className="ax-alert__actions">
                  <button type="button" className="ax-btn ax-btn--sm ax-btn--ghost" onClick={() => organization.refetch()}>
                    <span className="ax-btn__label">Réessayer</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col gap-6" aria-busy="true" aria-label="Chargement de la fiche agence">
        <PageHead title="Agence" crumbs={[...baseCrumbs, { label: "Chargement…" }]} />
        <div className="grid gap-6 lg:grid-cols-3">
          {[0, 1].map((card) => (
            <div key={card} className={`ax-card${card === 0 ? " lg:col-span-2" : ""}`}>
              <div className="ax-card__body flex flex-col gap-3">
                {Array.from({ length: 5 }, (_, index) => (
                  <span key={index} className="ax-skeleton ax-skeleton--text" style={{ inlineSize: `${85 - index * 10}%` }} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const toggleButton = suspended ? (
    <button type="button" className="ax-btn ax-btn--primary" onClick={() => setToggling(true)}>
      <IconPlayerPlay className="ax-btn__icon" stroke={1.75} aria-hidden="true" />
      <span className="ax-btn__label">Réactiver l&apos;agence</span>
    </button>
  ) : (
    <button type="button" className="ax-btn ax-btn--danger" onClick={() => setToggling(true)}>
      <IconPlayerPause className="ax-btn__icon" stroke={1.75} aria-hidden="true" />
      <span className="ax-btn__label">Suspendre</span>
    </button>
  );

  return (
    <>
      <PageHead
        title={data.name}
        subtitle={
          <span className="inline-flex flex-wrap items-center gap-2">
            <StatusBadge entries={ORGANIZATION_STATE} value={suspended ? "suspended" : "active"} />
            <StatusBadge entries={ACCESS_STATUS} value={data.access_status} />
            {data.is_internal && <span className="ax-badge ax-badge--soft ax-badge--info">Compte interne</span>}
            <span>Cliente depuis le {formatDate(data.created_at)}</span>
          </span>
        }
        crumbs={[...baseCrumbs, { label: data.name }]}
        actions={toggleButton}
      />

      {suspended && (
        <div className="ax-alert ax-alert--danger mb-6" role="status">
          <div className="ax-alert__content">
            <p className="ax-alert__title">Agence suspendue</p>
            <p className="ax-alert__message">Ses membres ne peuvent plus accéder à Dahoo. Ses données sont conservées.</p>
          </div>
        </div>
      )}

      <div className="grid items-start gap-6 lg:grid-cols-3">
        <div className="flex min-w-0 flex-col gap-6 lg:col-span-2">
          <InfoCard organization={data} onEdit={() => setEditing(true)} />
          <SubscriptionsCard organization={data} />
          <MembersCard organizationId={data.id} />
        </div>
        <div className="flex min-w-0 flex-col gap-6">
          <TrialCard organization={data} />
        </div>
      </div>

      {editing && <InfoFormModal organization={data} onClose={() => setEditing(false)} />}

      <ConfirmDialog
        open={toggling}
        onClose={() => {
          setToggling(false);
          toggle.resetErrors();
        }}
        onConfirm={() => toggle.mutate(suspended)}
        pending={toggle.isPending}
        title={suspended ? "Réactiver cette agence ?" : "Suspendre cette agence ?"}
        confirmLabel={suspended ? "Réactiver" : "Suspendre l'agence"}
        danger={!suspended}
      >
        {suspended ? (
          <p className="m-0">
            Les membres de {data.name} retrouveront l&apos;accès à Dahoo, selon l&apos;état de l&apos;essai ou de l&apos;abonnement :
            actuellement « {ACCESS_STATUS[data.access_status]?.label ?? data.access_status} ».
          </p>
        ) : (
          <>
            <p className="m-0">
              <strong className="text-text-strong">
                {data.member_count > 1
                  ? `Les ${data.member_count} membres actifs de ${data.name} perdront immédiatement l'accès à Dahoo.`
                  : data.member_count === 1
                    ? `L'unique membre actif de ${data.name} perdra immédiatement l'accès à Dahoo.`
                    : `Plus personne ne pourra accéder à l'espace de ${data.name}.`}
              </strong>
            </p>
            <p className="mt-3 mb-0">Les données de l&apos;agence sont conservées. Vous pourrez la réactiver à tout moment depuis cette fiche.</p>
          </>
        )}
        {toggle.formError && <p className="text-danger mt-3 mb-0">{toggle.formError}</p>}
      </ConfirmDialog>
    </>
  );
}

function InfoCard({ organization, onEdit }: { organization: Organization; onEdit: () => void }) {
  const rows: { label: string; value: ReactNode }[] = [
    {
      label: "Téléphone",
      value: organization.phone ? (
        <a href={`tel:${organization.phone}`} className="ax-num text-link">
          {organization.phone}
        </a>
      ) : null,
    },
    {
      label: "Email",
      value: organization.email ? (
        <a href={`mailto:${organization.email}`} className="text-link break-all">
          {organization.email}
        </a>
      ) : null,
    },
    { label: "Ville", value: organization.city || null },
    { label: "Adresse", value: organization.address || null },
    { label: "Membres actifs", value: <span className="ax-num">{organization.member_count}</span> },
    { label: "Type de compte", value: organization.is_internal ? "Interne Dahoo (accès permanent)" : "Agence cliente" },
  ];

  return (
    <section className="ax-card" aria-labelledby="carte-infos">
      <div className="ax-card__header">
        <div className="ax-card__titles">
          <h2 id="carte-infos" className="ax-card__title">
            Informations
          </h2>
          <p className="ax-card__subtitle">Coordonnées de l&apos;agence et type de compte.</p>
        </div>
        <div className="ax-card__actions">
          <button type="button" className="ax-btn ax-btn--secondary ax-btn--sm" onClick={onEdit}>
            <IconPencil className="ax-btn__icon" stroke={1.75} aria-hidden="true" />
            <span className="ax-btn__label">Modifier</span>
          </button>
        </div>
      </div>
      <div className="ax-card__body">
        <dl className="m-0 grid gap-4 sm:grid-cols-2">
          {rows.map((row) => (
            <div key={row.label} className="flex min-w-0 flex-col gap-0.5">
              <dt className="text-text-muted text-sm">{row.label}</dt>
              <dd className="text-text-strong m-0">{row.value ?? <span className="text-text-subtle">Non renseigné</span>}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

interface InfoForm {
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  is_internal: boolean;
}

function InfoFormModal({ organization, onClose }: { organization: Organization; onClose: () => void }) {
  const [form, setForm] = useState<InfoForm>({
    name: organization.name,
    phone: organization.phone ?? "",
    email: organization.email ?? "",
    address: organization.address ?? "",
    city: organization.city ?? "",
    is_internal: organization.is_internal ?? false,
  });
  const set = (field: Exclude<keyof InfoForm, "is_internal">) => (event: { target: { value: string } }) =>
    setForm((current) => ({ ...current, [field]: event.target.value }));

  const save = useApiMutation({
    mutationFn: async (body: InfoForm) =>
      unwrap(await api.PATCH("/api/v1/platform/organizations/{id}/", { params: { path: { id: organization.id } }, body })),
    invalidate: [KEYS.organizations],
    success: "Informations de l'agence mises à jour.",
    onSuccess: onClose,
  });
  const errors = save.fieldErrors;

  return (
    <FormModal
      open
      onClose={onClose}
      title="Modifier l'agence"
      onSubmit={() =>
        save.mutate({
          ...form,
          name: form.name.trim(),
          phone: form.phone.trim(),
          email: form.email.trim(),
          address: form.address.trim(),
          city: form.city.trim(),
        })
      }
      pending={save.isPending}
      error={save.formError}
    >
      <TextField label="Nom de l'agence" required value={form.name} onChange={set("name")} error={errors.name} autoComplete="off" />
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="Téléphone" type="tel" inputMode="tel" value={form.phone} onChange={set("phone")} error={errors.phone} />
        <TextField label="Email" type="email" value={form.email} onChange={set("email")} error={errors.email} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="Ville" value={form.city} onChange={set("city")} error={errors.city} />
        <TextField label="Adresse" value={form.address} onChange={set("address")} error={errors.address} />
      </div>
      <div className="flex flex-col gap-1">
        <CheckboxField
          label="Compte interne Dahoo"
          checked={form.is_internal}
          onChange={(event) => setForm((current) => ({ ...current, is_internal: event.target.checked }))}
        />
        <p className="text-text-muted m-0 text-sm">
          Accès permanent, sans essai ni abonnement, et exclu des indicateurs. Réservé aux comptes de l&apos;équipe Dahoo (démonstration,
          tests).
        </p>
        {errors.is_internal && <p className="text-danger m-0 text-sm">{errors.is_internal}</p>}
      </div>
    </FormModal>
  );
}

function BackLink() {
  return (
    <Link href="/plateforme/agences" className="ax-btn ax-btn--secondary">
      <IconArrowLeft className="ax-btn__icon" stroke={1.75} aria-hidden="true" />
      <span className="ax-btn__label">Retour aux agences</span>
    </Link>
  );
}
