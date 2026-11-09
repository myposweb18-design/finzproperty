import { useMemo } from "react";
import { trpc } from "@/lib/trpc";
import type { Agent, Development, Property } from "@shared/marketplace";

export type MarketplaceFilters = {
  intent?: "buy" | "rent";
  kind?: string;
  district?: string;
  q?: string;
  featured?: boolean;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  bathrooms?: number;
};

export function useProperties(input?: MarketplaceFilters) {
  const query = trpc.marketplace.listings.useQuery(input, { staleTime: 60_000, retry: false });
  return { ...query, data: (query.data ?? []) as Property[] };
}

export function useProperty(slug: string) {
  const query = trpc.marketplace.property.useQuery({ slug }, { staleTime: 60_000, retry: false });
  return { ...query, data: query.data as Property | undefined };
}

export function useAgents(input?: { q?: string; location?: string }) {
  const query = trpc.marketplace.agents.useQuery(input, { staleTime: 60_000, retry: false });
  return { ...query, data: (query.data ?? []) as Agent[] };
}

export function useDevelopments() {
  const query = trpc.marketplace.developments.useQuery(undefined, { staleTime: 60_000, retry: false });
  return { ...query, data: (query.data ?? []) as Development[] };
}

export function useFilteredProperties(properties: Property[], search: string) {
  return useMemo(() => {
    const normalized = search.trim().toLowerCase();
    if (!normalized) return properties;
    return properties.filter(property =>
      `${property.title} ${property.location} ${property.kind} ${property.district}`.toLowerCase().includes(normalized),
    );
  }, [properties, search]);
}
