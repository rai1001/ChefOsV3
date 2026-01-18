import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { loadClientEnv, loadServiceRoleEnv } from "../env";
import type { Database } from "./types";
import { createClient } from "@supabase/supabase-js";

type CookieStore = Awaited<ReturnType<typeof cookies>>;

const getCookieAdapter = () => {
  // Next.js types expose cookies() as Promise en algunas superficies; lo
  // forzamos a CookieStore (runtime es sincronico) para que el adapter sea simple.
  const cookieStore = cookies() as unknown as CookieStore;

  return {
    get: (name: string) => cookieStore.get(name)?.value,
    set: (name: string, value: string, options?: any) => {
      const setOptions = options ?? {};
      cookieStore.set({ name, value, ...setOptions });
    },
    remove: (name: string, options?: any) => {
      const deleteOptions = options ?? {};
      cookieStore.delete({ name, ...deleteOptions });
    }
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
