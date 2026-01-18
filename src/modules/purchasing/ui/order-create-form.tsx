/* istanbul ignore file */
"use client";

import { useState } from "react";
import { createBrowserClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

type HotelOption = {
  id: string;
  name: string;
};

type Props = {
  orgId: string;
  hotels: HotelOption[];
};

type PurchaseStatus = "draft" | "approved" | "ordered" | "received";

export const OrderCreateForm = ({ orgId, hotels }: Props) => {
  const supabase = createBrowserClient();
  const router = useRouter();
  const [hotelId, setHotelId] = useState("");
  const [status, setStatus] = useState<PurchaseStatus>("draft");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hotelId) return;

    setLoading(true);
    setError(null);
    const { error: insertError } = await supabase.from("purchase_orders").insert({
      org_id: orgId,
      hotel_id: hotelId,
      status,
      total_estimated: null
    });
    setLoading(false);

    if (insertError) {
      setError(insertError.message);
      return;
    }

    setHotelId("");
    setStatus("draft");
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-900">Crear pedido</p>
          <p className="text-xs text-slate-500">Inserta un pedido en tu organizacion</p>
        </div>
        <button
          type="submit"
          disabled={!hotelId || loading}
          className="rounded-lg bg-brand-600 px-3 py-1 text-xs font-semibold text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {loading ? "Creando..." : "Crear"}
        </button>
      </div>
      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <label className="text-sm text-slate-700">
          Hotel
          <select
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            value={hotelId}
            onChange={(e) => setHotelId(e.target.value)}
            required
          >
            <option value="">Selecciona hotel</option>
            {hotels.map((h) => (
              <option key={h.id} value={h.id}>
                {h.name}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm text-slate-700">
          Estado
          <select
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            value={status}
            onChange={(e) => setStatus(e.target.value as PurchaseStatus)}
          >
            <option value="draft">Borrador</option>
            <option value="approved">Aprobado</option>
            <option value="ordered">Pedido</option>
            <option value="received">Recibido</option>
          </select>
        </label>
      </div>
      {error && <p className="mt-2 text-xs text-red-600">Error: {error}</p>}
      {hotels.length === 0 && (
        <p className="mt-2 text-xs text-amber-700">
          No hay hoteles en tu organizacion. Añade uno para poder crear pedidos.
        </p>
      )}
    </form>
  );
};
