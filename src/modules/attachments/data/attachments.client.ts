import { createBrowserClient } from "@/lib/supabase/client";
import type { Attachment } from "../domain/types";

const BUCKET_ID = "attachments";

const mapRow = (row: any): Attachment => ({
  id: row.id,
  orgId: row.org_id,
  eventId: row.event_id ?? undefined,
  path: row.path,
  mimeType: row.mime_type,
  sizeBytes: row.size_bytes,
  createdAt: row.created_at
});

export const listAttachments = async (orgId: string, eventId?: string) => {
  // Supabase types are not refreshed for attachments yet; cast for access.
  const supabase = createBrowserClient() as any;
  let query = supabase
    .from("event_attachments")
    .select("*")
    .eq("org_id", orgId);

  if (eventId) {
    query = query.eq("event_id", eventId);
  }

  const { data, error } = await query.order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapRow);
};

export const uploadAttachment = async ({
  orgId,
  eventId,
  file
}: {
  orgId: string;
  eventId?: string;
  file: File;
}) => {
  // Supabase types are not refreshed for attachments yet; cast for access.
  const supabase = createBrowserClient() as any;
  const path = `${orgId}/${crypto.randomUUID()}-${file.name}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET_ID)
    .upload(path, file, {
      cacheControl: "3600",
      upsert: false
    });

  if (uploadError) throw uploadError;

  const { error: insertError } = await supabase.from("event_attachments").insert({
    org_id: orgId,
    event_id: eventId ?? null,
    path,
    mime_type: file.type || "application/octet-stream",
    size_bytes: file.size
  });

  if (insertError) throw insertError;

  return path;
};

export const deleteAttachment = async (id: string, path: string) => {
  // Supabase types are not refreshed for attachments yet; cast for access.
  const supabase = createBrowserClient() as any;

  const { error: deleteStorageError } = await supabase.storage
    .from(BUCKET_ID)
    .remove([path]);

  if (deleteStorageError) throw deleteStorageError;

  const { error: deleteRowError } = await supabase
    .from("event_attachments")
    .delete()
    .eq("id", id);

  if (deleteRowError) throw deleteRowError;
};
