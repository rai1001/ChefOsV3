"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export const SignOutButton = () => {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSignOut = () => {
    startTransition(async () => {
      const supabase = createSupabaseBrowserClient();
      await supabase.auth.signOut();
      router.replace("/login");
    });
  };

  return (
    <button
      type="button"
      onClick={handleSignOut}
      className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-800 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
      disabled={isPending}
    >
      {isPending ? "Cerrando..." : "Salir"}
    </button>
  );
};
