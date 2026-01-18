import { requireUserContext } from "@/modules/shared/data/server-context";
import { AppShell } from "@/modules/shared/ui/app-shell";
import { PageHeader } from "@/modules/shared/ui/page-header";
import { AttachmentsList } from "@/modules/attachments/ui/attachments-list";

const EventsPage = async () => {
  const { user, membership } = await requireUserContext();

  return (
    <AppShell userEmail={user.email ?? ""} orgName={membership.orgName}>
      <PageHeader
        title="Eventos"
        subtitle="Listado base de eventos"
        actions={
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700">
            Próximamente
          </span>
        }
      />
      <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
        <p className="text-sm text-slate-700">
          Este módulo usará TanStack Query y Supabase RLS para eventos por hotel.
          Añade aquí tu slice cuando definas el flujo.
        </p>
      </div>
      <div className="mt-4">
        <AttachmentsList orgId={membership.orgId} />
      </div>
    </AppShell>
  );
};

export default EventsPage;
