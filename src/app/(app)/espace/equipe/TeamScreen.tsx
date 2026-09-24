"use client";

import { IconInfoCircle, IconLock, IconPencil, IconPlus, IconUserCheck, IconUserOff, IconUsersGroup } from "@tabler/icons-react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { EmptyState } from "@/components/app/EmptyState";
import { PageHead } from "@/components/app/shell/PageHead";
import { DataTable, type Column } from "@/components/app/ui/DataTable";
import { SelectField } from "@/components/app/ui/fields";
import { ConfirmDialog, FormModal } from "@/components/app/ui/Modal";
import { useListParams } from "@/hooks/useListParams";
import { api } from "@/lib/api/client";
import { unwrap } from "@/lib/api/errors";
import { useApiMutation } from "@/lib/api/useApiMutation";
import { useSession } from "@/lib/auth/useSession";
import { formatDate } from "@/lib/format";

import { AddMemberModal } from "./_components/AddMemberModal";
import { fullName, initials, MEMBERS_KEY, ROLE_SUMMARY, ROLE_TONE, useRoles, type Member, type Role } from "./_components/data";
import { RolesGuide } from "./_components/RolesGuide";

/*
 * Équipe de l'agence : membres, rôles et accès. Un membre ne modifie jamais sa propre appartenance
 * (l'API le refuse) : les actions sont absentes sur sa ligne.
 */

export function TeamScreen() {
  const session = useSession();
  const { can, isReadOnly, user } = session;
  const list = useListParams([] as const);
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<Member | null>(null);
  const [toggling, setToggling] = useState<Member | null>(null);

  const allowed = can("member.view");
  const members = useQuery({
    queryKey: [...MEMBERS_KEY, list.query],
    queryFn: async () => unwrap(await api.GET("/api/v1/organizations/members/", { params: { query: list.query } })),
    placeholderData: keepPreviousData,
    enabled: allowed,
  });
  const roles = useRoles();
  const roleByCode = new Map((roles.data ?? []).map((role) => [role.code, role]));

  const toggle = useApiMutation({
    mutationFn: async (member: Member) =>
      unwrap(
        await api.PATCH("/api/v1/organizations/members/{id}/", {
          params: { path: { id: member.id } },
          body: { is_active: !isActive(member) },
        }),
      ),
    invalidate: [MEMBERS_KEY],
    success: (member) => `${fullName(member)} ${isActive(member) ? "a de nouveau accès à l'agence" : "n'a plus accès à l'agence"}.`,
    onSuccess: () => setToggling(null),
  });

  const canManage = can("member.update") && !isReadOnly;
  const canAdd = can("member.create") && !isReadOnly;
  const isSelf = (member: Member) => member.user.id === user?.id;
  const selfListed = Boolean(members.data?.results.some(isSelf));

  const columns: Column<Member>[] = [
    {
      key: "member",
      header: "Membre",
      cell: (member) => (
        <div className="flex min-w-0 items-center gap-3">
          <span className={`ax-avatar ax-avatar--sm shrink-0${isActive(member) ? "" : " opacity-60"}`} aria-hidden="true">
            <span className="ax-avatar__initials">{initials(member.user.first_name, member.user.last_name)}</span>
          </span>
          <div className="flex min-w-0 flex-col">
            <span className="text-text-strong flex flex-wrap items-center gap-x-2 font-medium">
              {fullName(member)}
              {isSelf(member) && <span className="ax-badge ax-badge--soft ax-badge--neutral ax-badge--sm">Vous</span>}
            </span>
            <span className="ax-num text-text-subtle text-xs md:hidden">{member.user.phone}</span>
            {member.user.email && <span className="text-text-subtle truncate text-xs">{member.user.email}</span>}
          </div>
        </div>
      ),
    },
    { key: "phone", header: "Téléphone", hideOnMobile: true, cell: (member) => <span className="ax-num whitespace-nowrap">{member.user.phone}</span> },
    { key: "role", header: "Rôle", cell: (member) => <RoleBadge code={member.role} role={roleByCode.get(member.role)} /> },
    {
      key: "status",
      header: "Accès",
      cell: (member) =>
        isActive(member) ? (
          <span className="ax-badge ax-badge--soft ax-badge--success">
            <span className="ax-badge__dot" aria-hidden="true" />
            Actif
          </span>
        ) : (
          <span className="ax-badge ax-badge--soft ax-badge--neutral">
            <span className="ax-badge__dot" aria-hidden="true" />
            Désactivé
          </span>
        ),
    },
    { key: "since", header: "Membre depuis", hideOnMobile: true, cell: (member) => formatDate(member.created_at, "short") },
  ];

  if (canManage) {
    columns.push({
      key: "actions",
      header: "Actions",
      cell: (member) =>
        isSelf(member) ? (
          <span className="text-text-subtle flex justify-end text-xs whitespace-nowrap">Votre compte</span>
        ) : (
          <div className="flex justify-end gap-1">
            <button
              type="button"
              className="ax-btn ax-btn--ghost ax-btn--icon ax-btn--sm"
              onClick={() => setEditing(member)}
              aria-label={`Changer le rôle de ${fullName(member)}`}
              title="Changer le rôle"
            >
              <IconPencil className="ax-btn__icon" stroke={1.75} aria-hidden="true" />
            </button>
            <button
              type="button"
              className="ax-btn ax-btn--ghost ax-btn--icon ax-btn--sm"
              onClick={() => {
                toggle.resetErrors();
                setToggling(member);
              }}
              aria-label={`${isActive(member) ? "Désactiver l'accès de" : "Réactiver l'accès de"} ${fullName(member)}`}
              title={isActive(member) ? "Désactiver l'accès" : "Réactiver l'accès"}
            >
              {isActive(member) ? (
                <IconUserOff className="ax-btn__icon" stroke={1.75} aria-hidden="true" />
              ) : (
                <IconUserCheck className="ax-btn__icon" stroke={1.75} aria-hidden="true" />
              )}
            </button>
          </div>
        ),
    });
  }

  const addButton = canAdd && (
    <button type="button" className="ax-btn ax-btn--primary" onClick={() => setAdding(true)} disabled={!roles.data}>
      <IconPlus className="ax-btn__icon" stroke={1.75} aria-hidden="true" />
      <span className="ax-btn__label">Ajouter un membre</span>
    </button>
  );

  const head = (
    <PageHead
      title="Équipe"
      subtitle="Les membres de votre agence, leur rôle et leur accès à l'espace Dahoo."
      crumbs={[{ label: "Espace agence", href: "/espace" }, { label: "Équipe" }]}
      actions={allowed ? addButton : undefined}
    />
  );

  if (session.isLoading) {
    return (
      <>
        {head}
        <div className="ax-card" aria-busy="true" aria-label="Chargement">
          <div className="ax-card__body flex flex-col gap-3">
            <span className="ax-skeleton ax-skeleton--text" style={{ inlineSize: "40%" }} />
            <span className="ax-skeleton ax-skeleton--text" style={{ inlineSize: "70%" }} />
          </div>
        </div>
      </>
    );
  }

  if (!allowed) {
    return (
      <>
        {head}
        <section className="ax-card">
          <div className="ax-card__body">
            <EmptyState icon={IconLock} title="Accès réservé">
              Votre rôle ne permet pas de consulter l&apos;équipe de l&apos;agence. Adressez-vous à un administrateur.
            </EmptyState>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      {head}
      <div className="flex flex-col gap-6">
        <section className="ax-card" aria-label="Membres de l'agence">
          <div className="ax-card__body flex flex-col gap-4">
            <DataTable
              caption="Membres de l'agence"
              columns={columns}
              rows={members.data?.results}
              rowKey={(member) => member.id}
              loading={members.isLoading}
              error={members.error}
              onRetry={() => members.refetch()}
              count={members.data?.count}
              page={list.page}
              onPageChange={list.setPage}
              empty={
                <EmptyState icon={IconUsersGroup} title="Aucun membre pour l'instant" action={addButton}>
                  Invitez vos collaborateurs : chacun se connecte avec son numéro de téléphone et ne voit que ce que son rôle
                  autorise.
                </EmptyState>
              }
            />
            {canManage && selfListed && (
              <p className="text-text-muted m-0 flex items-start gap-2 text-sm">
                <IconInfoCircle className="mt-0.5 size-4 shrink-0" stroke={1.75} aria-hidden="true" />
                <span>
                  Vous ne pouvez pas changer votre propre rôle ni désactiver votre accès : demandez-le à un autre
                  administrateur de l&apos;agence.
                </span>
              </p>
            )}
            {isReadOnly && (
              <p className="text-text-muted m-0 flex items-start gap-2 text-sm">
                <IconLock className="mt-0.5 size-4 shrink-0" stroke={1.75} aria-hidden="true" />
                <span>Votre essai est terminé : l&apos;équipe reste consultable mais ne peut plus être modifiée.</span>
              </p>
            )}
          </div>
        </section>

        <RolesGuide />
      </div>

      {adding && roles.data && <AddMemberModal roles={roles.data} onClose={() => setAdding(false)} />}
      {editing && roles.data && <RoleModal member={editing} roles={roles.data} onClose={() => setEditing(null)} />}

      <ConfirmDialog
        open={Boolean(toggling)}
        onClose={() => setToggling(null)}
        onConfirm={() => toggling && toggle.mutate(toggling)}
        pending={toggle.isPending}
        title={toggling && isActive(toggling) ? "Désactiver ce membre ?" : "Réactiver ce membre ?"}
        confirmLabel={toggling && isActive(toggling) ? "Désactiver" : "Réactiver"}
        danger={Boolean(toggling && isActive(toggling))}
      >
        {toggling && isActive(toggling) ? (
          <p className="m-0">
            {fullName(toggling)} n&apos;aura plus accès à l&apos;espace de votre agence. Son compte et l&apos;historique de ses
            actions sont conservés : vous pourrez le réactiver à tout moment.
          </p>
        ) : (
          <p className="m-0">
            {toggling && fullName(toggling)} retrouvera l&apos;accès à l&apos;espace de votre agence avec le rôle «{" "}
            {toggling && (roleByCode.get(toggling.role)?.label ?? toggling.role)} ».
          </p>
        )}
        {toggle.formError && <p className="text-danger mt-3 mb-0">{toggle.formError}</p>}
      </ConfirmDialog>
    </>
  );
}

function isActive(member: Member): boolean {
  return member.is_active !== false;
}

function RoleBadge({ code, role }: { code: string; role?: Role }) {
  return (
    <span className={`ax-badge ax-badge--soft ax-badge--${ROLE_TONE[code] ?? "neutral"} whitespace-nowrap`}>{role?.label ?? code}</span>
  );
}

function RoleModal({ member, roles, onClose }: { member: Member; roles: Role[]; onClose: () => void }) {
  const [role, setRole] = useState(member.role);
  const save = useApiMutation({
    mutationFn: async (code: string) =>
      unwrap(await api.PATCH("/api/v1/organizations/members/{id}/", { params: { path: { id: member.id } }, body: { role: code } })),
    invalidate: [MEMBERS_KEY],
    success: (updated) => `${fullName(updated)} est désormais « ${roles.find((item) => item.code === updated.role)?.label ?? updated.role} ».`,
    onSuccess: onClose,
  });

  return (
    <FormModal
      open
      onClose={onClose}
      title="Changer le rôle"
      submitLabel="Enregistrer"
      onSubmit={() => (role === member.role ? onClose() : save.mutate(role))}
      pending={save.isPending}
      error={save.formError}
    >
      <p className="text-text m-0">
        Rôle de <b className="text-text-strong">{fullName(member)}</b> <span className="ax-num text-text-muted">({member.user.phone})</span>
      </p>
      <SelectField
        label="Rôle"
        required
        value={role}
        onChange={(event) => setRole(event.target.value)}
        error={save.fieldErrors.role}
        options={roles.map((item) => ({ value: item.code, label: item.label }))}
        hint={ROLE_SUMMARY[role] ?? "Le rôle détermine ce que le membre peut voir et faire."}
      />
      <p className="text-text-muted m-0 text-sm">Les nouveaux droits s&apos;appliquent immédiatement.</p>
    </FormModal>
  );
}
