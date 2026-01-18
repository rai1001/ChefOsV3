import { createSupabaseServerClient } from "@/lib/supabase/server";
import { AppError } from "@/modules/shared/domain/errors";

export type EventListItem = {
  id: string;
  title: string;
  status: string;
  startsAt: string;
  endsAt: string;
  hotelName?: string | null;
};

export const listOrgEvents = async (orgId: string): Promise<EventListItem[]> => {
  const supabase = createSupabaseServerClient();
  // Supabase types are not refreshed for events yet; cast for query.
  const response = await (supabase as any)
    .from("events")
    .select("id,title,status,starts_at,ends_at,hotels(name)")
    .eq("org_id", orgId)
    .order("starts_at", { ascending: true });

  if (response.error) {
    throw new AppError("UnknownError", "No se pudieron cargar los eventos", {
      code: response.error.code
    });
  }

  return (
    (response.data as any[] | null)?.map((row) => ({
      id: row.id,
      title: row.title,
      status: row.status,
      startsAt: row.starts_at,
      endsAt: row.ends_at,
      hotelName: row.hotels?.name ?? null
    })) ?? []
  );
};
