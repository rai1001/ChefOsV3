import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { loadClientEnv, loadServiceRoleEnv } from "../env";
import type { Database } from "./types";
import { createClient } from "@supabase/supabase-js";

const getCookieAdapter = () => {
  const cookieStore = cookies();
  return {
    get: (name: string) => cookieStore.get(name)?.value,
    set: (
      name: string,
      value: string,
      options: Parameters<typeof cookieStore.set>[1]
    ) => {
      cookieStore.set({ name, value, ...options });
    },
    remove: (name: string, options: Parameters<typeof cookieStore.delete>[1]) =>
      cookieStore.delete({ name, ...options })
  };
};

export const createSupabaseServerClient = () => {
  const env = loadClientEnv();
  return createServerClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: getCookieAdapter()
    }
  );
};

export const createServiceRoleClient = () => {
  const env = { ...loadClientEnv(), ...loadServiceRoleEnv() };
  return createClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    }
  );
};
