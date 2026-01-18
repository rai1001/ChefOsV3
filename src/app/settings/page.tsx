import { requireUserContext } from "@/modules/shared/data/server-context";
import { AppShell } from "@/modules/shared/ui/app-shell";
import { PageHeader } from "@/modules/shared/ui/page-header";
import { getOrgHotels } from "@/modules/orgs/data/orgs.server";
import { HotelCreateForm } from "@/modules/orgs/ui/hotel-create-form";
import { InviteUserForm } from "@/modules/orgs/ui/invite-user-form";

const SettingsPage = async () => {
  const { user, membership } = await requireUserContext();
  const hotels = await getOrgHotels(membership.orgId);
  const isAdmin = membership.role === "admin";

  return (
    <AppShell userEmail={user.email ?? ""} orgName={membership.orgName}>
      <PageHeader
        title="Ajustes"
        subtitle="Configuracion de la organizacion"
        actions={
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700">
            Rol: {membership.role}
          </span>
        }
      />
      {isAdmin ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <HotelCreateForm orgId={membership.orgId} />
          <InviteUserForm />
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-100 bg-white p-4 text-sm text-slate-700 shadow-sm">
          Solo los admins pueden gestionar hoteles y usuarios.
        </div>
      )}
      <div className="mt-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
        <p className="text-sm font-semibold text-slate-900">Hoteles activos</p>
        {hotels.length === 0 ? (
          <p className="mt-2 text-sm text-slate-600">No hay hoteles registrados.</p>
        ) : (
          <ul className="mt-2 space-y-2 text-sm text-slate-700">
            {hotels.map((hotel) => (
              <li key={hotel.id} className="rounded-lg border border-slate-100 px-3 py-2">
                {hotel.name}
              </li>
            ))}
          </ul>
        )}
      </div>
    </AppShell>
  );
};

export default SettingsPage;
