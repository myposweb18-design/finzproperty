import { describe, it, expect } from "vitest";
import {
  countAdvancedFilters,
  parsePropertyView,
  resetSearchFilters,
  validateSearchFilters,
} from "./searchUi";
import { parseFilters, serializeFilters } from "./search";
describe("map and more-filter controls", () => {
  it("restores map/list modes and defaults unsupported views", () => {
    expect(parsePropertyView("map")).toBe("map");
    expect(parsePropertyView("list")).toBe("list");
    expect(parsePropertyView("unknown")).toBe("grid");
  });
  it("validates all three numeric ranges on every entry point", () => {
    expect(validateSearchFilters({ minPrice: 300, maxPrice: 200 })).toMatch(
      /price/
    );
    expect(validateSearchFilters({ minArea: 400, maxArea: 200 })).toMatch(
      /floor area/
    );
    expect(validateSearchFilters({ minLand: 20, maxLand: 10 })).toMatch(
      /land size/
    );
    expect(validateSearchFilters({ minPrice: 0, maxPrice: 0 })).toBeNull();
  });
  it("rejects negatives, NaN and infinite values without changing the URL", () => {
    for (const n of [-1, NaN, Infinity])
      expect(validateSearchFilters({ maxArea: n })).not.toBeNull();
  });
  it("counts real advanced criteria including zero upper limits", () => {
    expect(
      countAdvancedFilters({
        kind: "Land",
        district: "Colombo",
        minPrice: 0,
        onlyTour: true,
        onlyVideo: false,
        priceUnit: "perch",
      })
    ).toBe(3);
  });
  it("resets categories without silently changing land/commercial results", () => {
    expect(resetSearchFilters("land", "rent")).toMatchObject({
      kind: "Land",
      intent: "rent",
    });
    expect(resetSearchFilters("commercial", "buy")).toMatchObject({
      kind: "Commercial",
      intent: "buy",
    });
  });
  it("retains applied filters when setting the map query parameter", () => {
    const p = serializeFilters({
      kind: "Apartment",
      maxPrice: 80000000,
      bedrooms: 2,
      intent: "buy",
    });
    p.set("view", "map");
    expect(parsePropertyView(p.get("view"))).toBe("map");
    expect(parseFilters(p)).toMatchObject({
      kind: "Apartment",
      maxPrice: 80000000,
      bedrooms: 2,
      intent: "buy",
    });
  });
});
