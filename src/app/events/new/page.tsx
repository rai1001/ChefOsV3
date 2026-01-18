import { requireUserContext } from "@/modules/shared/data/server-context";
import { AppShell } from "@/modules/shared/ui/app-shell";
import { PageHeader } from "@/modules/shared/ui/page-header";
import { getOrgHotels } from "@/modules/orgs/data/orgs.server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import Link from "next/link";
import { z } from "zod";

const schema = z.object({
  title: z.string().min(2),
  hotelId: z.string().uuid(),
  startsAt: z.string().min(1),
  endsAt: z.string().min(1)
});

const createEvent = async (formData: FormData, orgId: string) => {
  "use server";
  const parsed = schema.safeParse({
    title: formData.get("title"),
    hotelId: formData.get("hotelId"),
    startsAt: formData.get("startsAt"),
    endsAt: formData.get("endsAt")
  });

  if (!parsed.success) {
    return { error: "Datos inválidos" };
  }

  const startsAt = new Date(parsed.data.startsAt);
  const endsAt = new Date(parsed.data.endsAt);

  if (Number.isNaN(startsAt.getTime()) || Number.isNaN(endsAt.getTime())) {
    return { error: "Fechas inválidas" };
  }

  const supabase = createSupabaseServerClient();
  const { error } = await supabase.from("events").insert({
    org_id: orgId,
    hotel_id: parsed.data.hotelId,
    title: parsed.data.title,
    starts_at: startsAt.toISOString(),
    ends_at: endsAt.toISOString(),
    status: "draft"
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/events");
  redirect("/events");
};

const NewEventPage = async () => {
  const { user, membership } = await requireUserContext();
  const hotels = await getOrgHotels(membership.orgId);

  return (
    <AppShell userEmail={user.email ?? ""} orgName={membership.orgName}>
      <PageHeader
        title="Nuevo evento"
        subtitle="Crear evento básico"
        actions={
          <Link
            href="/events"
            className="rounded-lg bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700"
          >
            Volver
          </Link>
        }
      />
      <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
        <form action={(fd) => createEvent(fd, membership.orgId)} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-800" htmlFor="title">
              Título
            </label>
            <input
              id="title"
              name="title"
              type="text"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              required
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-800" htmlFor="hotelId">
              Hotel
            </label>
            <select
              id="hotelId"
              name="hotelId"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              required
            >
              <option value="">Selecciona hotel</option>
              {hotels.map((hotel) => (
                <option key={hotel.id} value={hotel.id}>
                  {hotel.name}
                </option>
              ))}
            </select>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-800" htmlFor="startsAt">
                Empieza
              </label>
              <input
                id="startsAt"
                name="startsAt"
                type="datetime-local"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-800" htmlFor="endsAt">
                Termina
              </label>
              <input
                id="endsAt"
                name="endsAt"
                type="datetime-local"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                required
              />
            </div>
          </div>
          <button
            type="submit"
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
          >
            Crear evento
          </button>
        </form>
      </div>
    </AppShell>
  );
};

export default NewEventPage;
