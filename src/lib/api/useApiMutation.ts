"use client";

import { useMutation, useQueryClient, type QueryKey } from "@tanstack/react-query";
import { useState } from "react";

import { useToast } from "@/components/app/ui/Toast";

import { ApiError, type FieldErrors } from "./errors";

/** Clés d'erreur de l'API qui ne correspondent jamais à un champ de formulaire. */
const GLOBAL_FIELDS = ["status", "non_field_errors"];

/**
 * Mutation de l'espace agence : erreurs par champ pour le formulaire, message général sinon,
 * notification de succès et rafraîchissement des listes concernées.
 *
 *   const save = useApiMutation({
 *     mutationFn: async (body) => unwrap(await api.POST("/api/v1/leases/tenants/", { body })),
 *     invalidate: [["tenants"]],
 *     success: "Locataire enregistré.",
 *     onSuccess: () => setOpen(false),
 *   });
 *   <TextField error={save.fieldErrors.phone} … />   <FormModal error={save.formError} … />
 */
export function useApiMutation<TVariables, TResult>({
  mutationFn,
  invalidate = [],
  success,
  onSuccess,
  displayedFields,
}: {
  mutationFn: (variables: TVariables) => Promise<TResult>;
  invalidate?: QueryKey[];
  success?: string | ((result: TResult) => string);
  onSuccess?: (result: TResult) => void;
  /** Champs affichés par le formulaire : une erreur sur un autre champ devient le message général. */
  displayedFields?: string[];
}) {
  const queryClient = useQueryClient();
  const toast = useToast();
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string>();

  const mutation = useMutation({
    mutationFn,
    onMutate: () => {
      setFieldErrors({});
      setFormError(undefined);
    },
    onSuccess: async (result) => {
      await Promise.all(invalidate.map((queryKey) => queryClient.invalidateQueries({ queryKey })));
      if (success) toast.success(typeof success === "function" ? success(result) : success);
      onSuccess?.(result);
    },
    onError: (error) => {
      if (error instanceof ApiError) {
        setFieldErrors(error.fields);
        // Message général quand l'erreur n'est rattachée à aucun champ affiché par le formulaire
        // (ex. {"status": "Action impossible…"} lors d'une publication refusée).
        const hidden = Object.entries(error.fields).find(([field]) => displayedFields && !displayedFields.includes(field));
        const unattached = !Object.keys(error.fields).length || error.status !== 400 || GLOBAL_FIELDS.some((field) => field in error.fields);
        if (hidden) setFormError(hidden[1]);
        else if (unattached) setFormError(error.message);
      } else {
        setFormError("Une erreur est survenue. Vérifiez votre connexion et réessayez.");
      }
    },
  });

  return {
    ...mutation,
    fieldErrors,
    formError,
    resetErrors: () => {
      setFieldErrors({});
      setFormError(undefined);
    },
  };
}
