import { describe, it, expect } from "vitest";
import { seedProperties } from "./marketplace";
import {
  areaValue,
  districts,
  filterProperties,
  parseFilters,
  serializeFilters,
  sortProperties,
} from "./search";
describe("public property discovery", () => {
  it("covers exactly25 unique Sri Lankan districts", () => {
    expect(districts).toHaveLength(25);
    expect(new Set(districts).size).toBe(25);
  });
  it("restores numeric and feature inputs in URLs", () => {
    const filters = {
      intent: "rent" as const,
      kind: "Apartment",
      minPrice: 100000,
      maxPrice: 400000,
      bedrooms: 2,
      onlyImages: true,
      priceUnit: "total" as const,
    };
    expect(parseFilters(serializeFilters(filters))).toMatchObject(filters);
  });
  it("does not turn an empty match into demo records", () => {
    expect(filterProperties(seedProperties, { q: "zzzzz unmatched" })).toEqual(
      []
    );
  });
  it("filters prices, bedrooms and districts together", () => {
    const result = filterProperties(seedProperties, {
      district: "Colombo",
      minPrice: 200000,
      maxPrice: 1000000,
      bedrooms: 2,
      intent: "rent",
    });
    expect(
      result.every(
        p =>
          p.intent === "rent" &&
          p.price >= 200000 &&
          p.price <= 1000000 &&
          p.bedrooms >= 2 &&
          p.district === "Colombo"
      )
    ).toBe(true);
  });
  it("normalizes acres into perches and commas in floor area", () => {
    expect(areaValue("1 acre", true)).toBe(160);
    expect(areaValue("2,500 sq ft")).toBe(2500);
    expect(areaValue("272.25 sq ft", true)).toBe(1);
  });
  it("sorts prices and doesn't mutate API records", () => {
    const rows = sortProperties(seedProperties, "price-low");
    expect(rows[0].price).toBe(Math.min(...seedProperties.map(p => p.price)));
    expect(rows).not.toBe(seedProperties);
  });
  it("uses actual media flags instead of inferred tours", () => {
    expect(filterProperties(seedProperties, { onlyTour: true })).toEqual([]);
  });
  it("preserves either sale or rent without coercion", () => {
    expect(
      parseFilters(new URLSearchParams("intent=either")).intent
    ).toBeUndefined();
    expect(serializeFilters({ intent: undefined }).get("intent")).toBe(
      "either"
    );
  });
  it("filters normalized price per acre", () => {
    const p = {
      ...seedProperties[0],
      kind: "Land" as const,
      landSize: "2 acres",
      price: 32000000,
    };
    expect(
      filterProperties([p], { priceUnit: "acre", maxPrice: 16000000 })
    ).toHaveLength(1);
  });
});

it("matches multi-word exact queries as whole words", () => {
  expect(
    filterProperties(seedProperties, { q: "Colombo 03", exact: true })
  ).toHaveLength(1);
  expect(
    filterProperties(seedProperties, { q: "Col", exact: true })
  ).toHaveLength(0);
});
it("does not treat a zero maximum floor extent as any size", () => {
  expect(filterProperties(seedProperties, { maxArea: 0 })).toHaveLength(0);
});
