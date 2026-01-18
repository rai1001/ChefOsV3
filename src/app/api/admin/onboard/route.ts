import { NextResponse } from "next/server";
import { z } from "zod";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { randomUUID } from "node:crypto";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  orgName: z.string().min(2),
  orgSlug: z.string().min(2).optional()
});

const slugify = (name: string) =>
  name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 30);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { email, password, orgName, orgSlug } = parsed.data;
    const supabase = createServiceRoleClient();

    const userResult = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    });

    if (userResult.error) {
      return NextResponse.json(
        { error: userResult.error.message },
        { status: userResult.error.status ?? 400 }
      );
    }

    const userId = userResult.data.user?.id;
    if (!userId) {
      return NextResponse.json(
        { error: "No se pudo crear el usuario" },
        { status: 500 }
      );
    }

    const orgId = randomUUID();
    const slug = orgSlug ?? slugify(orgName);

    const { error: orgError } = await supabase.from("orgs").insert({
      id: orgId,
      name: orgName,
      slug
    });
    if (orgError) {
      return NextResponse.json({ error: orgError.message }, { status: 400 });
    }

    const { error: memberError } = await supabase.from("org_members").insert({
      org_id: orgId,
      user_id: userId,
      role: "admin",
      is_active: true
    });
    if (memberError) {
      return NextResponse.json({ error: memberError.message }, { status: 400 });
    }

    return NextResponse.json(
      { orgId, userId, orgSlug: slug, message: "Usuario y org creados" },
      { status: 201 }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error desconocido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
