import { useEffect, useMemo, useState } from "react";
import {
  ArrowDownUp,
  Grid2X2,
  List,
  Map,
  Save,
  Search,
  SlidersHorizontal,
  X,
  GitCompareArrows,
} from "lucide-react";
import { Link, useLocation, useSearch } from "wouter";
import { toast } from "sonner";
import { SiteHeader } from "@/components/finz/SiteHeader";
import { PropertyCard } from "@/components/finz/PropertyCard";
import { PropertyMap } from "@/components/finz/PropertyMap";
import { FilterDialog } from "@/components/finz/FilterDialog";
import { ViewSwitcher } from "@/components/finz/ViewSwitcher";
import {
  countAdvancedFilters,
  parsePropertyView,
  resetSearchFilters,
  validateSearchFilters,
} from "@shared/searchUi";
import { Footer } from "@/components/finz/Sections";
import { ShareMenu } from "@/components/finz/ShareMenu";
import { useNearbySearch, type NearbyMode } from "@/lib/nearbySearch";
import { useProperties } from "@/lib/marketplace";
import { useVisitorState } from "@/lib/visitorState";
import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { trpc } from "@/lib/trpc";
import {
  districts,
  propertyKinds,
  parseFilters,
  serializeFilters,
  filterProperties,
  sortProperties,
  type SearchFilters,
} from "@shared/search";
import { cn } from "@/lib/utils";

export default function Marketplace({
  preset,
}: {
  preset?: "buy" | "rent" | "land" | "commercial";
}) {
  const [path, navigate] = useLocation();
  const search = useSearch();
  const params = useMemo(() => new URLSearchParams(search), [search]);
  const applied = useMemo(() => parseFilters(params, preset), [params, preset]);
  const [draft, setDraft] = useState<SearchFilters>(applied);
  const mode: NearbyMode = [
    "near-me",
    "school",
    "hospital",
    "apartment",
  ].includes(params.get("mode") || "")
    ? (params.get("mode") as NearbyMode)
    : "keyword";
  const [draftMode, setDraftMode] = useState<NearbyMode>(mode);
  const radius = [1, 2, 3, 4, 5, 10, 20].includes(Number(params.get("radius")))
    ? Number(params.get("radius"))
    : 5;
  const [draftRadius, setDraftRadius] = useState(radius);
  const [filtersOpen, setFiltersOpen] = useState(
    params.get("advanced") === "true"
  );
  const [saveOpen, setSaveOpen] = useState(false);
  const [searchName, setSearchName] = useState("");
  const [frequency, setFrequency] = useState<"daily" | "weekly" | "off">(
    "daily"
  );
  const { user } = useAuth();
  const { compareIds } = useVisitorState();
  const utils = trpc.useUtils();
  const saveSearch = trpc.portal.saveSearch.useMutation({
    onSuccess: () => {
      setSaveOpen(false);
      toast.success(
        "Search saved. Matching properties are available in your account."
      );
      void utils.portal.savedSearches.invalidate();
    },
    onError: e => toast.error(e.message),
  });
  const query = useProperties();
  const sort = params.get("sort") || "featured";
  const view = parsePropertyView(params.get("view"));
  const nearby = useNearbySearch(query.data, mode, applied.q || "", radius);
  const matches = useMemo(
    () =>
      sortProperties(
        filterProperties(query.data, {
          ...applied,
          q: nearby.active ? undefined : applied.q,
        }).filter(p => !nearby.active || nearby.ids.has(p.id)),
        sort
      ),
    [query.data, applied, sort, nearby.active, nearby.ids]
  );
  const pageCount = Math.max(1, Math.ceil(matches.length / 9));
  const page = Math.min(
    pageCount,
    Math.max(1, Number.parseInt(params.get("page") || "1") || 1)
  );
  const pageRows = matches.slice((page - 1) * 9, page * 9);
  useEffect(() => {
    setDraft(applied);
    setDraftMode(mode);
    setDraftRadius(radius);
  }, [applied, mode, radius]);
  const title =
    preset === "rent"
      ? "Homes and spaces for rent"
      : preset === "land"
        ? applied.intent === "rent"
          ? "Land for rent or lease in Sri Lanka"
          : applied.intent === "buy"
            ? "Land for sale in Sri Lanka"
            : "Land for sale, rent or lease"
        : preset === "commercial"
          ? "Commercial property"
          : "Find a place that fits";
  function changeParam(key: string, value: string) {
    const next = new URLSearchParams(params);
    next.set(key, value);
    if (key !== "page") next.delete("page");
    navigate(`${path}?${next}`);
  }
  function apply(e?: React.FormEvent) {
    e?.preventDefault();
    const failure = validateSearchFilters(draft);
    if (failure) {
      toast.error(failure);
      return false;
    }
    const next = serializeFilters(draft);
    if (sort !== "featured") next.set("sort", sort);
    if (view !== "grid") next.set("view", view);
    if (draftMode !== "keyword") next.set("mode", draftMode);
    if (draftMode !== "keyword" && draftMode !== "apartment")
      next.set("radius", String(draftRadius));
    const target =
      preset === "land"
        ? "land"
        : preset === "commercial"
          ? "commercial"
          : draft.intent === "rent"
            ? "rent"
            : "buy";
    navigate(`/${target}?${next}`);
    setFiltersOpen(false);
    return true;
  }
  function resetResults() {
    const cleared = resetSearchFilters(preset, applied.intent);
    setDraft(cleared);
    setDraftMode("keyword");
    setDraftRadius(5);
    const next = serializeFilters(cleared);
    if (view !== "grid") next.set("view", view);
    if (sort !== "featured") next.set("sort", sort);
    navigate(`${path}?${next}`);
  }
  const inputStyle =
    "min-h-[50px] rounded-[15px] border border-[#ece8e1] bg-white px-4 text-sm outline-none";
  return (
    <div className="min-h-screen bg-[#f7f5f0] text-[#0b1f33]">
      <SiteHeader solid />
      <main className="mx-auto max-w-[1320px] px-5 py-8 lg:px-8">
        <div className="flex items-center gap-2 text-xs text-[#869097]">
          <Link href="/">Home</Link>
          <span>/</span>
          <span>Properties</span>
        </div>
        <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-[36px] font-semibold tracking-[-.05em] sm:text-[48px]">
              {title}
            </h1>
            <p className="mt-2 text-sm text-[#74818b]">
              Search by the details that matter. {matches.length} matching
              records.
            </p>
          </div>
          <Link
            href="/locations"
            className="text-sm font-semibold text-[#9b742b]"
          >
            Browse all districts →
          </Link>
        </div>
        {query.data.some(p => p.isDemo) && (
          <p className="mt-5 rounded-xl border border-[#e8d6ad] bg-[#fff6e4] px-4 py-3 text-xs leading-5 text-[#7a612e]">
            Demonstration inventory: photos, prices and advertisers illustrate
            the experience and are not verified live offers.
          </p>
        )}
        <form
          onSubmit={apply}
          className="mt-6 rounded-[22px] border border-[#e7e2d9] bg-white p-2 shadow-sm"
        >
          <div className="mb-2 flex flex-wrap items-center gap-2 px-2 py-2">
            <label className="text-xs text-[#65747f]">
              Search by{" "}
              <select
                value={draftMode}
                onChange={e => setDraftMode(e.target.value as NearbyMode)}
                className="ml-2 rounded-lg border bg-white px-3 py-2"
              >
                <option value="keyword">City / keyword</option>
                <option value="near-me">Near me</option>
                <option value="school">School / university</option>
                <option value="hospital">Hospital / clinic</option>
                <option value="apartment">Apartment name</option>
              </select>
            </label>
            {draftMode !== "keyword" && draftMode !== "apartment" && (
              <label className="text-xs text-[#65747f]">
                Within{" "}
                <select
                  value={draftRadius}
                  onChange={e => setDraftRadius(Number(e.target.value))}
                  className="ml-2 rounded-lg border bg-white px-3 py-2"
                >
                  {[1, 2, 3, 4, 5, 10, 20].map(k => (
                    <option key={k} value={k}>
                      {k} km
                    </option>
                  ))}
                </select>
              </label>
            )}
            {draftMode === "near-me" && (
              <button
                type="button"
                onClick={() => {
                  changeParam("mode", "near-me");
                  nearby.locate();
                }}
                className="rounded-full border px-4 py-2 text-xs"
              >
                {nearby.loading
                  ? "Locating…"
                  : nearby.hasPosition
                    ? "Update my location"
                    : "Use my location"}
              </button>
            )}
            <Link
              href="/apartment-finder"
              className="ml-auto text-xs font-semibold text-[#9b742b]"
            >
              Apartment Finder →
            </Link>
          </div>
          <div className="flex flex-col gap-2 lg:flex-row">
            <div className="flex rounded-[15px] bg-[#f1eee8] p-1">
              {(["buy", "rent"] as const).map(i => (
                <button
                  type="button"
                  key={i}
                  onClick={() => setDraft({ ...draft, intent: i })}
                  className={cn(
                    "rounded-xl px-6 py-3 text-sm font-semibold capitalize",
                    draft.intent === i
                      ? "bg-[#0b1f33] text-white"
                      : "text-[#71808b]"
                  )}
                >
                  {i}
                </button>
              ))}
            </div>
            <div className="flex min-h-[50px] min-w-0 flex-1 items-center gap-2 rounded-[15px] border border-[#ece8e1] px-4">
              <Search size={17} className="shrink-0 text-[#a98136]" />
              <input
                aria-label="Search location or keyword"
                value={draft.q}
                onChange={e => setDraft({ ...draft, q: e.target.value })}
                placeholder="City, neighbourhood or keyword"
                className="w-full min-w-0 bg-transparent text-sm outline-none"
              />
            </div>
            <select
              aria-label="Property type"
              value={draft.kind}
              onChange={e =>
                setDraft({ ...draft, kind: e.target.value, subtype: "" })
              }
              className={inputStyle}
            >
              <option value="all">Any property type</option>
              {propertyKinds.map(k => (
                <option key={k}>{k}</option>
              ))}
            </select>
            <select
              aria-label="District"
              value={draft.district}
              onChange={e => setDraft({ ...draft, district: e.target.value })}
              className={inputStyle}
            >
              <option value="all">All districts</option>
              {districts.map(d => (
                <option key={d}>{d}</option>
              ))}
            </select>
            <button
              type="submit"
              className="fp-button min-h-[50px] rounded-[15px] bg-[#d8b66a] px-6 text-sm font-bold"
            >
              Search
            </button>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 px-2 pb-1 pt-3">
            <FilterDialog
              open={filtersOpen}
              onOpenChange={setFiltersOpen}
              value={draft}
              onChange={setDraft}
              onApply={() => apply()}
              onReset={() => setDraft(resetSearchFilters(preset, draft.intent))}
              appliedCount={countAdvancedFilters(applied)}
              matchingCount={
                filterProperties(query.data, {
                  ...draft,
                  q: nearby.active ? undefined : draft.q,
                }).filter(p => !nearby.active || nearby.ids.has(p.id)).length
              }
            />
            <div className="flex flex-wrap items-center gap-2">
              <ShareMenu title={title} />
              <button
                type="button"
                onClick={() => setSaveOpen(true)}
                className="inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs"
              >
                <Save size={14} />
                Save search
              </button>
              <Link
                href="/compare"
                className="inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs"
              >
                <GitCompareArrows size={14} />
                Compare ({compareIds.length})
              </Link>
            </div>
          </div>
        </form>
        {nearby.active && (
          <div className="mt-4 rounded-xl border bg-white p-4 text-xs leading-5 text-[#65747f]">
            {nearby.loading
              ? "Geocoding recorded localities and checking the selected radius…"
              : nearby.error
                ? nearby.error
                : mode === "near-me" && !nearby.hasPosition
                  ? "Choose Use my location to grant browser permission. Your coordinates stay in this tab and are not stored in your account."
                  : !applied.q && mode !== "near-me"
                    ? "Enter the full school or hospital name and select Search."
                    : `Matches use approximate property localities within ${radius} km; this is not a precise address-distance guarantee.`}
            {nearby.missing > 0 &&
              ` ${nearby.missing} records lack a resolvable locality.`}
          </div>
        )}
        <div className="my-6 flex flex-wrap items-center justify-between gap-4">
          <ViewSwitcher
            value={view}
            onChange={value => changeParam("view", value)}
          />

          <p className="text-sm">
            <strong>{matches.length} properties</strong>
            {matches.length > 0 && (
              <span className="text-[#78858d]">
                {" "}
                · Showing {(page - 1) * 9 + 1}–
                {Math.min(page * 9, matches.length)}
              </span>
            )}
          </p>
          <label className="flex items-center gap-2 text-xs text-[#65747f]">
            <ArrowDownUp size={14} />
            <select
              aria-label="Sort properties"
              value={sort}
              onChange={e => changeParam("sort", e.target.value)}
              className="max-w-[150px] bg-transparent outline-none"
            >
              <option value="featured">Featured first</option>
              <option value="newest">Newest first</option>
              <option value="price-low">Price: low to high</option>
              <option value="price-high">Price: high to low</option>
            </select>
          </label>
        </div>
        {query.isLoading ? (
          <div className="rounded-2xl bg-white p-16 text-center text-sm">
            Loading properties…
          </div>
        ) : query.error ? (
          <div
            role="alert"
            className="rounded-2xl border bg-white p-10 text-center"
          >
            <h2 className="text-xl font-semibold">
              We couldn’t load the inventory.
            </h2>
            <p className="mt-2 text-sm text-[#7b8890]">
              No substitute listings are shown. Please try again.
            </p>
            <button
              onClick={() => query.refetch()}
              className="mt-5 rounded-full bg-[#0b1f33] px-5 py-2 text-sm text-white"
            >
              Retry
            </button>
          </div>
        ) : view === "map" ? (
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
        ) : matches.length ? (
          <div
            className={cn(
              view === "list"
                ? "space-y-4"
                : "grid gap-5 sm:grid-cols-2 xl:grid-cols-3"
            )}
          >
            {pageRows.map(p => (
              <PropertyCard key={p.id} property={p} list={view === "list"} />
            ))}
          </div>
        ) : (
          <div className="rounded-[24px] border border-dashed border-[#d8d0c2] bg-white px-6 py-16 text-center">
            <Search size={28} className="mx-auto text-[#a98136]" />
            <h2 className="mt-4 font-display text-2xl font-semibold">
              No matching properties
            </h2>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#7d898f]">
              Broaden your location or price range. Save the search to revisit
              matching inventory in your account.
            </p>
            <button
              onClick={() => resetResults()}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#0b1f33] px-5 py-3 text-sm text-white"
            >
              Clear filters
              <X size={15} />
            </button>
          </div>
        )}
        {view !== "map" && matches.length > 9 && (
          <nav
            aria-label="Property result pages"
            className="mt-8 flex flex-wrap justify-center gap-2"
          >
            <button
              disabled={page === 1}
              onClick={() => changeParam("page", String(page - 1))}
              className="rounded-full border px-4 py-2 text-sm disabled:opacity-30"
            >
              Previous
            </button>
            {Array.from({ length: pageCount }, (_, i) => i + 1)
              .filter(
                n => Math.abs(n - page) <= 2 || n === 1 || n === pageCount
              )
              .map(n => (
                <button
                  key={n}
                  aria-current={n === page ? "page" : undefined}
                  onClick={() => changeParam("page", String(n))}
                  className={cn(
                    "h-10 w-10 rounded-full border",
                    n === page ? "bg-[#0b1f33] text-white" : "bg-white"
                  )}
                >
                  {n}
                </button>
              ))}
            <button
              disabled={page === pageCount}
              onClick={() => changeParam("page", String(page + 1))}
              className="rounded-full border px-4 py-2 text-sm disabled:opacity-30"
            >
              Next
            </button>
          </nav>
        )}
      </main>
      <Footer />
      {saveOpen && (
        <div
          className="fixed inset-0 z-[80] grid place-items-center bg-[#081d30]/60 p-5"
          role="dialog"
          aria-modal="true"
          aria-label="Save search"
        >
          <div className="w-full max-w-md rounded-2xl bg-white p-6">
            <div className="flex justify-between">
              <h2 className="text-xl font-semibold">Save this search</h2>
              <button
                aria-label="Close save search"
                onClick={() => setSaveOpen(false)}
              >
                <X size={20} />
              </button>
            </div>
            {!user ? (
              <>
                <p className="mt-4 text-sm leading-6 text-[#6c7b86]">
                  Sign in to save searches securely and see matching properties
                  in your account.
                </p>
                <button
                  onClick={() => {
                    try {
                      startLogin();
                    } catch (e) {
                      toast.error(
                        e instanceof Error ? e.message : "Login unavailable"
                      );
                    }
                  }}
                  className="mt-5 rounded-full bg-[#0b1f33] px-5 py-3 text-sm text-white"
                >
                  Sign in / Register
                </button>
              </>
            ) : (
              <form
                onSubmit={e => {
                  e.preventDefault();
                  saveSearch.mutate({
                    name: searchName,
                    query: {
                      ...Object.fromEntries(serializeFilters(applied)),
                      mode,
                      radius: String(radius),
                    },
                    frequency,
                  });
                }}
              >
                <label className="mt-5 block text-sm">
                  Search name
                  <input
                    required
                    minLength={2}
                    maxLength={160}
                    value={searchName}
                    onChange={e => setSearchName(e.target.value)}
                    placeholder="e.g. Colombo family homes"
                    className="mt-2 h-11 w-full rounded-xl border px-3"
                  />
                </label>
                <label className="mt-4 block text-sm">
                  Matching preference
                  <select
                    value={frequency}
                    onChange={e =>
                      setFrequency(e.target.value as typeof frequency)
                    }
                    className="mt-2 h-11 w-full rounded-xl border bg-white px-3"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="off">No alerts</option>
                  </select>
                </label>
                <p className="mt-3 text-xs leading-5 text-[#7b8890]">
                  Matching properties are shown in-app. Email delivery is not
                  configured.
                </p>
                <button
                  disabled={saveSearch.isPending}
                  className="mt-5 rounded-full bg-[#0b1f33] px-5 py-3 text-sm text-white disabled:opacity-50"
                >
                  {saveSearch.isPending ? "Saving…" : "Save search"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
