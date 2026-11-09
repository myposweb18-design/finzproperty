import type { Property } from "./marketplace";

export const districts = [
  "Ampara",
  "Anuradhapura",
  "Badulla",
  "Batticaloa",
  "Colombo",
  "Galle",
  "Gampaha",
  "Hambantota",
  "Jaffna",
  "Kalutara",
  "Kandy",
  "Kegalle",
  "Kilinochchi",
  "Kurunegala",
  "Mannar",
  "Matale",
  "Matara",
  "Monaragala",
  "Mullaitivu",
  "Nuwara Eliya",
  "Polonnaruwa",
  "Puttalam",
  "Ratnapura",
  "Trincomalee",
  "Vavuniya",
];
export const propertyKinds = [
  "House",
  "Apartment",
  "Bungalow",
  "Villa",
  "Studio",
  "Annex",
  "Hostel",
  "Room",
  "Land",
  "Commercial",
];
export const landSubtypes = [
  "Bare land",
  "Cultivated land",
  "Land with house",
  "Coconut land",
  "Tea land",
  "Rubber land",
  "Paddy / rice land",
  "Beachfront land",
  "Cinnamon land",
  "Waterfront land",
];
export const commercialSubtypes = [
  "Office",
  "Shop",
  "Hotel / resort",
  "Restaurant / cafe",
  "Guest house",
  "Factory",
  "Warehouse",
  "Shopping mall",
  "Coworking",
  "Hospital",
  "Multipurpose",
  "Building",
];
export type SearchFilters = {
  intent?: "buy" | "rent";
  kind?: string;
  district?: string;
  q?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  bathrooms?: number;
  minArea?: number;
  maxArea?: number;
  minLand?: number;
  maxLand?: number;
  amenity?: string;
  agentId?: number;
  subtype?: string;
  priceUnit?: "total" | "sqft" | "perch" | "acre";
  exact?: boolean;
  dateDays?: number;
  onlyImages?: boolean;
  onlyVideo?: boolean;
  onlyTour?: boolean;
  shortTerm?: boolean;
  urgent?: boolean;
  ready?: boolean;
  offPlan?: boolean;
};
export function areaValue(text?: string, land = false) {
  if (!text) return 0;
  const value = Number.parseFloat(text.replaceAll(",", ""));
  if (!Number.isFinite(value)) return 0;
  if (land)
    return /acre/i.test(text)
      ? value * 160
      : /sq.?\s*ft/i.test(text)
        ? value / 272.25
        : value;
  return /sq.?\s*m|m²/i.test(text) ? value * 10.76391041671 : value;
}
export function filterProperties(
  rows: Property[],
  filters: SearchFilters = {}
) {
  const q = filters.q?.trim().toLowerCase();
  const price = (p: Property) =>
    filters.priceUnit === "sqft"
      ? areaValue(p.floorArea)
        ? p.price / areaValue(p.floorArea)
        : undefined
      : filters.priceUnit === "perch"
        ? areaValue(p.landSize, true)
          ? p.price / areaValue(p.landSize, true)
          : undefined
        : filters.priceUnit === "acre"
          ? areaValue(p.landSize, true)
            ? p.price / (areaValue(p.landSize, true) / 160)
            : undefined
          : p.price;
  return rows.filter(
    p =>
      p.status === "active" &&
      (!filters.intent || p.intent === filters.intent) &&
      (!filters.kind || filters.kind === "all" || p.kind === filters.kind) &&
      (!filters.district ||
        filters.district === "all" ||
        p.district === filters.district) &&
      (!q ||
        (filters.exact
          ? q
              .split(/\W+/)
              .filter(Boolean)
              .every(word =>
                `${p.title} ${p.location} ${p.city} ${p.district} ${p.kind}`
                  .toLowerCase()
                  .split(/\W+/)
                  .includes(word)
              )
          : `${p.title} ${p.location} ${p.city} ${p.district} ${p.kind}`
              .toLowerCase()
              .includes(q))) &&
      (filters.minPrice === undefined ||
        (price(p) !== undefined && price(p)! >= filters.minPrice)) &&
      (filters.maxPrice === undefined ||
        (price(p) !== undefined && price(p)! <= filters.maxPrice)) &&
      (!filters.bedrooms || p.bedrooms >= filters.bedrooms) &&
      (!filters.bathrooms || p.bathrooms >= filters.bathrooms) &&
      (!filters.minArea || areaValue(p.floorArea) >= filters.minArea) &&
      (filters.maxArea === undefined ||
        (!!p.floorArea && areaValue(p.floorArea) <= filters.maxArea)) &&
      (!filters.minLand || areaValue(p.landSize, true) >= filters.minLand) &&
      (filters.maxLand === undefined ||
        (!!p.landSize && areaValue(p.landSize, true) <= filters.maxLand)) &&
      (!filters.amenity ||
        p.amenities.some(a =>
          a.toLowerCase().includes(filters.amenity!.toLowerCase())
        )) &&
      (!filters.agentId || p.agentId === filters.agentId) &&
      (!filters.subtype || p.subtype === filters.subtype) &&
      (!filters.onlyImages || !!p.image) &&
      (!filters.onlyVideo || !!p.videoUrl) &&
      (!filters.onlyTour || !!p.tourUrl) &&
      (!filters.shortTerm || !!p.shortTerm) &&
      (!filters.urgent || !!p.urgent) &&
      (!filters.ready || !!p.ready) &&
      (!filters.offPlan || !!p.offPlan) &&
      (!filters.dateDays ||
        (!!p.createdAt &&
          new Date(p.createdAt).getTime() >=
            Date.now() - filters.dateDays * 86400000))
  );
}
export function parseFilters(
  params: URLSearchParams,
  preset?: string
): SearchFilters {
  const numeric = (key: string) => {
    const raw = params.get(key);
    const value = raw === null || raw === "" ? undefined : Number(raw);
    return value !== undefined && Number.isFinite(value) && value >= 0
      ? value
      : undefined;
  };
  return {
    intent:
      params.get("intent") === "either"
        ? undefined
        : params.get("intent") === "rent" ||
            (!params.has("intent") && preset === "rent")
          ? "rent"
          : "buy",
    kind:
      params.get("kind") ||
      (preset === "land"
        ? "Land"
        : preset === "commercial"
          ? "Commercial"
          : "all"),
    district: params.get("district") || "all",
    q: params.get("q") || "",
    minPrice: numeric("minPrice"),
    maxPrice: numeric("maxPrice"),
    bedrooms: numeric("bedrooms"),
    bathrooms: numeric("bathrooms"),
    minArea: numeric("minArea"),
    maxArea: numeric("maxArea"),
    minLand: numeric("minLand"),
    maxLand: numeric("maxLand"),
    amenity: params.get("amenity") || "",
    agentId: numeric("agentId"),
    subtype: params.get("subtype") || "",
    priceUnit: ["sqft", "perch", "acre"].includes(params.get("priceUnit") || "")
      ? (params.get("priceUnit") as "sqft" | "perch" | "acre")
      : "total",
    dateDays: numeric("dateDays"),
    exact: params.get("exact") === "true",
    onlyImages: params.get("onlyImages") === "true",
    onlyVideo: params.get("onlyVideo") === "true",
    onlyTour: params.get("onlyTour") === "true",
    shortTerm: params.get("shortTerm") === "true",
    urgent: params.get("urgent") === "true",
    ready: params.get("ready") === "true",
    offPlan: params.get("offPlan") === "true",
  };
}
export function serializeFilters(filters: SearchFilters) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (
      value !== undefined &&
      value !== "" &&
      value !== "all" &&
      value !== false
    )
      params.set(key, String(value));
  });
  if (filters.intent === undefined) params.set("intent", "either");
  return params;
}
export function sortProperties(rows: Property[], sort: string) {
  return [...rows].sort((a, b) =>
    sort === "price-low"
      ? a.price - b.price
      : sort === "price-high"
        ? b.price - a.price
        : sort === "newest"
          ? b.id - a.id
          : Number(Boolean(b.featured)) - Number(Boolean(a.featured)) ||
            b.id - a.id
  );
}
