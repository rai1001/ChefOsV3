import { createBrowserClient } from "@supabase/ssr";
import { loadClientEnv } from "../env";
import type { Database } from "./types";

const env = loadClientEnv();

export const createSupabaseBrowserClient = () =>
  createBrowserClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
