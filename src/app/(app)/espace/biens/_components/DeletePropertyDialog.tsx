"use client";

import { useQueryClient, type Query } from "@tanstack/react-query";

import { ConfirmDialog } from "@/components/app/ui/Modal";
import { api } from "@/lib/api/client";
import { useApiMutation } from "@/lib/api/useApiMutation";
import { formatNumber } from "@/lib/format";

import { BUILDINGS_KEY, PROPERTIES_KEY, removeWithLeaseGuard, UNITS_KEY, type Property } from "./data";

/** Confirmation de suppression d'un bien : bâtiments, lots et données liées partent avec lui. */
export function DeletePropertyDialog({
  property,
  onClose,
  onDeleted,
}: {
  property: Property | null;
  onClose: () => void;
  onDeleted?: () => void;
}) {
  const queryClient = useQueryClient();
  const remove = useApiMutation({
    mutationFn: (target: Property) =>
      removeWithLeaseGuard(
        () => api.DELETE("/api/v1/properties/properties/{id}/", { params: { path: { id: target.id } } }),
        "Ce bien ne peut pas être supprimé : des baux sont enregistrés sur certains de ses lots. Les baux doivent être conservés pour l'historique.",
      ),
    success: "Bien supprimé.",
    onSuccess: () => {
      const deletedId = property?.id;
      onClose();
      onDeleted?.();
      // Les requêtes du bien supprimé (fiche, bâtiments, lots) ne sont pas relancées : elles répondraient 404
      // pendant la redirection. Tout le reste (listes, sélecteurs de lots des autres modules) est rafraîchi.
      const concernsDeleted = (query: Query) =>
        (query.queryKey[1] === "detail" || query.queryKey[1] === "property") && query.queryKey[2] === deletedId;
      for (const queryKey of [PROPERTIES_KEY, BUILDINGS_KEY, UNITS_KEY]) {
        void queryClient.invalidateQueries({ queryKey, predicate: (query) => !concernsDeleted(query) });
      }
    },
  });

  const close = () => {
    remove.resetErrors();
    onClose();
  };

  return (
    <ConfirmDialog
      open={Boolean(property)}
      onClose={close}
      onConfirm={() => property && remove.mutate(property)}
      pending={remove.isPending}
      title="Supprimer ce bien ?"
      confirmLabel="Supprimer le bien"
      danger
    >
      <p className="m-0">
        <strong className="text-text-strong">{property?.name}</strong> sera supprimé définitivement, avec{" "}
        {property && property.buildings_count > 0 ? (
          <>
            ses {formatNumber(property.buildings_count)} bâtiment{property.buildings_count > 1 ? "s" : ""} et ses{" "}
            {formatNumber(property.units_count)} lot{property.units_count > 1 ? "s" : ""}
          </>
        ) : (
          "ses bâtiments et ses lots"
        )}
        , ainsi que les annonces et les tickets de maintenance liés.
      </p>
      <p className="text-text-muted mt-2 mb-0 text-sm">Un bien dont des lots ont des baux ne peut pas être supprimé.</p>
      {remove.formError && (
        <p className="text-danger mt-3 mb-0" role="alert">
          {remove.formError}
        </p>
      )}
    </ConfirmDialog>
  );
}
