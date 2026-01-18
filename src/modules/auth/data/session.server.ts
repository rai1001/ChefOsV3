import { createSupabaseServerClient } from "@/lib/supabase/server";

export const getServerSession = async () => {
  const supabase = createSupabaseServerClient();
  const {
    data: { session }
  } = await supabase.auth.getSession();
  return session ?? null;
};

export const getServerUser = async () => {
  const supabase = createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  return user ?? null;
};
