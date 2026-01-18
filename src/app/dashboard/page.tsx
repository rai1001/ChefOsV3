import { AppShell } from "@/modules/shared/ui/app-shell";
import { PageHeader } from "@/modules/shared/ui/page-header";
import { requireUserContext } from "@/modules/shared/data/server-context";
import { getOrgHotels } from "@/modules/orgs/data/orgs.server";

const DashboardPage = async () => {
  const { user, membership } = await requireUserContext();

  const hotels = await getOrgHotels(membership.orgId);

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
          <p className="text-sm text-slate-600">Próximos pasos</p>
          <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-slate-700">
            <li>Completa el seed inicial</li>
            <li>Ejecuta Playwright smoke</li>
            <li>Publica el usuario admin</li>
          </ul>
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
    </AppShell>
  );
};

export default DashboardPage;
