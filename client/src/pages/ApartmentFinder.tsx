import { useMemo, useState } from "react";
import { ArrowDownUp, Building2, ChevronLeft, ChevronRight, Grid2X2, List, Map as MapIcon, Plus, Search, SlidersHorizontal, X } from "lucide-react";
import { Link, useLocation, useSearch } from "wouter";
import { SiteHeader } from "@/components/finz/SiteHeader";
import { Footer } from "@/components/finz/Sections";
import { PropertyCard } from "@/components/finz/PropertyCard";
import { PropertyMap } from "@/components/finz/PropertyMap";
import { useDevelopments, useProperties } from "@/lib/marketplace";
import { useVisitorState } from "@/lib/visitorState";
import { formatLkr, type Property } from "@shared/marketplace";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 15;
type FinderView = "list" | "table" | "map";
type Mode = "buy" | "rent";
type BudgetMode = "total" | "monthly";
type StatusKey = "ready" | "offPlan" | "shortTerm";

type DraftFilters = {
  mode: Mode;
  cities: string[];
  cityText: string;
  minBedrooms: string;
  minArea: string;
  maxArea: string;
  budgetMode: BudgetMode;
  minBudget: string;
  maxBudget: string;
  rate: string;
  years: string;
  deposit: string;
  statuses: StatusKey[];
  q: string;
};

export default function ApartmentFinder() {
  const [, navigate] = useLocation();
  const search = useSearch();
  const params = useMemo(() => new URLSearchParams(search), [search]);
  const query = useProperties();
  const developmentsQuery = useDevelopments();
  const { compareIds } = useVisitorState();
  const [filtersOpen, setFiltersOpen] = useState(params.get("filters") === "true");
  const [draft, setDraft] = useState<DraftFilters>(() => readFilters(params));
  const view = isFinderView(params.get("view")) ? params.get("view") as FinderView : "list";
  const sort = params.get("sort") ?? "featured";
  const page = Math.max(1, Number(params.get("page") ?? "1") || 1);

  const apartments = useMemo(() => query.data.filter(property => property.kind === "Apartment"), [query.data]);
  const cities = useMemo(() => Array.from(new Set(apartments.flatMap(property => [property.city, property.district]).filter(Boolean))).sort(), [apartments]);
  const developmentNames = useMemo(() => new Map((developmentsQuery.data ?? []).map(item => [item.id, item.name])), [developmentsQuery.data]);
  const statusCounts = useMemo(() => ({ ready: apartments.filter(item => item.ready).length, offPlan: apartments.filter(item => item.offPlan).length, shortTerm: apartments.filter(item => item.shortTerm).length }), [apartments]);
  const matches = useMemo(() => {
    const minBedrooms = toNumber(draft.minBedrooms);
    const minArea = toNumber(draft.minArea);
    const maxArea = toNumber(draft.maxArea);
    const minBudget = toNumber(draft.minBudget);
    const maxBudget = toNumber(draft.maxBudget);
    const q = draft.q.trim().toLowerCase();
    const selectedCities = draft.cities.map(value => value.toLowerCase());
    return apartments.filter(property => {
      const area = parseArea(property.floorArea);
      const monthly = draft.mode === "buy" ? calculateEmi(property.price * (1 - clamp(toNumber(draft.deposit) ?? 20, 0, 95) / 100), Math.max(0, toNumber(draft.rate) ?? 12), Math.max(1, toNumber(draft.years) ?? 20)) : property.price;
      const locationText = `${property.city} ${property.district} ${property.location}`.toLowerCase();
      const cityMatch = !selectedCities.length || selectedCities.some(city => locationText.includes(city));
      const textMatch = !q || `${property.title} ${property.location} ${property.city} ${property.district}`.toLowerCase().includes(q);
      const budgetMatch = draft.mode === "buy" && draft.budgetMode === "monthly" ? (maxBudget === undefined || monthly <= maxBudget) && (minBudget === undefined || monthly >= minBudget) : (minBudget === undefined || property.price >= minBudget) && (maxBudget === undefined || property.price <= maxBudget);
      const statusMatch = !draft.statuses.length || draft.statuses.some(status => Boolean(property[status]));
      const intentMatch = property.intent === draft.mode;
      return intentMatch && textMatch && cityMatch && (minBedrooms === undefined || property.bedrooms >= minBedrooms) && (minArea === undefined || (area !== undefined && area >= minArea)) && (maxArea === undefined || (area !== undefined && area <= maxArea)) && budgetMatch && statusMatch;
    }).sort((a, b) => sortProperties(a, b, sort));
  }, [apartments, draft, sort]);
  const pageCount = Math.max(1, Math.ceil(matches.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const pageRows = matches.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  function setParam(key: string, value?: string) {
    const next = new URLSearchParams(params);
    if (!value || (key !== "view" && value === "list")) next.delete(key); else next.set(key, value);
    if (key !== "view") next.delete("page");
    navigate(`/apartment-finder${next.toString() ? `?${next.toString()}` : ""}`);
  }
  function apply(event: React.FormEvent) {
    event.preventDefault();
    const next = serializeFilters(draft);
    next.set("view", view);
    if (sort !== "featured") next.set("sort", sort);
    navigate(`/apartment-finder?${next.toString()}`);
  }
  function reset() {
    const fresh = emptyFilters("buy");
    setDraft(fresh);
    navigate("/apartment-finder");
  }
  function addCity() {
    const city = draft.cityText.trim();
    if (!city || draft.cities.some(item => item.toLowerCase() === city.toLowerCase())) return;
    setDraft({ ...draft, cities: [...draft.cities, city], cityText: "" });
  }
  function toggleStatus(status: StatusKey) {
    setDraft({ ...draft, statuses: draft.statuses.includes(status) ? draft.statuses.filter(item => item !== status) : [...draft.statuses, status] });
  }

  const title = draft.mode === "buy" ? "Find an apartment to buy" : "Find an apartment to rent";
  return <div className="min-h-screen bg-[#f7f5f0] text-[#0b1f33]">
    <SiteHeader solid />
    <main className="mx-auto max-w-[1320px] px-5 py-8 lg:px-8">
      <div className="max-w-3xl"><p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#ad8436]">Apartment Finder</p><h1 className="mt-3 font-display text-[42px] font-semibold leading-[1.02] tracking-[-0.055em] sm:text-[56px]">A sharper way to search apartment inventory.</h1><p className="mt-4 max-w-2xl text-sm leading-7 text-[#72808a]">Search the active apartment records currently returned by FinzProperty. Add cities, compare affordability assumptions, and switch between list, table, and locality map views.</p></div>
      <form onSubmit={apply} className="mt-8 rounded-[22px] border border-[#e7e2d9] bg-white p-3 shadow-sm">
        <div className="flex flex-col gap-2 lg:flex-row"><div className="flex rounded-[15px] bg-[#f1eee8] p-1" role="tablist" aria-label="Apartment mode"><button type="button" role="tab" aria-selected={draft.mode === "buy"} onClick={() => setDraft({ ...draft, mode: "buy", budgetMode: "total" })} className={cn("rounded-xl px-6 py-3 text-sm font-semibold", draft.mode === "buy" ? "bg-[#0b1f33] text-white" : "text-[#71808b] hover:text-[#0b1f33]")}>Buy</button><button type="button" role="tab" aria-selected={draft.mode === "rent"} onClick={() => setDraft({ ...draft, mode: "rent", budgetMode: "total" })} className={cn("rounded-xl px-6 py-3 text-sm font-semibold", draft.mode === "rent" ? "bg-[#0b1f33] text-white" : "text-[#71808b] hover:text-[#0b1f33]")}>Rent</button></div><label className="flex min-h-[50px] min-w-0 flex-1 items-center gap-2 rounded-[15px] border border-[#ece8e1] px-4"><Search size={17} className="shrink-0 text-[#a98136]" /><span className="sr-only">Search apartments</span><input aria-label="Search apartments" value={draft.q} onChange={event => setDraft({ ...draft, q: event.target.value })} placeholder="Project, locality or keyword" className="w-full min-w-0 bg-transparent text-sm outline-none" /></label><button type="submit" className="min-h-[50px] rounded-[15px] bg-[#d8b66a] px-7 text-sm font-bold text-[#0b1f33]">View apartments</button></div>
        <div className="mt-3 grid gap-2 md:grid-cols-[1.3fr_1fr_1fr_auto]"><div className="flex min-h-12 items-center gap-2 rounded-[15px] border border-[#ece8e1] px-3"><span className="text-xs text-[#899399]">Cities</span><div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">{draft.cities.map(city => <button type="button" key={city} onClick={() => setDraft({ ...draft, cities: draft.cities.filter(item => item !== city) })} className="inline-flex items-center gap-1 rounded-full bg-[#f4edda] px-2.5 py-1 text-[11px] font-semibold text-[#765927]">{city}<X size={12} /></button>)}<input aria-label="Add city or district" value={draft.cityText} onChange={event => setDraft({ ...draft, cityText: event.target.value })} onKeyDown={event => { if (event.key === "Enter") { event.preventDefault(); addCity(); } }} placeholder={draft.cities.length ? "Add another" : "City or district"} className="min-w-[110px] flex-1 bg-transparent text-sm outline-none" /></div><button type="button" aria-label="Add city" onClick={addCity} className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#f4f1eb] text-[#9b742b]"><Plus size={15} /></button></div><Select label="Bedrooms" value={draft.minBedrooms} onChange={value => setDraft({ ...draft, minBedrooms: value })} options={["1", "2", "3", "4", "5"]} empty="Any bedrooms" suffix="+" /><div className="grid grid-cols-2 gap-2"><NumberInput label="Min sq ft" value={draft.minArea} onChange={value => setDraft({ ...draft, minArea: value })} /><NumberInput label="Max sq ft" value={draft.maxArea} onChange={value => setDraft({ ...draft, maxArea: value })} /></div><button type="button" onClick={() => setFiltersOpen(!filtersOpen)} aria-expanded={filtersOpen} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[15px] border border-[#e7e2d9] px-4 text-xs font-semibold text-[#66757f]"><SlidersHorizontal size={15} /> Filters</button></div>
        {filtersOpen && <div className="mt-3 border-t border-[#eee9e1] pt-4"><div className="grid gap-4 lg:grid-cols-[1.2fr_1fr_1fr]">
          <fieldset><legend className="text-xs font-bold uppercase tracking-[0.12em] text-[#7e8b92]">{draft.mode === "buy" ? "Budget or repayment" : "Monthly rent"}</legend>{draft.mode === "buy" && <div className="mt-2 flex rounded-xl bg-[#f4f1eb] p-1"><button type="button" onClick={() => setDraft({ ...draft, budgetMode: "total" })} className={cn("flex-1 rounded-lg px-3 py-2 text-xs font-semibold", draft.budgetMode === "total" && "bg-white shadow-sm")}>Total budget</button><button type="button" onClick={() => setDraft({ ...draft, budgetMode: "monthly" })} className={cn("flex-1 rounded-lg px-3 py-2 text-xs font-semibold", draft.budgetMode === "monthly" && "bg-white shadow-sm")}>Monthly payment</button></div>}<div className="mt-2 grid grid-cols-2 gap-2"><NumberInput label={draft.mode === "buy" && draft.budgetMode === "total" ? "Min total LKR" : "Min monthly LKR"} value={draft.minBudget} onChange={value => setDraft({ ...draft, minBudget: value })} /><NumberInput label={draft.mode === "buy" && draft.budgetMode === "total" ? "Max total LKR" : "Max monthly LKR"} value={draft.maxBudget} onChange={value => setDraft({ ...draft, maxBudget: value })} /></div></fieldset>
          <fieldset><legend className="text-xs font-bold uppercase tracking-[0.12em] text-[#7e8b92]">Affordability assumptions</legend><div className="mt-2 grid gap-2 sm:grid-cols-3 lg:grid-cols-1"><div className="grid grid-cols-3 gap-2"><NumberInput label="Rate %" value={draft.rate} onChange={value => setDraft({ ...draft, rate: value })} /><NumberInput label="Years" value={draft.years} onChange={value => setDraft({ ...draft, years: value })} /><NumberInput label="Deposit %" value={draft.deposit} onChange={value => setDraft({ ...draft, deposit: value })} /></div></div><p className="mt-2 text-[11px] leading-5 text-[#879198]">Illustrative math only; no bank rate or offer is represented.</p></fieldset>
          <fieldset><legend className="text-xs font-bold uppercase tracking-[0.12em] text-[#7e8b92]">Available metadata</legend><div className="mt-2 flex flex-wrap gap-2">{([ ["ready", "Ready", statusCounts.ready], ["offPlan", "Off-plan", statusCounts.offPlan], ["shortTerm", "Short-term", statusCounts.shortTerm] ] as const).map(([key, label, count]) => <button type="button" key={key} disabled={count === 0} aria-pressed={draft.statuses.includes(key)} onClick={() => toggleStatus(key)} className={cn("rounded-full border px-3 py-2 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-40", draft.statuses.includes(key) ? "border-[#0b1f33] bg-[#0b1f33] text-white" : "border-[#e7e2d9] text-[#60717b]")}>{label} · {count}</button>)}</div><p className="mt-2 text-[11px] leading-5 text-[#879198]">Sold/rented history is not in the active public feed, so those filters are not offered.</p></fieldset>
        </div><div className="mt-4 flex flex-wrap items-center gap-3"><button type="submit" className="rounded-full bg-[#0b1f33] px-5 py-2.5 text-xs font-semibold text-white">Apply filters</button><button type="button" onClick={reset} className="inline-flex items-center gap-1 text-xs font-semibold text-[#7c8991]">Clear all <X size={13} /></button></div></div>}
      </form>
      <div className="my-6 flex flex-wrap items-center justify-between gap-3"><p className="text-sm"><strong>{matches.length}</strong> matching apartment record{matches.length === 1 ? "" : "s"}{matches.length > 0 && view !== "map" && <span className="text-[#78858d]"> · Showing {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, matches.length)}</span>}</p><div className="flex flex-wrap items-center gap-3"><Link href="/compare" className="text-xs font-semibold text-[#9b742b]">Compare selected ({compareIds.length}/4)</Link><label className="flex items-center gap-2 text-xs text-[#65747f]"><ArrowDownUp size={14} /><span className="sr-only">Sort apartments</span><select aria-label="Sort apartments" value={sort} onChange={event => setParam("sort", event.target.value)} className="max-w-[160px] bg-transparent outline-none"><option value="featured">Featured first</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option><option value="area-high">Largest area</option></select></label><div className="flex items-center gap-1 rounded-xl bg-[#f4f1eb] p-1" aria-label="Apartment view selector">{([ ["list", List], ["table", Grid2X2], ["map", MapIcon] ] as const).map(([key, Icon]) => <button key={key} type="button" aria-label={`${key} view`} aria-pressed={view === key} onClick={() => setParam("view", key)} className={cn("grid h-9 w-10 place-items-center rounded-lg text-[#71808b]", view === key && "bg-[#0b1f33] text-white")}><Icon size={15} /></button>)}</div></div></div>
      {query.isLoading ? <StateBox label="Loading active apartment records…" /> : query.error ? <ErrorState onRetry={() => void query.refetch()} /> : view === "map" ? <PropertyMap items={matches.map(property => ({ id: property.id, title: property.title, location: property.location, image: property.image, price: property.price, intent: property.intent, href: `/properties/${property.slug}` }))} /> : matches.length ? <>{view === "table" ? <ApartmentTable properties={pageRows} developmentNames={developmentNames} /> : <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{pageRows.map(property => <PropertyCard key={property.id} property={property} />)}</div>}{matches.length > PAGE_SIZE && <Pagination page={currentPage} pageCount={pageCount} onPage={value => setParam("page", String(value))} />}</> : <EmptyState onReset={reset} />}
    </main>
    <Footer />
  </div>;
}

function ApartmentTable({ properties, developmentNames }: { properties: Property[]; developmentNames: Map<number, string> }) { return <div className="overflow-x-auto rounded-[22px] border border-[#e7e2d9] bg-white"><table className="w-full min-w-[980px] text-left text-sm"><thead className="border-b border-[#eee9e1] text-[11px] uppercase tracking-[0.13em] text-[#8b969b]"><tr><th className="px-5 py-4">Apartment</th><th className="py-4 pr-5">Project association</th><th className="py-4 pr-5">Location</th><th className="py-4 pr-5">Beds / baths</th><th className="py-4 pr-5">Area</th><th className="py-4 pr-5">Asking</th><th className="py-4 pr-5">Est. monthly</th><th className="py-4">Details</th></tr></thead><tbody className="divide-y divide-[#f0ece6]">{properties.map(property => <tr key={property.id}><td className="px-5 py-4"><Link href={`/properties/${property.slug}`} className="font-semibold hover:text-[#9b742b]">{property.title}</Link></td><td className="py-4 pr-5">{property.developmentId ? developmentNames.get(property.developmentId) ?? "Project unavailable" : "Unassociated apartment"}</td><td className="py-4 pr-5">{property.location}</td><td className="py-4 pr-5">{property.bedrooms || "—"} / {property.bathrooms || "—"}</td><td className="py-4 pr-5">{property.floorArea || "Unavailable"}</td><td className="py-4 pr-5 font-semibold">{formatLkr(property.price, property.intent)}</td><td className="py-4 pr-5">{formatLkr(Math.round(estimatedMonthly(property)), "rent")}</td><td className="py-4"><Link href={`/properties/${property.slug}`} className="text-xs font-semibold text-[#9b742b]">Open <ArrowRightIcon /></Link></td></tr>)}</tbody></table></div>; }
function ArrowRightIcon() { return <span aria-hidden="true">→</span>; }
function Select({ label, value, onChange, options, empty, suffix = "" }: { label: string; value: string; onChange: (value: string) => void; options: string[]; empty: string; suffix?: string }) { return <label className="flex min-h-12 items-center rounded-[15px] border border-[#ece8e1] px-3"><span className="sr-only">{label}</span><select aria-label={label} value={value} onChange={event => onChange(event.target.value)} className="w-full bg-transparent text-sm outline-none"><option value="">{empty}</option>{options.map(option => <option key={option} value={option}>{option}{suffix}</option>)}</select></label>; }
function NumberInput({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) { return <label className="flex min-h-11 min-w-0 items-center rounded-[13px] border border-[#ece8e1] px-3"><span className="sr-only">{label}</span><input aria-label={label} type="number" min="0" value={value} onChange={event => onChange(event.target.value)} placeholder={label} className="min-w-0 w-full bg-transparent text-sm outline-none" /></label>; }
function Pagination({ page, pageCount, onPage }: { page: number; pageCount: number; onPage: (page: number) => void }) { return <nav aria-label="Apartment result pages" className="mt-8 flex flex-wrap justify-center gap-2"><button type="button" disabled={page === 1} onClick={() => onPage(page - 1)} className="inline-flex items-center gap-1 rounded-full border bg-white px-4 py-2 text-sm disabled:opacity-30"><ChevronLeft size={15} /> Previous</button>{Array.from({ length: pageCount }, (_, index) => index + 1).filter(item => Math.abs(item - page) <= 2 || item === 1 || item === pageCount).map(item => <button type="button" key={item} aria-current={item === page ? "page" : undefined} onClick={() => onPage(item)} className={cn("h-10 w-10 rounded-full border bg-white text-sm", item === page && "bg-[#0b1f33] text-white")}>{item}</button>)}<button type="button" disabled={page === pageCount} onClick={() => onPage(page + 1)} className="inline-flex items-center gap-1 rounded-full border bg-white px-4 py-2 text-sm disabled:opacity-30">Next <ChevronRight size={15} /></button></nav>; }
function StateBox({ label }: { label: string }) { return <div className="rounded-[24px] border border-[#e7e2d9] bg-white p-16 text-center text-sm text-[#6f7c84]">{label}</div>; }
function ErrorState({ onRetry }: { onRetry: () => void }) { return <div role="alert" className="rounded-[24px] border border-[#eadbd5] bg-white p-12 text-center"><h2 className="font-display text-2xl font-semibold">We couldn’t load the apartment inventory.</h2><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#7b8890]">No substitute records are shown. Please retry the live query.</p><button type="button" onClick={onRetry} className="mt-5 rounded-full bg-[#0b1f33] px-5 py-2.5 text-sm font-semibold text-white">Retry</button></div>; }
function EmptyState({ onReset }: { onReset: () => void }) { return <div className="rounded-[24px] border border-dashed border-[#d8d0c2] bg-white px-6 py-16 text-center"><Building2 size={28} className="mx-auto text-[#a98136]" /><h2 className="mt-4 font-display text-2xl font-semibold">No matching apartments</h2><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#7d898f]">Broaden the city, budget, bedroom or area filters. The active feed does not include sold or rented history.</p><button type="button" onClick={onReset} className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#0b1f33] px-5 py-3 text-sm font-semibold text-white">Clear filters <X size={15} /></button></div>; }
function readFilters(params: URLSearchParams): DraftFilters { const mode = params.get("mode") === "rent" ? "rent" : "buy"; return { mode, cities: params.get("cities")?.split(",").filter(Boolean) ?? [], cityText: "", minBedrooms: params.get("bedrooms") ?? "", minArea: params.get("minArea") ?? "", maxArea: params.get("maxArea") ?? "", budgetMode: params.get("budgetMode") === "monthly" ? "monthly" : "total", minBudget: params.get("minBudget") ?? "", maxBudget: params.get("maxBudget") ?? "", rate: params.get("rate") ?? "12", years: params.get("years") ?? "20", deposit: params.get("deposit") ?? "20", statuses: (params.get("statuses")?.split(",").filter(item => item === "ready" || item === "offPlan" || item === "shortTerm") ?? []) as StatusKey[], q: params.get("q") ?? "" }; }
function emptyFilters(mode: Mode): DraftFilters { return { mode, cities: [], cityText: "", minBedrooms: "", minArea: "", maxArea: "", budgetMode: "total", minBudget: "", maxBudget: "", rate: "12", years: "20", deposit: "20", statuses: [], q: "" }; }
function serializeFilters(filters: DraftFilters) { const next = new URLSearchParams(); next.set("mode", filters.mode); if (filters.q) next.set("q", filters.q); if (filters.cities.length) next.set("cities", filters.cities.join(",")); if (filters.minBedrooms) next.set("bedrooms", filters.minBedrooms); if (filters.minArea) next.set("minArea", filters.minArea); if (filters.maxArea) next.set("maxArea", filters.maxArea); if (filters.budgetMode !== "total") next.set("budgetMode", filters.budgetMode); if (filters.minBudget) next.set("minBudget", filters.minBudget); if (filters.maxBudget) next.set("maxBudget", filters.maxBudget); if (filters.rate !== "12") next.set("rate", filters.rate); if (filters.years !== "20") next.set("years", filters.years); if (filters.deposit !== "20") next.set("deposit", filters.deposit); if (filters.statuses.length) next.set("statuses", filters.statuses.join(",")); if (filtersOpenPlaceholder()) next.set("filters", "true"); return next; }
function filtersOpenPlaceholder() { return false; }
function isFinderView(value: string | null): value is FinderView { return value === "list" || value === "table" || value === "map"; }
function parseArea(value?: string) { if (!value) return undefined; const match = value.replace(/,/g, "").match(/[\d.]+/); return match ? Number(match[0]) : undefined; }
function toNumber(value?: string) { if (!value?.trim()) return undefined; const parsed = Number(value.replace(/,/g, "")); return Number.isFinite(parsed) ? parsed : undefined; }
function clamp(value: number, min: number, max: number) { return Math.min(max, Math.max(min, value)); }
function calculateEmi(principal: number, annualRate: number, years: number) { const months = years * 12; if (principal <= 0) return 0; if (annualRate <= 0) return principal / months; const rate = annualRate / 100 / 12; return principal * rate * (1 + rate) ** months / ((1 + rate) ** months - 1); }
function estimatedMonthly(property: Property) { return property.intent === "rent" ? property.price : calculateEmi(property.price * 0.8, 12, 20); }
function sortProperties(a: Property, b: Property, sort: string) { if (sort === "price-low") return a.price - b.price; if (sort === "price-high") return b.price - a.price; if (sort === "area-high") return (parseArea(b.floorArea) ?? 0) - (parseArea(a.floorArea) ?? 0); return Number(Boolean(b.featured)) - Number(Boolean(a.featured)); }
