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
          <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs text-slate-100">
            {events.length} eventos
          </span>
        }
      />
      <div className="rounded-2xl border border-white/10 bg-slate-900 p-4 shadow-sm">
        {events.length === 0 ? (
          <p className="text-sm text-slate-300">
            Aτ no hay eventos. Usa el seed o crea uno nuevo.
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
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 bg-slate-950/40">
                {events.map((event) => (
                  <tr key={event.id}>
                    <td className="px-4 py-3 text-sm text-slate-100">{event.title}</td>
                    <td className="px-4 py-3 text-sm text-slate-200">
                      {event.hotelName ?? "Sin hotel"}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-200">
                      {formatRange(event.startsAt, event.endsAt)}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-slate-100">
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
