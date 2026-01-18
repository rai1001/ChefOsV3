import { createSupabaseServerClient } from "@/lib/supabase/server";
import { AppError } from "@/modules/shared/domain/errors";

type Membership = {
  orgId: string;
  role: string;
  orgName?: string;
  orgSlug?: string;
};

export const getActiveMembership = async (
  userId: string
): Promise<Membership | null> => {
  const supabase = createSupabaseServerClient();
  const response = await supabase
    .from("org_members")
    .select("org_id, role, is_active, orgs(name, slug)")
    .eq("user_id", userId)
    .eq("is_active", true)
    .limit(1)
    .maybeSingle();

  if (response.error) {
    throw new AppError("UnknownError", "No se pudo cargar la membresía", {
      code: response.error.code
    });
  }

  if (!response.data) return null;

  return {
    orgId: response.data.org_id,
    role: response.data.role,
    orgName: response.data.orgs?.name ?? undefined,
    orgSlug: response.data.orgs?.slug ?? undefined
  };
};

export const getOrgHotels = async (orgId: string) => {
  const supabase = createSupabaseServerClient();
  const response = await supabase
    .from("hotels")
    .select("id, name")
    .eq("org_id", orgId);

  if (response.error) {
    throw new AppError("UnknownError", "No se pudieron cargar los hoteles", {
      code: response.error.code
    });
  }

  return response.data ?? [];
};
