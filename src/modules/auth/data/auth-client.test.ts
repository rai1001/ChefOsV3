import { describe, expect, it, vi } from "vitest";
import { signInWithEmail } from "./auth-client";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { AppError } from "@/modules/shared/domain/errors";

vi.mock("@/lib/supabase/client", () => ({
  createSupabaseBrowserClient: vi.fn()
}));

const mockSignIn = vi.fn();
(createSupabaseBrowserClient as unknown as vi.Mock).mockReturnValue({
  auth: {
    signInWithPassword: mockSignIn,
    signOut: vi.fn()
  }
});

describe("signInWithEmail", () => {
  it("resuelve en login exitoso", async () => {
    mockSignIn.mockResolvedValueOnce({ error: null });
    await expect(
      signInWithEmail({ email: "user@example.com", password: "secret123" })
    ).resolves.toBeUndefined();
  });

  it("lanza AppError de auth para credenciales inválidas", async () => {
    mockSignIn.mockResolvedValueOnce({
      error: { message: "Invalid login", code: "400" }
    });
    await expect(
      signInWithEmail({ email: "user@example.com", password: "wrong" })
    ).rejects.toBeInstanceOf(AppError);
  });

  it("lanza unknown para otros errores", async () => {
    mockSignIn.mockResolvedValueOnce({
      error: { message: "timeout", code: "500" }
    });
    await expect(
      signInWithEmail({ email: "user@example.com", password: "secret123" })
    ).rejects.toBeInstanceOf(AppError);
  });
});
