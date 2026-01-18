import { describe, expect, it, afterEach, vi } from "vitest";
import { logger } from "./logger";

describe("logger", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("loggea info con payload JSON", () => {
    const infoSpy = vi.spyOn(console, "info").mockImplementation(() => {});
    logger.info("ok", { module: "test" });

    expect(infoSpy).toHaveBeenCalledTimes(1);
    const payload = JSON.parse(infoSpy.mock.calls[0][0]);
    expect(payload).toMatchObject({ level: "info", message: "ok", module: "test" });
    expect(typeof payload.timestamp).toBe("string");
  });

  it("loggea warn y error con niveles correctos", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    logger.warn("warn-msg");
    logger.error("err-msg", { code: "E_TEST" });

    const warnPayload = JSON.parse(warnSpy.mock.calls[0][0]);
    const errorPayload = JSON.parse(errorSpy.mock.calls[0][0]);

    expect(warnPayload.level).toBe("warn");
    expect(errorPayload).toMatchObject({ level: "error", message: "err-msg", code: "E_TEST" });
  });
});
