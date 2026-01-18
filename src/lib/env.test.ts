import { beforeEach, describe, expect, it } from "vitest";
import { loadClientEnv, loadSeedEnv, loadServiceRoleEnv } from "./env";

const ORIGINAL_ENV = process.env;

describe("env loaders", () => {
  beforeEach(() => {
    process.env = { ...ORIGINAL_ENV };
  });

  it("carga variables de cliente válidas", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "http://localhost:54321";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon-key";
    expect(() => loadClientEnv()).not.toThrow();
  });

  it("falla si falta anon key", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "http://localhost:54321";
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    expect(() => loadClientEnv()).toThrow();
  });

  it("carga service role env", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "http://localhost:54321";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon-key";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "service-role";
    process.env.SUPABASE_JWT_SECRET = "jwt-secret";
    expect(() => loadServiceRoleEnv()).not.toThrow();
  });

  it("carga seed env", () => {
    process.env.SEED_ADMIN_EMAIL = "admin@example.com";
    process.env.SEED_ADMIN_PASSWORD = "password123";
    expect(() => loadSeedEnv()).not.toThrow();
  });
});
