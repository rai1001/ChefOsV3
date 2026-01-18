import { createBrowserClient as createSsrBrowserClient } from "@supabase/ssr";
import { loadClientEnv } from "../env";
import type { Database } from "./types";

const env = loadClientEnv();

const createClient = () =>
  createSsrBrowserClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

export const createSupabaseBrowserClient = () => createClient();

// Backwards-compatible alias for UI modules.
export const createBrowserClient = () => createClient();
