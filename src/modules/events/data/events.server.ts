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
  const response = await supabase
    .from("events")
    .select("id,title,status,starts_at,ends_at,hotels(name)")
    .eq("org_id", orgId)
    .order("starts_at", { ascending: true })
    .returns<
      {
        id: string;
        title: string;
        status: string;
        starts_at: string;
        ends_at: string;
        hotels: { name: string } | null;
      }[]
    >();

  if (response.error) {
    throw new AppError("UnknownError", "No se pudieron cargar los eventos", {
      code: response.error.code
    });
  }

  return (
    response.data?.map((row) => ({
      id: row.id,
      title: row.title,
      status: row.status,
      startsAt: row.starts_at,
      endsAt: row.ends_at,
      hotelName: row.hotels?.name ?? null
    })) ?? []
  );
};
