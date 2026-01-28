import { describe, it, expect } from "vitest";
import { detectHotspots } from "@/lib/analysis";
describe("hotspots", () => {
  it("flags top quartile", () => {
    const alerts = detectHotspots([{code:"A",value:1},{code:"B",value:5},{code:"C",value:9},{code:"D",value:10}]);
    expect(alerts.length).toBeGreaterThan(0);
  });
});
