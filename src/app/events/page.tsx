import { requireUserContext } from "@/modules/shared/data/server-context";
import { AppShell } from "@/modules/shared/ui/app-shell";
import { PageHeader } from "@/modules/shared/ui/page-header";
import { AttachmentsList } from "@/modules/attachments/ui/attachments-list";
import { listOrgEvents } from "@/modules/events/data/events.server";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const EventsPage = async () => {
  const { user, membership } = await requireUserContext();
  const events = await listOrgEvents(membership.orgId);

  const formatRange = (start: string, end: string) =>
    `${format(new Date(start), "d MMM HH:mm", { locale: es })} - ${format(
      new Date(end),
      "HH:mm",
      { locale: es }
    )}`;

  return (
    <AppShell userEmail={user.email ?? ""} orgName={membership.orgName}>
      <PageHeader
        title="Eventos"
        subtitle="Listado de eventos por hotel"
        actions={
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700">
            {events.length} eventos
          </span>
        }
      />
      <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
        {events.length === 0 ? (
          <p className="text-sm text-slate-700">
            Aún no hay eventos. Usa el seed o crea uno nuevo.
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
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {events.map((event) => (
                  <tr key={event.id}>
                    <td className="px-4 py-3 text-sm text-slate-800">{event.title}</td>
                    <td className="px-4 py-3 text-sm text-slate-700">
                      {event.hotelName ?? "Sin hotel"}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700">
                      {formatRange(event.startsAt, event.endsAt)}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                        {event.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <div className="mt-4">
        <AttachmentsList orgId={membership.orgId} />
      </div>
    </AppShell>
  );
};

export default EventsPage;
