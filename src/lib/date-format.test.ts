import { describe, expect, it } from "vitest";
import { formatEventTime } from "./date-format";
import { format } from "date-fns";
import { es } from "date-fns/locale";

describe("formatEventTime", () => {
  it("formats start and end times in spanish locale", () => {
    const start = new Date(2026, 0, 18, 10, 0, 0);
    const end = new Date(2026, 0, 18, 12, 30, 0);
    const expected = `${format(start, "d MMM HH:mm", { locale: es })} - ${format(end, "HH:mm", { locale: es })}`;
    expect(formatEventTime(start, end)).toBe(expected);
  });
});
