"use client";

import {
  IconAlertTriangle,
  IconArrowLeft,
  IconArrowRight,
  IconCloudUpload,
  IconPencil,
  IconPhoto,
  IconRefresh,
  IconStar,
  IconTrash,
  IconX,
} from "@tabler/icons-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import { useEffect, useId, useRef, useState, type DragEvent } from "react";

import { TextField } from "@/components/app/ui/fields";
import { ConfirmDialog, FormModal } from "@/components/app/ui/Modal";
import { useToast } from "@/components/app/ui/Toast";
import { api } from "@/lib/api/client";
import { unwrap } from "@/lib/api/errors";
import { useApiMutation } from "@/lib/api/useApiMutation";
import { cn } from "@/lib/utils";

import {
  ACCEPT_ATTRIBUTE,
  checkPhotoFile,
  formatFileSize,
  KEYS,
  MAX_PHOTOS,
  sortPhotos,
  uploadPhoto,
  type Listing,
  type ListingPhoto,
  type UploadHandle,
} from "./data";

type UploadStatus = "queued" | "uploading" | "error" | "invalid";

interface UploadItem {
  key: string;
  file: File;
  /** URL locale (blob:) pour l'aperçu avant envoi ; absente si le fichier n'est pas une image. */
  preview?: string;
  status: UploadStatus;
  progress: number;
  error?: string;
}

const STATUS_TEXT: Record<UploadStatus, string> = {
  queued: "En attente",
  uploading: "Envoi en cours",
  error: "Échec de l'envoi",
  invalid: "Refusé",
};

/**
 * Gestionnaire des photos d'une annonce : envoi de plusieurs fichiers (glisser-déposer ou sélection),
 * contrôle du format et du poids avant envoi, progression par fichier, puis grille ordonnée
 * (la 1re photo = couverture) avec texte alternatif, réordonnancement et suppression.
 */
export function PhotoManager({ listing, canEdit }: { listing: Listing; canEdit: boolean }) {
  const listingId = listing.id;
  const queryClient = useQueryClient();
  const toast = useToast();
  const inputId = useId();
  const [queue, setQueue] = useState<UploadItem[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [editing, setEditing] = useState<ListingPhoto | null>(null);
  const [deleting, setDeleting] = useState<ListingPhoto | null>(null);

  // Envois séquentiels (une photo à la fois : bande passante mobile, verrou côté API).
  const chain = useRef<Promise<unknown>>(Promise.resolve());
  const handles = useRef(new Map<string, UploadHandle>());
  const cancelled = useRef(new Set<string>());
  const previews = useRef(new Set<string>());
  const counter = useRef(0);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    const activeHandles = handles.current;
    const activePreviews = previews.current;
    return () => {
      mounted.current = false;
      activeHandles.forEach((handle) => handle.abort());
      activePreviews.forEach((url) => URL.revokeObjectURL(url));
      activePreviews.clear();
    };
  }, []);

  const photos = useQuery({
    queryKey: KEYS.photos(listingId),
    queryFn: async () => sortPhotos(unwrap(await api.GET("/api/v1/listings/{id}/photos/", { params: { path: { id: listingId } } }))),
  });
  const list = photos.data ?? [];

  /** Rafraîchit la grille, la fiche (couverture, nombre de photos) et la liste des annonces. */
  const refreshAll = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: KEYS.photos(listingId) }),
      queryClient.invalidateQueries({ queryKey: KEYS.detail(listingId) }),
      queryClient.invalidateQueries({ queryKey: ["listings", "list"] }),
    ]);

  /* -------------------------------------------------------------- Envoi */

  const patchItem = (key: string, changes: Partial<UploadItem>) =>
    setQueue((items) => items.map((item) => (item.key === key ? { ...item, ...changes } : item)));

  const dropItem = (key: string) => {
    setQueue((items) => {
      const item = items.find((candidate) => candidate.key === key);
      if (item?.preview) {
        URL.revokeObjectURL(item.preview);
        previews.current.delete(item.preview);
      }
      return items.filter((candidate) => candidate.key !== key);
    });
  };

  /** Envoie une photo ; renvoie vrai si elle a été ajoutée. */
  const runUpload = async (item: UploadItem): Promise<boolean> => {
    if (!mounted.current || cancelled.current.has(item.key)) return false;
    patchItem(item.key, { status: "uploading", progress: 0, error: undefined });
    const handle = uploadPhoto(listingId, item.file, (ratio) => patchItem(item.key, { progress: ratio }));
    handles.current.set(item.key, handle);
    try {
      await handle.promise;
      if (!mounted.current) return true;
      dropItem(item.key);
      await refreshAll();
      return true;
    } catch (error) {
      if (!mounted.current || (error instanceof DOMException && error.name === "AbortError")) return false;
      patchItem(item.key, { status: "error", error: error instanceof Error ? error.message : "Envoi impossible. Réessayez." });
      return false;
    } finally {
      handles.current.delete(item.key);
    }
  };

  const enqueue = (item: UploadItem): Promise<boolean> => {
    const next = chain.current.then(() => runUpload(item));
    chain.current = next.catch(() => undefined);
    return next;
  };

  const addFiles = (files: FileList | File[] | null) => {
    if (!files || files.length === 0) return;
    const busy = queue.filter((item) => item.status === "queued" || item.status === "uploading").length;
    let slots = MAX_PHOTOS - list.length - busy;
    const items: UploadItem[] = Array.from(files).map((file) => {
      let error = checkPhotoFile(file);
      if (!error && slots <= 0) error = `Limite de ${MAX_PHOTOS} photos atteinte : supprimez une photo avant d'en ajouter.`;
      if (!error) slots -= 1;
      counter.current += 1;
      let preview: string | undefined;
      if (file.type.startsWith("image/")) {
        preview = URL.createObjectURL(file);
        previews.current.add(preview);
      }
      return { key: `envoi-${counter.current}`, file, preview, status: error ? "invalid" : "queued", progress: 0, error };
    });
    setQueue((current) => [...current, ...items]);

    const valid = items.filter((item) => item.status === "queued");
    if (valid.length === 0) return;
    void Promise.all(valid.map(enqueue)).then((results) => {
      const sent = results.filter(Boolean).length;
      if (sent > 0 && mounted.current) toast.success(sent === 1 ? "Photo ajoutée." : `${sent} photos ajoutées.`);
    });
  };

  const retry = (item: UploadItem) => {
    patchItem(item.key, { status: "queued", progress: 0, error: undefined });
    void enqueue(item).then((sent) => sent && mounted.current && toast.success("Photo ajoutée."));
  };

  const cancelItem = (item: UploadItem) => {
    cancelled.current.add(item.key);
    handles.current.get(item.key)?.abort();
    dropItem(item.key);
  };

  const onDrop = (event: DragEvent<HTMLElement>) => {
    event.preventDefault();
    setDragOver(false);
    addFiles(event.dataTransfer.files);
  };

  /* -------------------------------------------------------------- Ordre, texte, suppression */

  const reorder = useApiMutation({
    mutationFn: async ({ order, message }: { order: ListingPhoto[]; message: string }) => {
      const key = KEYS.photos(listingId);
      const previous = queryClient.getQueryData<ListingPhoto[]>(key);
      // Affichage immédiat du nouvel ordre ; restauré si l'API refuse.
      queryClient.setQueryData<ListingPhoto[]>(key, order.map((photo, index) => ({ ...photo, position: index })));
      try {
        await Promise.all(
          order.map(async (photo, index) =>
            photo.position === index
              ? photo
              : unwrap(await api.PATCH("/api/v1/listings/photos/{id}/", { params: { path: { id: photo.id } }, body: { position: index } })),
          ),
        );
      } catch (error) {
        queryClient.setQueryData(key, previous);
        throw error;
      }
      return message;
    },
    invalidate: [KEYS.photos(listingId), KEYS.detail(listingId), ["listings", "list"]],
    success: (message) => message,
  });

  const move = (index: number, delta: -1 | 1) => {
    const target = index + delta;
    if (target < 0 || target >= list.length) return;
    const order = [...list];
    [order[index], order[target]] = [order[target], order[index]];
    reorder.mutate({ order, message: target === 0 ? "Nouvelle photo de couverture enregistrée." : "Ordre des photos enregistré." });
  };

  const makeCover = (index: number) => {
    const order = [list[index], ...list.filter((_, position) => position !== index)];
    reorder.mutate({ order, message: "Nouvelle photo de couverture enregistrée." });
  };

  const remove = useApiMutation({
    mutationFn: async (photo: ListingPhoto) =>
      unwrap(await api.DELETE("/api/v1/listings/photos/{id}/", { params: { path: { id: photo.id } } })),
    invalidate: [KEYS.photos(listingId), KEYS.detail(listingId), ["listings", "list"]],
    success: "Photo supprimée.",
    onSuccess: () => setDeleting(null),
  });

  const total = list.length;
  const full = total >= MAX_PHOTOS;
  const deletingIndex = deleting ? list.findIndex((photo) => photo.id === deleting.id) : -1;

  return (
    <section id="photos" className="ax-card scroll-mt-24" aria-labelledby="annonce-photos">
      <div className="ax-card__header flex flex-wrap items-center justify-between gap-2">
        <div className="ax-card__titles">
          <h2 className="ax-card__title" id="annonce-photos">
            Photos
          </h2>
          <p className="ax-card__subtitle">La première photo sert de couverture sur le portail.</p>
        </div>
        <span
          className={cn("ax-badge ax-badge--soft", full ? "ax-badge--warning" : "ax-badge--neutral")}
          aria-label={`${total} photos sur ${MAX_PHOTOS} autorisées`}
        >
          <span className="ax-num">
            {total} / {MAX_PHOTOS}
          </span>
        </span>
      </div>

      <div className="ax-card__body flex flex-col gap-5">
        {canEdit && (
          <div className={cn("ax-dropzone", dragOver && "is-dragover")}>
            <label
              htmlFor={inputId}
              className={cn(
                "ax-dropzone__area has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-[var(--ax-accent)]",
                full && "pointer-events-none opacity-60",
              )}
              onDragOver={(event) => {
                event.preventDefault();
                if (!full) setDragOver(true);
              }}
              onDragLeave={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setDragOver(false);
              }}
              onDrop={full ? (event) => event.preventDefault() : onDrop}
            >
              <IconCloudUpload stroke={1.5} aria-hidden="true" />
              <span className="text-text-strong font-medium">
                {full ? (
                  `Limite de ${MAX_PHOTOS} photos atteinte`
                ) : (
                  <>
                    <span className="max-md:hidden">Glissez vos photos ici ou </span>
                    <span className="text-link underline">
                      <span className="max-md:hidden">choisissez des fichiers</span>
                      <span className="md:hidden">Choisir des photos</span>
                    </span>
                  </>
                )}
              </span>
              <span className="text-xs">JPEG, PNG ou WebP · 8 Mo maximum par photo · plusieurs fichiers possibles</span>
              <input
                id={inputId}
                type="file"
                multiple
                accept={ACCEPT_ATTRIBUTE}
                className="sr-only"
                disabled={full}
                onChange={(event) => {
                  addFiles(event.target.files);
                  event.target.value = "";
                }}
              />
            </label>

            {queue.length > 0 && (
              <ul className="ax-dropzone__list" aria-label="Photos en cours d'envoi">
                {queue.map((item) => (
                  <UploadRow key={item.key} item={item} onRetry={() => retry(item)} onRemove={() => cancelItem(item)} />
                ))}
              </ul>
            )}
          </div>
        )}

        {(reorder.formError ?? reorder.error?.message) && (
          <div className="ax-alert ax-alert--danger" role="alert">
            <div className="ax-alert__content">
              <p className="ax-alert__message">L&apos;ordre des photos n&apos;a pas pu être enregistré : {reorder.formError ?? reorder.error?.message}</p>
            </div>
          </div>
        )}

        {photos.error ? (
          <div className="ax-alert ax-alert--danger" role="alert">
            <div className="ax-alert__content">
              <p className="ax-alert__message">Photos indisponibles : {photos.error.message}</p>
            </div>
            <div className="ax-alert__actions">
              <button type="button" className="ax-btn ax-btn--sm ax-btn--ghost" onClick={() => photos.refetch()}>
                <span className="ax-btn__label">Réessayer</span>
              </button>
            </div>
          </div>
        ) : photos.isLoading ? (
          <ul className="m-0 grid list-none grid-cols-2 gap-3 p-0 lg:grid-cols-3" aria-busy="true" aria-label="Chargement des photos">
            {Array.from({ length: 3 }, (_, index) => (
              <li key={index} className="ax-skeleton aspect-[4/3] rounded-md" />
            ))}
          </ul>
        ) : total === 0 ? (
          <div className="bg-surface-subtle text-text-muted flex flex-col items-center gap-2 rounded-md px-4 py-8 text-center">
            <IconPhoto size={32} stroke={1.5} aria-hidden="true" className="text-text-subtle" />
            <p className="text-text-strong m-0 font-medium">Aucune photo pour l&apos;instant</p>
            <p className="m-0 max-w-md text-sm">
              Les annonces avec plusieurs photos lumineuses (façade, séjour, chambres, cuisine) reçoivent bien plus de demandes de visite.
            </p>
          </div>
        ) : (
          <ol className="m-0 grid list-none grid-cols-2 gap-3 p-0 lg:grid-cols-3" aria-busy={reorder.isPending}>
            {list.map((photo, index) => (
              <PhotoTile
                key={photo.id}
                photo={photo}
                index={index}
                total={total}
                canEdit={canEdit}
                busy={reorder.isPending}
                onMove={(delta) => move(index, delta)}
                onCover={() => makeCover(index)}
                onEdit={() => setEditing(photo)}
                onDelete={() => {
                  remove.reset();
                  remove.resetErrors();
                  setDeleting(photo);
                }}
              />
            ))}
          </ol>
        )}
      </div>

      {editing && <AltModal photo={editing} index={list.findIndex((photo) => photo.id === editing.id)} listingId={listingId} onClose={() => setEditing(null)} />}

      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={() => deleting && remove.mutate(deleting)}
        pending={remove.isPending}
        title="Supprimer cette photo ?"
        confirmLabel="Supprimer"
        danger
      >
        <p className="m-0">
          La photo sera définitivement supprimée de l&apos;annonce
          {listing.status === "PUBLISHED" ? " et du portail" : ""}.
          {deletingIndex === 0 && total > 1 && " La photo suivante deviendra la couverture."}
        </p>
        {(remove.formError ?? remove.error?.message) && <p className="text-danger mt-3 mb-0">{remove.formError ?? remove.error?.message}</p>}
      </ConfirmDialog>
    </section>
  );
}

function UploadRow({ item, onRetry, onRemove }: { item: UploadItem; onRetry: () => void; onRemove: () => void }) {
  const failed = item.status === "error" || item.status === "invalid";
  const percent = Math.round(item.progress * 100);
  return (
    <li className="ax-dropzone__file">
      <span className="bg-surface text-text-subtle relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-sm">
        {item.preview && item.status !== "invalid" ? (
          <Image src={item.preview} alt="" fill unoptimized className="object-cover" />
        ) : failed ? (
          <IconAlertTriangle size={20} stroke={1.75} aria-hidden="true" className="text-danger" />
        ) : (
          <IconPhoto size={20} stroke={1.5} aria-hidden="true" />
        )}
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="ax-dropzone__name text-text-strong" title={item.file.name}>
          {item.file.name}
        </span>
        <span className={cn("text-xs", failed ? "text-danger" : "text-text-muted")} role={failed ? "alert" : undefined}>
          {formatFileSize(item.file.size)} · {item.error ?? STATUS_TEXT[item.status]}
          {item.status === "uploading" && ` · ${percent} %`}
        </span>
        {(item.status === "uploading" || item.status === "queued") && (
          <div className="ax-progress ax-progress--xs">
            <div
              className={cn("ax-progress__track", item.status === "queued" && "opacity-50")}
              role="progressbar"
              aria-label={`Envoi de ${item.file.name}`}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={percent}
            >
              <div className="ax-progress__fill" style={{ width: `${percent}%` }} />
            </div>
          </div>
        )}
      </div>
      <div className="flex shrink-0 gap-1">
        {item.status === "error" && (
          <button type="button" className="ax-btn ax-btn--ghost ax-btn--icon ax-btn--sm" onClick={onRetry} aria-label={`Renvoyer ${item.file.name}`}>
            <IconRefresh className="ax-btn__icon" stroke={1.75} aria-hidden="true" />
          </button>
        )}
        <button
          type="button"
          className="ax-btn ax-btn--ghost ax-btn--icon ax-btn--sm"
          onClick={onRemove}
          aria-label={item.status === "uploading" || item.status === "queued" ? `Annuler l'envoi de ${item.file.name}` : `Retirer ${item.file.name} de la liste`}
        >
          <IconX className="ax-btn__icon" stroke={1.75} aria-hidden="true" />
        </button>
      </div>
    </li>
  );
}

function PhotoTile({
  photo,
  index,
  total,
  canEdit,
  busy,
  onMove,
  onCover,
  onEdit,
  onDelete,
}: {
  photo: ListingPhoto;
  index: number;
  total: number;
  canEdit: boolean;
  busy: boolean;
  onMove: (delta: -1 | 1) => void;
  onCover: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const number = index + 1;
  const iconButton = "ax-btn ax-btn--ghost ax-btn--icon ax-btn--sm";
  return (
    <li className="border-border-default bg-surface flex flex-col overflow-hidden rounded-md border">
      <div className="bg-surface-subtle relative aspect-[4/3]">
        {photo.url ? (
          <Image src={photo.url} alt={photo.alt || `Photo ${number}`} fill sizes="(min-width: 1024px) 240px, 50vw" className="object-cover" />
        ) : (
          <span className="text-text-subtle flex h-full items-center justify-center">
            <IconPhoto size={28} stroke={1.5} aria-hidden="true" />
          </span>
        )}
        <span className="absolute top-2 left-2 flex gap-1">
          {index === 0 ? (
            <span className="ax-badge ax-badge--solid ax-badge--accent">Couverture</span>
          ) : (
            <span className="ax-badge ax-badge--solid ax-badge--neutral ax-num" aria-hidden="true">
              {number}
            </span>
          )}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-2.5">
        <p className={cn("m-0 line-clamp-2 text-xs", photo.alt ? "text-text" : "text-text-subtle italic")}>
          <span className="sr-only">Photo {number} : </span>
          {photo.alt || "Sans description"}
        </p>
        {canEdit && (
          <div className="mt-auto flex flex-wrap items-center gap-0.5">
            <button type="button" className={iconButton} onClick={() => onMove(-1)} disabled={busy || index === 0} aria-label={`Placer la photo ${number} avant`}>
              <IconArrowLeft className="ax-btn__icon" stroke={1.75} aria-hidden="true" />
            </button>
            <button
              type="button"
              className={iconButton}
              onClick={() => onMove(1)}
              disabled={busy || index === total - 1}
              aria-label={`Placer la photo ${number} après`}
            >
              <IconArrowRight className="ax-btn__icon" stroke={1.75} aria-hidden="true" />
            </button>
            {index > 0 && (
              <button type="button" className={iconButton} onClick={onCover} disabled={busy} aria-label={`Définir la photo ${number} comme couverture`} title="Définir comme couverture">
                <IconStar className="ax-btn__icon" stroke={1.75} aria-hidden="true" />
              </button>
            )}
            <button type="button" className={iconButton} onClick={onEdit} aria-label={`Modifier la description de la photo ${number}`} title="Texte alternatif">
              <IconPencil className="ax-btn__icon" stroke={1.75} aria-hidden="true" />
            </button>
            <button type="button" className={cn(iconButton, "ml-auto")} onClick={onDelete} aria-label={`Supprimer la photo ${number}`}>
              <IconTrash className="ax-btn__icon" stroke={1.75} aria-hidden="true" />
            </button>
          </div>
        )}
      </div>
    </li>
  );
}

function AltModal({ photo, index, listingId, onClose }: { photo: ListingPhoto; index: number; listingId: number; onClose: () => void }) {
  const [alt, setAlt] = useState(photo.alt ?? "");
  const save = useApiMutation({
    mutationFn: async (value: string) =>
      unwrap(await api.PATCH("/api/v1/listings/photos/{id}/", { params: { path: { id: photo.id } }, body: { alt: value } })),
    invalidate: [KEYS.photos(listingId)],
    success: "Description de la photo enregistrée.",
    onSuccess: onClose,
  });

  return (
    <FormModal
      open
      onClose={onClose}
      title={`Décrire la photo ${index + 1}`}
      onSubmit={() => save.mutate(alt.trim())}
      pending={save.isPending}
      error={save.formError}
    >
      {photo.url && (
        <div className="bg-surface-subtle relative aspect-[4/3] w-full overflow-hidden rounded-md">
          <Image src={photo.url} alt="" fill sizes="(min-width: 640px) 480px, 90vw" className="object-cover" />
        </div>
      )}
      <TextField
        label="Texte alternatif"
        maxLength={200}
        placeholder="Ex. Séjour lumineux ouvert sur la terrasse"
        value={alt}
        onChange={(event) => setAlt(event.target.value)}
        error={save.fieldErrors.alt}
        hint="Décrit la photo pour les personnes malvoyantes et les moteurs de recherche. 200 caractères maximum."
      />
    </FormModal>
  );
}
