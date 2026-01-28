import { describe, it, expect } from "vitest";
import { yyyyMmDd, isIsoDate } from "@/lib/geo.utils";

describe("date utils", () => {
  it("yyyyMmDd", () => {
    const s = yyyyMmDd(new Date("2025-09-11T10:00:00Z"));
    expect(s).toBe("2025-09-11");
  });
  it("isIsoDate", () => {
    expect(isIsoDate("2025-09-11")).toBe(true);
    expect(isIsoDate("11-09-2025")).toBe(false);
  });
});
