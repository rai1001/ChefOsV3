import { AppShell } from "@/modules/shared/ui/app-shell";
import { PageHeader } from "@/modules/shared/ui/page-header";
import { requireUserContext } from "@/modules/shared/data/server-context";
import { getOrgHotels } from "@/modules/orgs/data/orgs.server";
import {
  getDashboardGrid,
  getDashboardHighlights
} from "@/modules/dashboard/data/dashboard.server";
import { formatEventTime } from "@/lib/date-format";

const DashboardPage = async () => {
  const { user, membership } = await requireUserContext();

  const hotels = await getOrgHotels(membership.orgId);
  const highlights = await getDashboardHighlights(membership.orgId);
  const grid = await getDashboardGrid(membership.orgId);

  return (
    <AppShell userEmail={user.email ?? ""} orgName={membership.orgName}>
      <PageHeader
        title="Dashboard"
        subtitle="Estado general de tu operaci¢n"
        actions={
          <div className="rounded-lg border border-emerald-300/30 bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-100">
            Rol: {membership.role}
          </div>
        }
      />
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-slate-900 p-4 shadow-sm">
          <p className="text-sm text-slate-300">Organizaci¢n</p>
          <p className="mt-2 text-lg font-semibold text-white">
            {membership.orgName ?? "Org sin nombre"}
          </p>
          <p className="text-xs text-slate-500">
            slug: {membership.orgSlug ?? membership.orgId}
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-slate-900 p-4 shadow-sm">
          <p className="text-sm text-slate-300">Hoteles activos</p>
          <p className="mt-2 text-3xl font-bold text-white">
            {hotels.length}
          </p>
          <p className="text-xs text-slate-500">Datos directos desde Supabase</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-slate-900 p-4 shadow-sm">
          <p className="text-sm text-slate-300">KPIs r pidos</p>
          <div className="mt-2 space-y-2 text-sm text-slate-200">
            <p>
              Eventos pr¢ximos:{" "}
              <span className="font-semibold text-white">{highlights.upcomingEvents}</span>
            </p>
            <p>
              Pedidos abiertos:{" "}
              <span className="font-semibold text-white">{highlights.openOrders}</span>
            </p>
          </div>
        </div>
      </div>
      <div className="mt-6 rounded-2xl border border-white/10 bg-slate-900 p-4 shadow-sm">
        <h2 className="text-lg font-semibold text-white">Hoteles</h2>
        {hotels.length === 0 ? (
          <p className="mt-2 text-sm text-slate-300">
            No hay hoteles registrados todav¡a.
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-white/5">
            {hotels.map((hotel) => (
              <li
                key={hotel.id}
                className="flex items-center justify-between py-2 text-sm text-slate-200"
              >
                <span>{hotel.name}</span>
                <span className="rounded-full bg-white/5 px-2 py-1 text-xs text-slate-100">
                  {membership.orgSlug ?? "org"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="mt-6 rounded-2xl border border-white/10 bg-slate-900 p-4 shadow-sm">
        <h2 className="text-lg font-semibold text-white">Timeline pr¢ximo</h2>
        {grid.length === 0 ? (
          <p className="mt-2 text-sm text-slate-300">
            No hay eventos pr¢ximos en las pr¢ximas 2 semanas.
          </p>
        ) : (
          <div className="overflow-hidden rounded-xl border border-white/10">
            <table className="min-w-full divide-y divide-white/5">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-200">
                    Evento
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-200">
                    Hotel
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-200">
                    Horario
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-200">
                    Pedido
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 bg-slate-950/40">
                {grid.map((item) => (
                  <tr key={item.eventId}>
                    <td className="px-4 py-3 text-sm text-slate-100">
                      {item.eventTitle}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-200">
                      {item.hotelName ?? "Sin hotel"}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-200">
                      {formatEventTime(item.startsAt, item.endsAt)}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {item.purchaseOrderId ? (
                        <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-slate-100">
                          {item.purchaseStatus ?? "N/D"}
                        </span>
                      ) : (
                        <span className="text-slate-400">Sin pedido</span>
                      )}
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

export default DashboardPage;
