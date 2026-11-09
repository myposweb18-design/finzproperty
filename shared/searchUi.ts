import type { SearchFilters } from "./search";
export type PropertyView = "grid" | "list" | "map";
export function parsePropertyView(raw: string | null): PropertyView {
  return raw === "list" || raw === "map" ? raw : "grid";
}
export function validateSearchFilters(filters: SearchFilters): string | null {
  const fields = [
    "minPrice",
    "maxPrice",
    "bedrooms",
    "bathrooms",
    "minArea",
    "maxArea",
    "minLand",
    "maxLand",
    "dateDays",
  ] as const;
  for (const key of fields) {
    const value = filters[key];
    if (value !== undefined && (!Number.isFinite(value) || value < 0))
      return "Enter valid non-negative numbers for your search filters.";
  }
  for (const [min, max, label] of [
    [filters.minPrice, filters.maxPrice, "price"],
    [filters.minArea, filters.maxArea, "floor area"],
    [filters.minLand, filters.maxLand, "land size"],
  ] as const) {
    if (min !== undefined && max !== undefined && min > max)
      return `Minimum ${label} cannot exceed maximum ${label}.`;
  }
  return null;
}
export function countAdvancedFilters(filters: SearchFilters): number {
  const keys = [
    "minPrice",
    "maxPrice",
    "bedrooms",
    "bathrooms",
    "minArea",
    "maxArea",
    "minLand",
    "maxLand",
    "amenity",
    "subtype",
    "dateDays",
    "exact",
    "onlyImages",
    "onlyVideo",
    "onlyTour",
    "shortTerm",
    "urgent",
    "ready",
    "offPlan",
  ] as const;
  return (
    keys.filter(
      key =>
        filters[key] !== undefined &&
        filters[key] !== false &&
        filters[key] !== ""
    ).length + (filters.priceUnit && filters.priceUnit !== "total" ? 1 : 0)
  );
}
export function resetSearchFilters(
  preset?: string,
  intent?: "buy" | "rent"
): SearchFilters {
  return {
    intent: intent ?? (preset === "rent" ? "rent" : "buy"),
    kind:
      preset === "land"
        ? "Land"
        : preset === "commercial"
          ? "Commercial"
          : "all",
    district: "all",
    q: "",
    priceUnit: "total",
  };
}
