import { requireUserContext } from "@/modules/shared/data/server-context";
import { AppShell } from "@/modules/shared/ui/app-shell";
import { PageHeader } from "@/modules/shared/ui/page-header";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { OrderCreateForm } from "@/modules/purchasing/ui/order-create-form";
import { getOrgHotels } from "@/modules/orgs/data/orgs.server";

type PurchaseOrderRow = {
  id: string;
  status: string | null;
  total_estimated: string | null;
  suppliers: { name: string | null } | null;
  hotels: { name: string | null } | null;
};

const fetchPurchaseOrders = async (orgId: string): Promise<PurchaseOrderRow[]> => {
  const supabase = createSupabaseServerClient();
  const response = await supabase
    .from("purchase_orders")
    .select("id,status,total_estimated,suppliers(name),hotels(name)")
    .eq("org_id", orgId)
    .order("id", { ascending: true });

  if (response.error) {
    console.error("Error loading purchase orders", response.error);
    return [];
  }

  const rows = (response.data ?? []) as any[];

  return rows.map((row) => ({
    id: row.id as string,
    status: row.status as string | null,
    total_estimated: row.total_estimated as string | null,
    suppliers: Array.isArray(row.suppliers)
      ? (row.suppliers[0] as { name: string | null } | undefined) ?? null
      : ((row.suppliers as { name: string | null } | null) ?? null),
    hotels: Array.isArray(row.hotels)
      ? (row.hotels[0] as { name: string | null } | undefined) ?? null
      : ((row.hotels as { name: string | null } | null) ?? null)
  }));
};

const formatStatus = (status: string | null) => {
  if (!status) return "Sin estado";
  const map: Record<string, string> = {
    draft: "Borrador",
    approved: "Aprobado",
    ordered: "Pedido",
    received: "Recibido"
  };
  return map[status] ?? status;
};

const OrdersPage = async () => {
  const { user, membership } = await requireUserContext();
  const orders = await fetchPurchaseOrders(membership.orgId);
  const hotels = await getOrgHotels(membership.orgId);

  return (
    <AppShell userEmail={user.email ?? ""} orgName={membership.orgName}>
      <PageHeader
        title="Pedidos"
        subtitle="Compras y órdenes por hotel"
        actions={
          <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-800 ring-1 ring-brand-100">
            {orders.length} pedidos
          </span>
        }
      />
      <div className="mb-4">
        <OrderCreateForm orgId={membership.orgId} hotels={hotels} />
      </div>
      <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
        {orders.length === 0 ? (
          <p className="text-sm text-slate-700">
            No hay pedidos creados todavía. Usa el seed o crea uno nuevo desde el backend.
          </p>
        ) : (
          <div className="overflow-hidden rounded-xl border border-slate-100">
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">ID</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">
                    Proveedor
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Hotel</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Estado</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">
                    Total estimado
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td className="px-4 py-3 text-sm text-slate-800">
                      <span className="rounded-lg bg-slate-50 px-2 py-1 text-xs font-mono text-slate-600">
                        {order.id.slice(0, 8)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-800">
                      {order.suppliers?.name ?? "Sin proveedor"}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-800">{order.hotels?.name ?? "Sin hotel"}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                        {formatStatus(order.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-800">
                      {order.total_estimated ? `${Number(order.total_estimated).toFixed(2)} €` : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppShell>
  );
};

export default OrdersPage;
