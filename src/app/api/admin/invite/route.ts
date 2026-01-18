import { NextResponse } from "next/server";
import { z } from "zod";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { getServerUser } from "@/modules/auth/data/session.server";
import { getActiveMembership } from "@/modules/orgs/data/orgs.server";
import { logger } from "@/lib/logger";

const roles = ["admin", "planner", "purchasing", "chef", "viewer"] as const;

const schema = z.object({
  email: z.string().email(),
  role: z.enum(roles)
});

export async function POST(request: Request) {
  try {
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const membership = await getActiveMembership(user.id);
    if (!membership || membership.role !== "admin") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Payload invalido" }, { status: 400 });
    }

    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Datos invalidos", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const supabase = createServiceRoleClient();
    const inviteResult = await supabase.auth.admin.inviteUserByEmail(parsed.data.email);

    if (inviteResult.error) {
      logger.warn("admin.invite.error", {
        code: inviteResult.error.code,
        status: inviteResult.error.status
      });
      return NextResponse.json(
        { error: inviteResult.error.message },
        { status: inviteResult.error.status ?? 400 }
      );
    }

    const userId = inviteResult.data?.user?.id;
    if (!userId) {
      return NextResponse.json({ error: "No se pudo crear el usuario" }, { status: 500 });
    }

    const { error: memberError } = await supabase.from("org_members").upsert(
      {
        org_id: membership.orgId,
        user_id: userId,
        role: parsed.data.role,
        is_active: true
      },
      { onConflict: "org_id,user_id" }
    );

    if (memberError) {
      logger.warn("admin.invite.membership_error", { code: memberError.code });
      return NextResponse.json({ error: memberError.message }, { status: 400 });
    }

    return NextResponse.json(
      { orgId: membership.orgId, userId, message: "Invitacion enviada" },
      { status: 201 }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error desconocido";
    logger.error("admin.invite.unknown_error", { message });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
