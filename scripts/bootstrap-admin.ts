#!/usr/bin/env tsx
import { config as loadDotenv } from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { loadClientEnv, loadSeedEnv, loadServiceRoleEnv } from "../src/lib/env";
import type { Database } from "../src/lib/supabase/types";

// Carga primero .env.local (real/staging) y luego .env como fallback
loadDotenv({ path: ".env.local" });
loadDotenv({ path: ".env" });

const DEFAULT_ORG_ID = "11111111-1111-4111-8111-111111111111";
const DEFAULT_HOTEL_ID = "22222222-2222-4222-8222-222222222222";

const ensureOrgAndHotel = async (
  supabase: ReturnType<typeof createClient<Database>>,
  orgId: string,
  hotelId: string
) => {
  const orgRes = await supabase
    .from("orgs")
    .upsert({
      id: orgId,
      name: "ChefOS Demo",
      slug: "chefos-demo"
    })
    .select("id")
    .single();

  if (orgRes.error) {
    throw new Error(`No se pudo asegurar la org: ${orgRes.error.message}`);
  }

  const hotelRes = await supabase
    .from("hotels")
    .upsert({
      id: hotelId,
      org_id: orgId,
      name: "Hotel Demo"
    })
    .select("id")
    .single();

  if (hotelRes.error) {
    throw new Error(`No se pudo asegurar el hotel: ${hotelRes.error.message}`);
  }
};

const findUserByEmail = async (
  supabase: ReturnType<typeof createClient<Database>>,
  email: string
) => {
  const { data, error } = await supabase.auth.admin.listUsers();
  if (error) {
    throw new Error(`No se pudo listar usuarios: ${error.message}`);
  }
  return data.users.find(
    (user) => user.email?.toLowerCase() === email.toLowerCase()
  );
};

const ensureMembership = async (
  supabase: ReturnType<typeof createClient<Database>>,
  orgId: string,
  userId: string
) => {
  const { error } = await supabase.from("org_members").upsert({
    org_id: orgId,
    user_id: userId,
    role: "admin",
    is_active: true
  });
  if (error) {
    throw new Error(`No se pudo crear la membresía: ${error.message}`);
  }
};

async function main() {
  const env = {
    ...loadClientEnv(),
    ...loadServiceRoleEnv(),
    ...loadSeedEnv()
  };

  const orgId = env.SEED_ORG_ID ?? DEFAULT_ORG_ID;
  const hotelId = env.SEED_HOTEL_ID ?? DEFAULT_HOTEL_ID;

  const supabase = createClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: { autoRefreshToken: false, persistSession: false }
    }
  );

  await ensureOrgAndHotel(supabase, orgId, hotelId);

  const existing = await findUserByEmail(supabase, env.SEED_ADMIN_EMAIL);
  let userId = existing?.id;

  if (!existing) {
    const { data, error } = await supabase.auth.admin.createUser({
      email: env.SEED_ADMIN_EMAIL,
      password: env.SEED_ADMIN_PASSWORD,
      email_confirm: true
    });
    if (error || !data.user) {
      throw new Error(
        `No se pudo crear el usuario admin: ${error?.message ?? "sin dato"}`
      );
    }
    userId = data.user.id;
  } else {
    const { error } = await supabase.auth.admin.updateUserById(existing.id, {
      password: env.SEED_ADMIN_PASSWORD
    });
    if (error) {
      throw new Error(`No se pudo actualizar la contraseña: ${error.message}`);
    }
  }

  if (!userId) {
    throw new Error("UserID no definido tras creación/actualización");
  }

  await ensureMembership(supabase, orgId, userId);

  console.info(
    `Usuario admin asegurado: ${env.SEED_ADMIN_EMAIL} (org ${orgId}, hotel ${hotelId})`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
