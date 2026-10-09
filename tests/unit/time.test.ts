import { describe, expect, it } from "vitest";
import { formatTimeRange, localDayKey, monthGrid, monthRange, parseMonthParam, shiftMonth, zonedMidnight } from "@/lib/time";

describe("Central Time helpers", () => {
  it("finds local midnight in standard and daylight time", () => {
    expect(zonedMidnight(2026, 1, 15).toISOString()).toBe("2026-01-15T06:00:00.000Z"); // CST, UTC-6
    expect(zonedMidnight(2026, 7, 4).toISOString()).toBe("2026-07-04T05:00:00.000Z"); // CDT, UTC-5
  });

  it("handles daylight-saving change days", () => {
    expect(zonedMidnight(2026, 3, 8).toISOString()).toBe("2026-03-08T06:00:00.000Z"); // spring forward at 2am
    expect(zonedMidnight(2026, 11, 1).toISOString()).toBe("2026-11-01T05:00:00.000Z"); // fall back at 2am
  });

  it("builds a month range in local time", () => {
    const { start, end } = monthRange({ year: 2026, month: 11 });
    expect(start.toISOString()).toBe("2026-11-01T05:00:00.000Z");
    expect(end.toISOString()).toBe("2026-12-01T06:00:00.000Z");
  });

  it("puts a late-evening ride on the right local day", () => {
    // 11:30pm Central on Oct 31 is already Nov 1 in UTC.
    expect(localDayKey("2026-11-01T04:30:00.000Z")).toBe("2026-10-31");
  });

  it("parses only well-formed month parameters", () => {
    expect(parseMonthParam("2026-10")).toEqual({ year: 2026, month: 10 });
    for (const bad of ["2026-13", "2026-1", "abc", "1999-01", "2026-10; drop table", undefined, ["2026-10"]]) {
      expect(parseMonthParam(bad)).toBeNull();
    }
  });

  it("moves across year boundaries", () => {
    expect(shiftMonth({ year: 2026, month: 12 }, 1)).toEqual({ year: 2027, month: 1 });
    expect(shiftMonth({ year: 2026, month: 1 }, -1)).toEqual({ year: 2025, month: 12 });
  });

  it("builds a Sunday-first grid of whole weeks", () => {
    const weeks = monthGrid({ year: 2026, month: 10 }); // Oct 1, 2026 is a Thursday
    expect(weeks.every((w) => w.length === 7)).toBe(true);
    expect(weeks[0][4]).toEqual({ key: "2026-10-01", day: 1, inMonth: true });
    expect(weeks[0][0].inMonth).toBe(false);
    expect(weeks.flat().filter((d) => d.inMonth)).toHaveLength(31);
  });

  it("formats time ranges", () => {
    expect(formatTimeRange("2026-10-10T14:00:00Z", "2026-10-10T20:00:00Z", false)).toBe("9:00 AM – 3:00 PM");
    expect(formatTimeRange("2026-10-10T14:00:00Z", null, true)).toBe("All day");
  });
});
