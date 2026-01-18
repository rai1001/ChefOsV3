import { describe, expect, it } from "vitest";
import { AppError, toAuthError, toUnknownError } from "./errors";

describe("AppError helpers", () => {
  it("crea AppError de auth", () => {
    const err = toAuthError("falló", { foo: "bar" });
    expect(err).toBeInstanceOf(AppError);
    expect(err.type).toBe("AuthError");
  });

  it("crea AppError unknown", () => {
    const err = toUnknownError("X");
    expect(err.type).toBe("UnknownError");
  });
});
