import { describe, expect, it } from "vitest";
import { loginSchema } from "./schemas";

describe("loginSchema", () => {
  it("valida email y contraseña correctos", () => {
    const data = { email: "user@example.com", password: "secreto123" };
    const result = loginSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it("rechaza email inválido", () => {
    const data = { email: "bad-email", password: "secreto123" };
    const result = loginSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it("rechaza contraseña corta", () => {
    const data = { email: "user@example.com", password: "123" };
    const result = loginSchema.safeParse(data);
    expect(result.success).toBe(false);
  });
});
