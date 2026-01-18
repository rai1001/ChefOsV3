import { z } from "zod";

const clientEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1)
});

const serviceRoleEnvSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  SUPABASE_JWT_SECRET: z.string().min(1)
});

const seedEnvSchema = z.object({
  SEED_ADMIN_EMAIL: z.string().email(),
  SEED_ADMIN_PASSWORD: z.string().min(8),
  SEED_ORG_ID: z.string().uuid().optional(),
  SEED_HOTEL_ID: z.string().uuid().optional()
});

type ClientEnv = z.infer<typeof clientEnvSchema>;
type ServiceRoleEnv = z.infer<typeof serviceRoleEnvSchema>;
type SeedEnv = z.infer<typeof seedEnvSchema>;

const parseEnv = <T>(schema: z.ZodSchema<T>, input: unknown): T => {
  const result = schema.safeParse(input);
  if (!result || !result.success) {
    const issues = result && "error" in result ? result.error.issues ?? [] : [];
    const message =
      issues.length > 0
        ? issues.map((err) => `${err.path.join(".")}: ${err.message}`).join("; ")
        : "Variables de entorno incompletas";
    throw new Error(`Configuración de entorno inválida: ${message}`);
  }
  return result.data;
};

export const loadClientEnv = (): ClientEnv =>
  parseEnv(clientEnvSchema, {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  });

export const loadServiceRoleEnv = (): ServiceRoleEnv =>
  parseEnv(serviceRoleEnvSchema, {
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    SUPABASE_JWT_SECRET: process.env.SUPABASE_JWT_SECRET
  });

export const loadSeedEnv = (): SeedEnv =>
  parseEnv(seedEnvSchema, {
    SEED_ADMIN_EMAIL: process.env.SEED_ADMIN_EMAIL,
    SEED_ADMIN_PASSWORD: process.env.SEED_ADMIN_PASSWORD,
    SEED_ORG_ID: process.env.SEED_ORG_ID,
    SEED_HOTEL_ID: process.env.SEED_HOTEL_ID
  });
