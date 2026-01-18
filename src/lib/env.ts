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

const parseEnv = <T>(schema: z.ZodSchema<T>): T => {
  const result = schema.safeParse(process.env);
  if (!result.success) {
    const message = result.error.errors
      .map((err) => `${err.path.join(".")}: ${err.message}`)
      .join("; ");
    throw new Error(`Configuración de entorno inválida: ${message}`);
  }
  return result.data;
};

export const loadClientEnv = (): ClientEnv => parseEnv(clientEnvSchema);

export const loadServiceRoleEnv = (): ServiceRoleEnv =>
  parseEnv(serviceRoleEnvSchema);

export const loadSeedEnv = (): SeedEnv => parseEnv(seedEnvSchema);
