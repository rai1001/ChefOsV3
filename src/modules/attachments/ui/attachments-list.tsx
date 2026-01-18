"use client";
/* istanbul ignore file */
/* UI mínima para listar y subir adjuntos por org/evento */
import { useState } from "react";
import type { Attachment } from "../domain/types";
import {
  deleteAttachment,
  listAttachments,
  uploadAttachment
} from "../data/attachments.client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

type Props = {
  orgId: string;
  eventId?: string;
};

export const AttachmentsList = ({ orgId, eventId }: Props) => {
  const queryClient = useQueryClient();
  const [file, setFile] = useState<File | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["attachments", orgId, eventId],
    queryFn: () => listAttachments(orgId, eventId)
  });

  const upload = useMutation({
    mutationFn: async () => {
      if (!file) throw new Error("Selecciona un archivo");
      await uploadAttachment({ orgId, eventId, file });
    },
    onSuccess: () => {
      setFile(null);
      queryClient.invalidateQueries({ queryKey: ["attachments", orgId, eventId] });
    }
  });

  const remove = useMutation({
    mutationFn: async (payload: { id: string; path: string }) =>
      deleteAttachment(payload.id, payload.path),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attachments", orgId, eventId] });
    }
  });

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-900">Adjuntos</p>
          <p className="text-xs text-slate-500">
            Archivos guardados en Supabase Storage (bucket privado)
          </p>
        </div>
        <label className="cursor-pointer rounded-lg bg-brand-600 px-3 py-1 text-xs font-semibold text-white hover:bg-brand-700">
          {upload.isPending ? "Subiendo..." : "Subir"}
          <input
            type="file"
            className="hidden"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </label>
        <button
          type="button"
          onClick={() => upload.mutate()}
          className="rounded-lg bg-slate-900 px-3 py-1 text-xs font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
          disabled={!file || upload.isPending}
        >
          {upload.isPending ? "Guardando..." : "Guardar"}
        </button>
      </div>
      {error && <p className="mt-2 text-xs text-red-600">Error: {String(error)}</p>}
      {isLoading ? (
        <p className="mt-4 text-sm text-slate-600">Cargando adjuntos...</p>
      ) : data && data.length > 0 ? (
        <ul className="mt-3 divide-y divide-slate-100">
          {data.map((att: Attachment) => (
            <li key={att.id} className="flex items-center justify-between py-2 text-sm">
              <div>
                <p className="font-mono text-xs text-slate-700">{att.path}</p>
                <p className="text-xs text-slate-500">
                  {att.mimeType} · {(att.sizeBytes / 1024).toFixed(1)} KB
                </p>
              </div>
              <button
                className="text-xs font-semibold text-red-600 hover:text-red-700"
                onClick={() => remove.mutate({ id: att.id, path: att.path })}
                disabled={remove.isPending}
              >
                Borrar
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-sm text-slate-600">Aún no hay archivos.</p>
      )}
    </div>
  );
};
