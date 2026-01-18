import { createSupabaseServerClient } from "@/lib/supabase/server";
import { AppError } from "@/modules/shared/domain/errors";

export type DashboardHighlights = {
  upcomingEvents: number;
  openOrders: number;
};

export type DashboardGridItem = {
  eventId: string;
  eventTitle: string;
  hotelName: string | null;
  startsAt: string;
  endsAt: string;
  purchaseOrderId: string | null;
  purchaseStatus: string | null;
};

export const getDashboardHighlights = async (
  orgId: string
): Promise<DashboardHighlights> => {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.rpc("dashboard_event_highlights", {
    p_org: orgId
  });

  if (error) {
    throw new AppError("UnknownError", "No se pudieron cargar los KPIs", {
      code: error.code
    });
  }

  if (!data || data.length === 0) {
    return { upcomingEvents: 0, openOrders: 0 };
  }

  const row = data[0] as any;
  return {
    upcomingEvents: Number(row.upcoming_events ?? 0),
    openOrders: Number(row.open_orders ?? 0)
  };
};

export const getDashboardGrid = async (
  orgId: string
): Promise<DashboardGridItem[]> => {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.rpc("dashboard_rolling_grid", {
    p_org: orgId
  });

  if (error) {
    throw new AppError("UnknownError", "No se pudo cargar el grid", {
      code: error.code
    });
  }

  return (
    data?.map((row: any) => ({
      eventId: row.event_id,
      eventTitle: row.event_title,
      hotelName: row.hotel_name,
      startsAt: row.starts_at,
      endsAt: row.ends_at,
      purchaseOrderId: row.purchase_order_id,
      purchaseStatus: row.purchase_status
    })) ?? []
  );
};
