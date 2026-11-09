import { useRef, useState } from "react";
import { useLocation } from "wouter";
import { MapPin, Map, Search } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  districts,
  propertyKinds,
  serializeFilters,
  type SearchFilters,
} from "@shared/search";
import {
  countAdvancedFilters,
  resetSearchFilters,
  validateSearchFilters,
  type PropertyView,
} from "@shared/searchUi";
import { FilterDialog } from "./FilterDialog";
import { InlinePropertyMap } from "./InlinePropertyMap";
export function SearchPanel({
  compact = false,
  initialIntent = "buy",
}: {
  compact?: boolean;
  initialIntent?: "buy" | "rent";
}) {
  const [, navigate] = useLocation();
  const [filters, setFilters] = useState<SearchFilters>(
    resetSearchFilters(undefined, initialIntent)
  );
  const [advanced, setAdvanced] = useState(false);
  const [mapFilters, setMapFilters] = useState<SearchFilters | null>(null);
  const mapPanel = useRef<HTMLDivElement>(null);
  const mapButton = useRef<HTMLButtonElement>(null);
  function search(view: PropertyView = "grid") {
    const failure = validateSearchFilters(filters);
    if (failure) {
      toast.error(failure);
      return false;
    }
    if (view === "map" || mapFilters !== null) {
      setMapFilters({ ...filters });
      if (mapFilters === null) {
        requestAnimationFrame(() =>
          mapPanel.current?.scrollIntoView({
            block: "start",
            behavior: window.matchMedia("(prefers-reduced-motion: reduce)")
              .matches
              ? "instant"
              : "smooth",
          })
        );
      }
      return true;
    }
    const params = serializeFilters(filters);
    if (view !== "grid") params.set("view", view);
    const target =
      filters.kind === "Land"
        ? "land"
        : filters.kind === "Commercial"
          ? "commercial"
          : filters.intent === "rent"
            ? "rent"
            : "buy";
    navigate(`/${target}?${params}`);
    return true;
  }
  function submit(event: React.FormEvent) {
    event.preventDefault();
    search();
  }
  return (
    <>
      <form
        onSubmit={submit}
        className={cn(
          "rounded-[22px] border border-white/55 bg-white p-2 text-[#0b1f33] shadow-[0_24px_80px_rgba(10,28,46,0.20)]",
          compact ? "max-w-none" : "max-w-[1100px]"
        )}
      >
        <div className="flex flex-col gap-2 lg:flex-row">
          <div className="flex shrink-0 rounded-[16px] bg-[#f1eee8] p-1">
            {(["buy", "rent"] as const).map(intent => (
              <button
                type="button"
                key={intent}
                aria-pressed={filters.intent === intent}
                onClick={() => setFilters({ ...filters, intent })}
                className={cn(
                  "fp-button flex-1 rounded-xl px-5 py-3 text-sm font-semibold capitalize",
                  filters.intent === intent
                    ? "bg-[#0b1f33] text-white"
                    : "text-[#617080]"
                )}
              >
                {intent}
              </button>
            ))}
          </div>
          <div className="flex min-h-[52px] min-w-0 flex-1 items-center gap-2 rounded-2xl border border-[#ebe7df] px-4">
            <MapPin size={17} className="shrink-0 text-[#b28d48]" />
            <input
              aria-label="City, neighbourhood or landmark"
              list="finz-locations"
              value={filters.q}
              onChange={e => setFilters({ ...filters, q: e.target.value })}
              placeholder="City, neighbourhood or landmark"
              className="min-w-0 w-full bg-transparent text-sm outline-none"
            />
            <datalist id="finz-locations">
              {[
                ...districts,
                "Rajagiriya",
                "Koggala",
                "Weligama",
                "Havelock City",
              ].map(v => (
                <option key={v} value={v} />
              ))}
            </datalist>
          </div>
          <select
            aria-label="Property type"
            value={filters.kind}
            onChange={e =>
              setFilters({ ...filters, kind: e.target.value, subtype: "" })
            }
            className="min-h-[52px] min-w-0 rounded-2xl border border-[#ebe7df] bg-white px-4 text-sm"
          >
            <option value="all">Any property</option>
            {propertyKinds.map(k => (
              <option key={k}>{k}</option>
            ))}
          </select>
          <select
            aria-label="District"
            value={filters.district}
            onChange={e => setFilters({ ...filters, district: e.target.value })}
            className="min-h-[52px] min-w-0 rounded-2xl border border-[#ebe7df] bg-white px-4 text-sm"
          >
            <option value="all">All districts</option>
            {districts.map(d => (
              <option key={d}>{d}</option>
            ))}
          </select>
          <button
            type="submit"
            className="fp-button inline-flex min-h-[52px] items-center justify-center gap-2 rounded-2xl bg-[#d8b66a] px-5 text-sm font-bold"
          >
            <Search size={17} />
            Search
          </button>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 px-2 pb-1 pt-3">
          <FilterDialog
            open={advanced}
            onOpenChange={setAdvanced}
            value={filters}
            onChange={setFilters}
            onApply={() => search()}
            onReset={() =>
              setFilters(resetSearchFilters(undefined, filters.intent))
            }
            appliedCount={countAdvancedFilters(filters)}
          />
          <button
            type="button"
            ref={mapButton}
            aria-expanded={mapFilters !== null}
            aria-controls="homepage-property-map"
            onClick={() => search("map")}
            className="fp-button inline-flex min-h-11 items-center gap-2 rounded-xl border border-[#e0dacd] bg-[#f9f7f1] px-4 text-sm font-semibold text-[#536570]"
          >
            <Map size={17} />
            Map view
          </button>
        </div>
      </form>
      {mapFilters !== null && (
        <div
          ref={mapPanel}
          className={cn(
            "scroll-mt-5",
            compact ? "max-w-none" : "max-w-[1100px]"
          )}
        >
          <InlinePropertyMap
            filters={mapFilters}
            onClose={() => {
              setMapFilters(null);
              mapButton.current?.focus();
            }}
          />
        </div>
      )}
    </>
  );
}
