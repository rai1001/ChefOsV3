/* istanbul ignore file */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/types";

type Props = {
  orgId: string;
};

export const HotelCreateForm = ({ orgId }: Props) => {
  const supabase = createBrowserClient<Database>();
  const router = useRouter();
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    const { error: insertError } = await supabase.from("hotels").insert({
      org_id: orgId,
      name: name.trim()
    });

    setLoading(false);

    if (insertError) {
      setError(insertError.message);
      return;
    }

    setName("");
    setSuccess("Hotel creado");
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-900">Nuevo hotel</p>
          <p className="text-xs text-slate-500">Solo admins pueden crear hoteles.</p>
        </div>
        <button
          type="submit"
          disabled={!name.trim() || loading}
          className="rounded-lg bg-brand-600 px-3 py-1 text-xs font-semibold text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {loading ? "Guardando..." : "Crear"}
        </button>
      </div>
      <label className="mt-3 block text-sm text-slate-700">
        Nombre del hotel
        <input
          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Hotel Centro"
          required
        />
      </label>
      {error && <p className="mt-2 text-xs text-red-600">Error: {error}</p>}
      {success && <p className="mt-2 text-xs text-emerald-700">{success}</p>}
    </form>
  );
};
