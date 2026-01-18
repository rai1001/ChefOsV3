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
        subtitle="Estado general de tu operación"
        actions={
          <div className="rounded-lg bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-800 ring-1 ring-brand-100">
            Rol: {membership.role}
          </div>
        }
      />
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-600">Organización</p>
          <p className="mt-2 text-lg font-semibold text-slate-900">
            {membership.orgName ?? "Org sin nombre"}
          </p>
          <p className="text-xs text-slate-500">
            slug: {membership.orgSlug ?? membership.orgId}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-600">Hoteles activos</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            {hotels.length}
          </p>
          <p className="text-xs text-slate-500">Datos directos desde Supabase</p>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-600">KPIs rápidos</p>
          <div className="mt-2 space-y-2 text-sm text-slate-800">
            <p>
              Eventos próximos:{" "}
              <span className="font-semibold">{highlights.upcomingEvents}</span>
            </p>
            <p>
              Pedidos abiertos:{" "}
              <span className="font-semibold">{highlights.openOrders}</span>
            </p>
          </div>
        </div>
      </div>
      <div className="mt-6 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Hoteles</h2>
        {hotels.length === 0 ? (
          <p className="mt-2 text-sm text-slate-600">
            No hay hoteles registrados todavía.
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-slate-100">
            {hotels.map((hotel) => (
              <li
                key={hotel.id}
                className="flex items-center justify-between py-2 text-sm text-slate-800"
              >
                <span>{hotel.name}</span>
                <span className="rounded-full bg-slate-100 px-2 py-1 text-xs">
                  {membership.orgSlug ?? "org"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="mt-6 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Timeline próximo</h2>
        {grid.length === 0 ? (
          <p className="mt-2 text-sm text-slate-600">
            No hay eventos próximos en las próximas 2 semanas.
          </p>
        ) : (
          <div className="overflow-hidden rounded-xl border border-slate-100">
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">
                    Evento
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">
                    Hotel
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">
                    Horario
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">
                    Pedido
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {grid.map((item) => (
                  <tr key={item.eventId}>
                    <td className="px-4 py-3 text-sm text-slate-800">
                      {item.eventTitle}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700">
                      {item.hotelName ?? "Sin hotel"}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700">
                      {formatEventTime(item.startsAt, item.endsAt)}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {item.purchaseOrderId ? (
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                          {item.purchaseStatus ?? "N/D"}
                        </span>
                      ) : (
                        <span className="text-slate-500">Sin pedido</span>
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
