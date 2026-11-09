import { MapPinned, X } from "lucide-react";
import { PropertyMap } from "./PropertyMap";
import { useProperties } from "@/lib/marketplace";
import { filterProperties, type SearchFilters } from "@shared/search";
export function InlinePropertyMap({
  filters,
  onClose,
}: {
  filters: SearchFilters;
  onClose: () => void;
}) {
  const query = useProperties();
  const matches = filterProperties(query.data, filters);
  return (
    <section
      id="homepage-property-map"
      aria-label="Homepage property map"
      className="mt-4 overflow-hidden rounded-[22px] border border-[#e7e2d9] bg-[#fffdf9] text-[#0b1f33] shadow-[0_24px_80px_rgba(10,28,46,0.14)]"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e7e2d9] px-5 py-4">
        <div>
          <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
            <MapPinned size={20} className="text-[#a98136]" />
            Explore properties on the map
          </h2>
          <p role="status" className="mt-1 text-xs text-[#75818a]">
            {query.isLoading
              ? "Loading matching properties…"
              : query.isError
                ? "Property data could not be loaded."
                : `${matches.length} matching ${matches.length === 1 ? "property" : "properties"} · Use the search above to refine your map.`}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="fp-button inline-flex min-h-10 items-center gap-2 rounded-xl border border-[#e7e2d9] bg-white px-3 text-xs font-semibold text-[#617080]"
        >
          <X size={16} />
          Hide map
        </button>
      </div>
      {query.isError ? (
        <div role="alert" className="p-6 text-center">
          <p className="text-sm text-[#657580]">
            We couldn’t load properties for this map. Your search criteria are
            still preserved.
          </p>
          <button
            type="button"
            onClick={() => void query.refetch()}
            className="fp-button mt-4 rounded-xl bg-[#0b1f33] px-5 py-3 text-sm text-white"
          >
            Retry properties
          </button>
        </div>
      ) : query.isLoading ? (
        <div
          role="status"
          className="grid min-h-[280px] place-items-center p-6 text-sm text-[#657580]"
        >
          Preparing your property map…
        </div>
      ) : (
        <div className="p-3 sm:p-4">
          {matches.some(p => p.isDemo) && (
            <p className="mb-3 rounded-lg bg-[#fff6e4] px-3 py-2 text-xs leading-5 text-[#7a612e]">
              Demonstration inventory: these records are illustrative, not
              verified live offers.
            </p>
          )}
          <PropertyMap
            items={matches.map(p => ({
              id: p.id,
              title: p.title,
              location: p.location,
              image: p.image,
              price: p.price,
              intent: p.intent,
              href: `/properties/${p.slug}`,
            }))}
          />
        </div>
      )}
    </section>
  );
}
