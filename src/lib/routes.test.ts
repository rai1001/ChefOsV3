import { describe, expect, it } from "vitest";
import { PROTECTED_PATHS, PROTECTED_ROUTES } from "./routes";

describe("routes", () => {
  it("exposes protected paths for middleware", () => {
    const values = Object.values(PROTECTED_ROUTES);
    expect(PROTECTED_PATHS).toEqual(values);
    expect(PROTECTED_PATHS).toContain("/dashboard");
    expect(PROTECTED_PATHS).toContain("/settings");
  });
});
