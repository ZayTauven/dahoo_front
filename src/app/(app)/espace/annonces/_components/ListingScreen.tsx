"use client";

import {
  IconArrowLeft,
  IconExternalLink,
  IconEyeOff,
  IconFileOff,
  IconPencil,
  IconSend,
  IconTrash,
} from "@tabler/icons-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";

import { EmptyState } from "@/components/app/EmptyState";
import { PageHead } from "@/components/app/shell/PageHead";
import { ConfirmDialog } from "@/components/app/ui/Modal";
import { StatusBadge } from "@/components/app/ui/StatusBadge";
import { PropertyCard } from "@/components/site/PropertyCard";
import { api } from "@/lib/api/client";
import { ApiError, unwrap } from "@/lib/api/errors";
import { useApiMutation } from "@/lib/api/useApiMutation";
import { useSession } from "@/lib/auth/useSession";
import { formatDate } from "@/lib/format";
import { enumLabel, LISTING_STATUS, LISTING_TYPE } from "@/lib/labels";

import { CAN_PUBLISH_FROM, CAN_UNPUBLISH_FROM, KEYS, priceLabel, type Listing } from "./data";
import { InterestsSection } from "./InterestsSection";
import { ListingFormModal } from "./ListingFormModal";
import { PhotoManager } from "./PhotoManager";

type StatusAction = "publish" | "unpublish";

const PORTAL_DELAY = "Une annonce publiée apparaît sur le portail en moins d'une minute.";

/** Fiche d'une annonce : informations, publication, photos, aperçu du portail et demandes de visite. */
export function ListingScreen({ id }: { id: number }) {
  const { can, isReadOnly } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [statusAction, setStatusAction] = useState<StatusAction | null>(null);

  const listing = useQuery({
    queryKey: KEYS.detail(id),
    queryFn: async () => unwrap(await api.GET("/api/v1/listings/{id}/", { params: { path: { id } } })),
  });
  const data = listing.data;

  const changeStatus = useApiMutation({
    mutationFn: async (action: StatusAction) =>
      action === "publish"
        ? unwrap(await api.POST("/api/v1/listings/{id}/publish/", { params: { path: { id } } }))
        : unwrap(await api.POST("/api/v1/listings/{id}/unpublish/", { params: { path: { id } } })),
    invalidate: [KEYS.listings],
    success: (result) =>
      result.status === "PUBLISHED" ? `Annonce publiée. ${PORTAL_DELAY}` : "Annonce dépubliée : elle n'est plus visible sur le portail.",
    onSuccess: () => setStatusAction(null),
  });

  const remove = useApiMutation({
    mutationFn: async () => unwrap(await api.DELETE("/api/v1/listings/{id}/", { params: { path: { id } } })),
    success: "Annonce supprimée.",
    onSuccess: () => {
      // Marquer les listes à rafraîchir sans relancer la fiche supprimée (404) avant la navigation.
      void queryClient.invalidateQueries({ queryKey: KEYS.listings, refetchType: "none" });
      router.replace("/espace/annonces");
    },
  });

  const crumbs = [
    { label: "Espace agence", href: "/espace" },
    { label: "Annonces", href: "/espace/annonces" },
    { label: data?.title ?? `Annonce n°${id}` },
  ];

  if (listing.error) {
    const notFound = listing.error instanceof ApiError && listing.error.status === 404;
    return (
      <>
        <PageHead title={`Annonce n°${id}`} crumbs={crumbs} />
        <div className="ax-card">
          {notFound ? (
            <EmptyState icon={IconFileOff} title="Annonce introuvable" action={<BackLink />}>
              Cette annonce n&apos;existe pas, a été supprimée ou n&apos;appartient pas à votre agence.
            </EmptyState>
          ) : (
            <div className="ax-card__body">
              <div className="ax-alert ax-alert--danger" role="alert">
                <div className="ax-alert__content">
                  <p className="ax-alert__message">{listing.error.message}</p>
                </div>
                <div className="ax-alert__actions">
                  <button type="button" className="ax-btn ax-btn--sm ax-btn--ghost" onClick={() => listing.refetch()}>
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

  if (!data) return <ListingSkeleton crumbs={crumbs} />;

  const canWrite = !isReadOnly;
  const canEdit = can("listing.update") && canWrite;
  const canDelete = can("listing.delete") && canWrite;
  const canPublish = can("listing.publish") && canWrite && CAN_PUBLISH_FROM.includes(data.status);
  const canUnpublish = can("listing.unpublish") && canWrite && CAN_UNPUBLISH_FROM.includes(data.status);
  const isPublished = data.status === "PUBLISHED";

  const headActions = (
    <div className="flex flex-wrap gap-2">
      {isPublished && <PortalLink id={data.id} />}
      {canEdit && (
        <button type="button" className="ax-btn ax-btn--secondary" onClick={() => setEditing(true)}>
          <IconPencil className="ax-btn__icon" stroke={1.75} aria-hidden="true" />
          <span className="ax-btn__label">Modifier</span>
        </button>
      )}
      {canDelete && (
        <button
          type="button"
          className="ax-btn ax-btn--soft-danger"
          onClick={() => {
            remove.reset();
            remove.resetErrors();
            setDeleting(true);
          }}
        >
          <IconTrash className="ax-btn__icon" stroke={1.75} aria-hidden="true" />
          <span className="ax-btn__label">Supprimer</span>
        </button>
      )}
    </div>
  );

  return (
    <>
      <PageHead
        title={data.title}
        subtitle={
          <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <StatusBadge entries={LISTING_STATUS} value={data.status} />
            <StatusBadge entries={LISTING_TYPE} value={data.listing_type} />
            <span>{data.unit_label}</span>
          </span>
        }
        crumbs={crumbs}
        actions={headActions}
      />

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="flex min-w-0 flex-col gap-5 lg:col-span-2">
          <section className="ax-card" aria-labelledby="annonce-infos">
            <div className="ax-card__header">
              <h2 className="ax-card__title" id="annonce-infos">
                Informations
              </h2>
            </div>
            <div className="ax-card__body flex flex-col gap-5">
              <dl className="m-0 grid gap-x-6 gap-y-4 sm:grid-cols-2">
                <Detail label={data.listing_type === "RENT" ? "Loyer" : "Prix de vente"}>
                  <span className="font-display text-text-strong text-xl font-bold">{priceLabel(data)}</span>
                </Detail>
                <Detail label="Type">{enumLabel(LISTING_TYPE, data.listing_type)}</Detail>
                <Detail label="Lot">{data.unit_label}</Detail>
                <Detail label="Créée le">{formatDate(data.created_at)}</Detail>
              </dl>
              <div className="flex flex-col gap-1.5">
                <h3 className="text-text-muted m-0 text-sm font-normal">Description</h3>
                <p className="text-text m-0 whitespace-pre-line">{data.description}</p>
              </div>
            </div>
          </section>

          <PhotoManager listing={data} canEdit={canEdit} />

          {can("listing.interest.view") && <InterestsSection listing={data} />}
        </div>

        <div className="flex min-w-0 flex-col gap-5">
          <PublicationCard
            listing={data}
            canPublish={canPublish}
            canUnpublish={canUnpublish}
            readOnly={isReadOnly}
            onAction={(action) => {
              changeStatus.reset();
              changeStatus.resetErrors();
              setStatusAction(action);
            }}
          />
          <PreviewCard listing={data} />
        </div>
      </div>

      <div className="mt-5">
        <BackLink />
      </div>

      {editing && <ListingFormModal listing={data} onClose={() => setEditing(false)} />}

      <ConfirmDialog
        open={statusAction !== null}
        onClose={() => setStatusAction(null)}
        onConfirm={() => statusAction && changeStatus.mutate(statusAction)}
        pending={changeStatus.isPending}
        title={statusAction === "unpublish" ? "Dépublier cette annonce ?" : "Publier cette annonce ?"}
        confirmLabel={statusAction === "unpublish" ? "Dépublier" : "Publier"}
        danger={statusAction === "unpublish"}
      >
        {statusAction === "unpublish" ? (
          <p className="m-0">
            L&apos;annonce sera retirée du portail Dahoo (statut « Suspendue ») et ne recevra plus de demandes de visite. Vous pourrez la
            republier à tout moment.
          </p>
        ) : (
          <>
            <p className="m-0">
              « {data.title} » sera visible par tous les visiteurs du portail Dahoo, qui pourront vous envoyer des demandes de visite.{" "}
              {PORTAL_DELAY}
            </p>
            {data.photos_count === 0 && (
              <p className="text-text-muted mt-3 mb-0 text-sm">
                Cette annonce n&apos;a aucune photo : elle s&apos;affichera avec une image par défaut, ce qui attire beaucoup moins de
                visiteurs.
              </p>
            )}
          </>
        )}
        {(changeStatus.formError ?? changeStatus.error?.message) && (
          <div className="ax-alert ax-alert--danger mt-4" role="alert">
            <div className="ax-alert__content">
              <p className="ax-alert__message">{changeStatus.formError ?? changeStatus.error?.message}</p>
            </div>
          </div>
        )}
      </ConfirmDialog>

      <ConfirmDialog
        open={deleting}
        onClose={() => setDeleting(false)}
        onConfirm={() => remove.mutate(undefined)}
        pending={remove.isPending}
        title="Supprimer cette annonce ?"
        confirmLabel="Supprimer l'annonce"
        danger
      >
        <p className="m-0">
          L&apos;annonce, ses {data.photos_count > 0 ? `${data.photos_count} photos` : "photos"} et ses demandes de visite seront
          définitivement supprimées{isPublished ? ", et elle disparaîtra du portail" : ""}. Le lot n&apos;est pas modifié.
        </p>
        {isPublished && (
          <p className="text-text-muted mt-3 mb-0 text-sm">Pour la retirer temporairement du portail, préférez « Dépublier ».</p>
        )}
        {(remove.formError ?? remove.error?.message) && <p className="text-danger mt-3 mb-0">{remove.formError ?? remove.error?.message}</p>}
      </ConfirmDialog>
    </>
  );
}

function PublicationCard({
  listing,
  canPublish,
  canUnpublish,
  readOnly,
  onAction,
}: {
  listing: Listing;
  canPublish: boolean;
  canUnpublish: boolean;
  readOnly: boolean;
  onAction: (action: StatusAction) => void;
}) {
  const explanation: Record<Listing["status"], string> = {
    DRAFT: "Brouillon : l'annonce n'est visible que par votre agence. Ajoutez des photos puis publiez-la.",
    PUBLISHED: "En ligne sur le portail Dahoo : les visiteurs peuvent la consulter et demander une visite.",
    SUSPENDED: "Suspendue : l'annonce est retirée du portail. Republiez-la quand le bien est de nouveau disponible.",
    CLOSED: "Clôturée : l'annonce n'est plus proposée sur le portail.",
  };

  return (
    <section className="ax-card" aria-labelledby="annonce-publication">
      <div className="ax-card__header">
        <h2 className="ax-card__title" id="annonce-publication">
          Statut et publication
        </h2>
      </div>
      <div className="ax-card__body flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <StatusBadge entries={LISTING_STATUS} value={listing.status} />
          <p className="text-text m-0 text-sm">{explanation[listing.status]}</p>
          {listing.published_at && (
            <p className="text-text-muted m-0 text-sm">
              {listing.status === "PUBLISHED" ? "Publiée le" : "Dernière publication le"} {formatDate(listing.published_at)}
            </p>
          )}
        </div>

        {(canPublish || canUnpublish) && (
          <div className="flex flex-col gap-2">
            {canPublish && (
              <button type="button" className="ax-btn ax-btn--primary ax-btn--block" onClick={() => onAction("publish")}>
                <IconSend className="ax-btn__icon" stroke={1.75} aria-hidden="true" />
                <span className="ax-btn__label">{listing.status === "SUSPENDED" ? "Republier" : "Publier sur le portail"}</span>
              </button>
            )}
            {canUnpublish && (
              <button type="button" className="ax-btn ax-btn--secondary ax-btn--block" onClick={() => onAction("unpublish")}>
                <IconEyeOff className="ax-btn__icon" stroke={1.75} aria-hidden="true" />
                <span className="ax-btn__label">Dépublier</span>
              </button>
            )}
          </div>
        )}

        {listing.status === "PUBLISHED" && <PortalLink id={listing.id} block />}

        {readOnly ? (
          <p className="text-text-muted m-0 text-sm">Accès en lecture seule : la publication est suspendue jusqu&apos;au renouvellement.</p>
        ) : (
          listing.status !== "CLOSED" && <p className="text-text-subtle m-0 text-xs">{PORTAL_DELAY}</p>
        )}
      </div>
    </section>
  );
}

/** Aperçu de la carte affichée sur le portail (lieu et caractéristiques lus sur le lot et le bien). */
function PreviewCard({ listing }: { listing: Listing }) {
  const { can } = useSession();
  const unit = useQuery({
    queryKey: [...KEYS.units, listing.unit],
    queryFn: async () => unwrap(await api.GET("/api/v1/properties/units/{id}/", { params: { path: { id: listing.unit } } })),
    enabled: can("unit.view"),
    retry: false,
    staleTime: 60_000,
  });
  const building = useQuery({
    queryKey: ["buildings", unit.data?.building],
    queryFn: async () =>
      unwrap(await api.GET("/api/v1/properties/buildings/{id}/", { params: { path: { id: unit.data?.building ?? 0 } } })),
    enabled: Boolean(unit.data) && can("building.view"),
    retry: false,
    staleTime: 60_000,
  });
  const property = useQuery({
    queryKey: ["properties", building.data?.property],
    queryFn: async () =>
      unwrap(await api.GET("/api/v1/properties/properties/{id}/", { params: { path: { id: building.data?.property ?? 0 } } })),
    enabled: Boolean(building.data) && can("property.view"),
    retry: false,
    staleTime: 60_000,
  });

  return (
    <section className="ax-card" aria-labelledby="annonce-apercu">
      <div className="ax-card__header">
        <div className="ax-card__titles">
          <h2 className="ax-card__title" id="annonce-apercu">
            Aperçu sur le portail
          </h2>
          <p className="ax-card__subtitle">La carte telle que les visiteurs la verront dans les listes.</p>
        </div>
      </div>
      <div className="ax-card__body">
        {/* Aperçu non interactif : les liens de la carte mènent au portail. */}
        <div inert className="pointer-events-none mx-auto max-w-sm select-none">
          <PropertyCard
            listing={{
              id: listing.id,
              title: listing.title,
              listing_type: listing.listing_type,
              price: listing.price,
              cover: listing.cover || null,
              city: property.data?.city,
              neighborhood: property.data?.neighborhood,
              bedrooms: unit.data?.bedrooms,
              bathrooms: unit.data?.bathrooms,
              surface: unit.data?.surface,
            }}
          />
        </div>
      </div>
    </section>
  );
}

function PortalLink({ id, block = false }: { id: number; block?: boolean }) {
  return (
    <a
      href={`/annonces/${id}`}
      target="_blank"
      rel="noopener"
      className={`ax-btn ${block ? "ax-btn--ghost ax-btn--block" : "ax-btn--secondary"}`}
    >
      <IconExternalLink className="ax-btn__icon" stroke={1.75} aria-hidden="true" />
      <span className="ax-btn__label">Voir sur le portail</span>
      <span className="sr-only"> (nouvel onglet)</span>
    </a>
  );
}

function Detail({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-0.5">
      <dt className="text-text-muted text-sm">{label}</dt>
      <dd className="text-text-strong m-0 font-medium break-words">{children}</dd>
    </div>
  );
}

function BackLink() {
  return (
    <Link href="/espace/annonces" className="ax-btn ax-btn--ghost ax-btn--sm">
      <IconArrowLeft className="ax-btn__icon" stroke={1.75} aria-hidden="true" />
      <span className="ax-btn__label">Toutes les annonces</span>
    </Link>
  );
}

function ListingSkeleton({ crumbs }: { crumbs: { label: string; href?: string }[] }) {
  return (
    <>
      <PageHead title="Annonce" crumbs={crumbs} />
      <div className="grid gap-5 lg:grid-cols-3" aria-busy="true" aria-label="Chargement de l'annonce">
        <div className="ax-card lg:col-span-2">
          <div className="ax-card__body flex flex-col gap-3">
            {Array.from({ length: 5 }, (_, line) => (
              <span key={line} className="ax-skeleton ax-skeleton--text" style={{ inlineSize: `${90 - line * 12}%` }} />
            ))}
          </div>
        </div>
        <div className="ax-card">
          <div className="ax-card__body flex flex-col gap-3">
            <span className="ax-skeleton ax-skeleton--text" style={{ inlineSize: "40%" }} />
            <span className="ax-skeleton aspect-[4/3] rounded-md" />
          </div>
        </div>
      </div>
    </>
  );
}
