import { useMemo, useState } from "react";
import { ArrowRight, Check, ChevronLeft, ChevronRight, ExternalLink, FileText, Grid2X2, List, Map, MapPin, Phone, RefreshCw, Search, ShieldCheck } from "lucide-react";
import { Link, useLocation, useSearch } from "wouter";
import { SiteHeader } from "@/components/finz/SiteHeader";
import { Footer } from "@/components/finz/Sections";
import { PropertyMap } from "@/components/finz/PropertyMap";
import { useDevelopments } from "@/lib/marketplace";
import { trpc } from "@/lib/trpc";
import { formatLkr, type Development, type Property } from "@shared/marketplace";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 15;
type DirectoryView = "list" | "table" | "map";
type RequestIntent = "details" | "availability" | "brochure" | "callback";

export function DevelopmentsPage() {
  const [, navigate] = useLocation();
  const search = useSearch();
  const params = useMemo(() => new URLSearchParams(search), [search]);
  const query = useDevelopments();
  const [draft, setDraft] = useState({
    q: params.get("q") ?? "",
    city: params.get("city") ?? "all",
    status: params.get("status") ?? "all",
    minPrice: params.get("minPrice") ?? "",
    maxPrice: params.get("maxPrice") ?? "",
  });
  const view = (params.get("view") as DirectoryView | null) ?? "list";
  const page = Math.max(1, Number(params.get("page") ?? "1") || 1);

  const cities = useMemo(() => unique(query.data.map(item => item.location)), [query.data]);
  const statuses = useMemo(() => unique(query.data.map(item => item.status)), [query.data]);
  const matches = useMemo(() => {
    const q = draft.q.trim().toLowerCase();
    const min = toNumber(draft.minPrice);
    const max = toNumber(draft.maxPrice);
    return query.data.filter(item => {
      const textMatch = !q || `${item.name} ${item.location} ${item.developer} ${item.status}`.toLowerCase().includes(q);
      const cityMatch = draft.city === "all" || item.location === draft.city;
      const statusMatch = draft.status === "all" || item.status === draft.status;
      const minMatch = min === undefined || item.fromPrice >= min;
      const maxMatch = max === undefined || item.fromPrice <= max;
      return textMatch && cityMatch && statusMatch && minMatch && maxMatch;
    });
  }, [draft, query.data]);
  const pageCount = Math.max(1, Math.ceil(matches.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const pageRows = matches.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  function setParam(key: string, value?: string) {
    const next = new URLSearchParams(params);
    if (!value || value === "all") next.delete(key); else next.set(key, value);
    if (key !== "view") next.delete("page");
    navigate(`/new-developments${next.toString() ? `?${next.toString()}` : ""}`);
  }
  function apply(event: React.FormEvent) {
    event.preventDefault();
    const next = new URLSearchParams();
    for (const [key, value] of Object.entries(draft)) if (value && value !== "all") next.set(key, value);
    if (view !== "list") next.set("view", view);
    navigate(`/new-developments${next.toString() ? `?${next.toString()}` : ""}`);
  }
  function reset() {
    setDraft({ q: "", city: "all", status: "all", minPrice: "", maxPrice: "" });
    navigate("/new-developments");
  }

  return <div className="min-h-screen bg-[#f7f5f0] text-[#0b1f33]">
    <SiteHeader solid />
    <main className="mx-auto max-w-[1320px] px-5 py-8 lg:px-8">
      <div className="max-w-3xl">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#ad8436]">Development directory</p>
        <h1 className="mt-3 font-display text-[42px] font-semibold leading-[1.02] tracking-[-0.055em] sm:text-[56px]">Projects worth a closer look.</h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-[#72808a]">Browse the development records currently published in FinzProperty. Project metadata is shown as supplied; unavailable fields stay unavailable.</p>
      </div>
      {query.data.some(item => item.isDemo) && <DemoNotice />}
      <form onSubmit={apply} className="mt-8 rounded-[22px] border border-[#e7e2d9] bg-white p-3 shadow-sm">
        <div className="grid gap-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr_auto]">
          <label className="flex min-h-12 items-center gap-2 rounded-[15px] border border-[#ece8e1] px-4 text-sm"><Search size={16} className="text-[#ad8436]" /><span className="sr-only">Search developments</span><input aria-label="Search developments" value={draft.q} onChange={event => setDraft({ ...draft, q: event.target.value })} placeholder="Project, developer or locality" className="w-full bg-transparent outline-none" /></label>
          <SelectField label="City or locality" value={draft.city} onChange={value => setDraft({ ...draft, city: value })} options={cities} />
          <SelectField label="Status" value={draft.status} onChange={value => setDraft({ ...draft, status: value })} options={statuses} />
          <div className="flex min-h-12 items-center gap-2 rounded-[15px] border border-[#ece8e1] px-3"><span className="text-xs text-[#8a959a]">From LKR</span><input aria-label="Minimum starting price" inputMode="numeric" value={draft.minPrice} onChange={event => setDraft({ ...draft, minPrice: event.target.value })} placeholder="Any" className="min-w-0 w-full bg-transparent text-sm outline-none" /></div>
          <button type="submit" className="min-h-12 rounded-[15px] bg-[#d8b66a] px-6 text-sm font-bold text-[#0b1f33]">Search</button>
        </div>
        <div className="mt-2 grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
          <div className="flex min-h-11 items-center gap-2 rounded-[13px] border border-[#ece8e1] px-3"><span className="text-xs text-[#8a959a]">To LKR</span><input aria-label="Maximum starting price" inputMode="numeric" value={draft.maxPrice} onChange={event => setDraft({ ...draft, maxPrice: event.target.value })} placeholder="Any" className="min-w-0 w-full bg-transparent text-sm outline-none" /></div>
          <button type="button" onClick={reset} className="rounded-[13px] border border-[#e7e2d9] px-4 text-xs font-semibold text-[#6f7c84] hover:border-[#d8b66a]">Clear filters</button>
          <div className="flex items-center justify-end gap-1 rounded-[13px] bg-[#f4f1eb] p-1" aria-label="Development view selector">{([ ["list", List], ["table", Grid2X2], ["map", Map] ] as const).map(([key, Icon]) => <button key={key} type="button" aria-label={`${key} view`} aria-pressed={view === key} onClick={() => setParam("view", key)} className={cn("grid h-9 w-10 place-items-center rounded-lg text-[#71808b]", view === key && "bg-[#0b1f33] text-white")}><Icon size={15} /></button>)}</div>
        </div>
      </form>
      <div className="my-6 flex flex-wrap items-center justify-between gap-3"><p className="text-sm"><strong>{matches.length}</strong> matching project records{matches.length > 0 && view !== "map" && <span className="text-[#78858d]"> · Showing {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, matches.length)}</span>}</p><p className="text-xs text-[#849097]">Results reflect the current project catalog.</p></div>
      {query.isLoading ? <LoadingState label="Loading development records…" /> : query.error ? <ErrorState onRetry={() => void query.refetch()} /> : view === "map" ? <DevelopmentMap items={matches} /> : matches.length ? <>{view === "table" ? <DevelopmentTable items={pageRows} /> : <div className="space-y-4">{pageRows.map(item => <DevelopmentRow key={item.id} development={item} />)}</div>}{matches.length > PAGE_SIZE && <Pagination page={currentPage} pageCount={pageCount} onPage={value => setParam("page", String(value))} />}</> : <EmptyState onReset={reset} />}
    </main>
    <Footer />
  </div>;
}

export function DevelopmentDetails({ slug }: { slug: string }) {
  const developmentQuery = trpc.portal.development.useQuery({ slug }, { staleTime: 60_000, retry: false });
  const development = developmentQuery.data;
  const listingsQuery = trpc.portal.projectListings.useQuery({ developmentId: development?.id ?? 0 }, { enabled: Boolean(development), staleTime: 60_000, retry: false });
  const submitRequest = trpc.portal.submitRequest.useMutation();
  const [intent, setIntent] = useState<RequestIntent>("details");
  const [sent, setSent] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [loan, setLoan] = useState({ price: "", deposit: "20", rate: "12", years: "20" });

  if (developmentQuery.isLoading) return <PageShell><LoadingState label="Loading project details…" /></PageShell>;
  if (developmentQuery.error) return <PageShell><ErrorState onRetry={() => void developmentQuery.refetch()} /></PageShell>;
  if (!development) return <PageShell><NotFoundDevelopment /></PageShell>;

  const developmentId = development.id;
  const projectListings = (listingsQuery.data ?? []) as Property[];
  const propertyValue = toNumber(loan.price) ?? development.fromPrice;
  const deposit = Math.min(95, Math.max(0, toNumber(loan.deposit) ?? 20));
  const annualRate = Math.max(0, toNumber(loan.rate) ?? 12);
  const years = Math.max(1, toNumber(loan.years) ?? 20);
  const monthly = calculateEmi(propertyValue * (1 - deposit / 100), annualRate, years);
  const mapItems = [{ id: development.id, title: development.name, location: development.location, image: development.image, price: development.fromPrice, href: `/developments/${development.slug}` }];
  const mapHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${development.location}, Sri Lanka`)}`;

  async function request(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    try {
      const extra = intent === "brochure" ? "Brochure request" : intent === "availability" ? "Availability request" : intent === "callback" ? "Callback requested" : "Project details request";
      const result = await submitRequest.mutateAsync({ type: "project", developmentId, name: form.name, email: form.email, phone: form.phone || undefined, message: `${form.message}\n\nRequest intent: ${extra}` });
      setSent(result.id);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "We couldn't record the request. Please try again.");
    }
  }

  return <PageShell>
    <main className="mx-auto max-w-[1320px] px-5 py-8 lg:px-8">
      <Link href="/new-developments" className="inline-flex items-center gap-2 text-xs font-semibold text-[#6d7b84]">← All developments</Link>
      <section className="relative mt-6 min-h-[430px] overflow-hidden rounded-[28px] bg-[#0b1f33]">
        <img src={development.image} alt={development.name} className="absolute inset-0 h-full w-full object-cover opacity-65" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0b1f33]/95 via-[#0b1f33]/60 to-transparent" />
        <div className="relative flex min-h-[430px] max-w-2xl flex-col justify-end p-7 text-white sm:p-12"><div className="flex flex-wrap gap-2"><span className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-[#f0d99c]">{development.status || "Status unavailable"}</span>{development.isDemo && <span className="rounded-full bg-[#fff3df]/95 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-[#875f22]">Demonstration record</span>}</div><h1 className="mt-5 font-display text-[43px] font-semibold leading-[1.02] tracking-[-0.055em] sm:text-[60px]">{development.name}</h1><p className="mt-4 flex items-center gap-2 text-sm text-white/70"><MapPin size={15} className="text-[#d8b66a]" /> {development.location}</p><p className="mt-5 text-xl font-semibold text-[#f0d99c]">From {formatLkr(development.fromPrice)}</p></div>
      </section>
      <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_390px]">
        <div className="space-y-5">
          <section className="rounded-[24px] border border-[#e7e2d9] bg-white p-6 sm:p-8"><p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#ad8436]">Project overview</p><h2 className="mt-3 font-display text-3xl font-semibold tracking-[-0.04em]">The record, without the guesswork.</h2><p className="mt-4 text-sm leading-7 text-[#697780]">{development.developer ? `${development.developer} is listed as the developer for this project.` : "Developer information is unavailable."} The directory currently records {development.location || "an unavailable locality"} and the advertised starting price below. Other project details are only shown when configured in the catalog.</p><div className="mt-7 grid gap-3 sm:grid-cols-3"><InfoTile label="Developer" value={development.developer || "Unavailable"} /><InfoTile label="Published status" value={development.status || "Unavailable"} /><InfoTile label="Unit information" value={development.units || "Unavailable"} /></div><p className="mt-5 rounded-2xl bg-[#fff8e9] p-4 text-xs leading-5 text-[#7b6537]">Brochures, payment plans, floorplans, completion timing and exact availability are not configured for this project. Use the request form for an enquiry; no download or automatic delivery is claimed.</p></section>
          <section className="rounded-[24px] border border-[#e7e2d9] bg-white p-6 sm:p-8"><div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><div><p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#ad8436]">Linked listings</p><h2 className="mt-2 font-display text-2xl font-semibold">Actual project inventory</h2></div><span className="text-xs text-[#7c898f]">{listingsQuery.isLoading ? "Checking records…" : `${projectListings.length} linked active record${projectListings.length === 1 ? "" : "s"}`}</span></div>{listingsQuery.error ? <p className="mt-5 rounded-xl bg-[#fff0ed] p-4 text-sm text-[#9a4d43]">Linked listings could not be loaded. Retry the page to try again.</p> : projectListings.length ? <div className="mt-5 overflow-x-auto"><table className="w-full min-w-[650px] text-left text-sm"><thead className="border-b border-[#eee9e1] text-[11px] uppercase tracking-[0.12em] text-[#8b969b]"><tr><th className="pb-3 pr-4">Unit / listing</th><th className="pb-3 pr-4">Configuration</th><th className="pb-3 pr-4">Area</th><th className="pb-3 pr-4">Price</th><th className="pb-3">Availability</th></tr></thead><tbody className="divide-y divide-[#f0ece6]">{projectListings.map(property => <tr key={property.id}><td className="py-4 pr-4"><Link href={`/properties/${property.slug}`} className="font-semibold text-[#0b1f33] hover:text-[#a17b34]">{property.title}</Link></td><td className="py-4 pr-4">{property.bedrooms ? `${property.bedrooms} bed · ${property.bathrooms || "—"} bath` : "Unavailable"}</td><td className="py-4 pr-4">{property.floorArea || "Unavailable"}</td><td className="py-4 pr-4 font-semibold">{formatLkr(property.price, property.intent)}</td><td className="py-4">{property.status === "active" ? "Active listing" : "Unavailable"}</td></tr>)}</tbody></table></div> : <p className="mt-5 rounded-2xl bg-[#f7f5f0] p-5 text-sm leading-6 text-[#6f7c84]">No active property records are linked to this development. The catalog does not provide an invented unit matrix or estimated inventory.</p>}</section>
          <section className="rounded-[24px] border border-[#e7e2d9] bg-white p-6 sm:p-8"><div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-full bg-[#f4edda] text-[#a17b34]"><ShieldCheck size={18} /></div><div><p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#ad8436]">Illustrative only</p><h2 className="mt-2 font-display text-2xl font-semibold">Estimate a monthly repayment</h2></div></div><p className="mt-3 text-sm leading-6 text-[#71808a]">This local calculation is not a bank quote or approval. Adjust the assumptions; no lender rates are being represented.</p><div className="mt-6 grid gap-4 sm:grid-cols-2"><NumberField label="Property value (LKR)" value={loan.price || String(development.fromPrice)} onChange={value => setLoan({ ...loan, price: value })} /><NumberField label="Deposit (%)" value={loan.deposit} onChange={value => setLoan({ ...loan, deposit: value })} /><NumberField label="Annual interest (%)" value={loan.rate} onChange={value => setLoan({ ...loan, rate: value })} /><NumberField label="Term (years)" value={loan.years} onChange={value => setLoan({ ...loan, years: value })} /></div><div className="mt-6 grid gap-3 rounded-2xl bg-[#0b1f33] p-5 text-white sm:grid-cols-3"><Metric label="Loan amount" value={formatLkr(Math.round(propertyValue * (1 - deposit / 100)))} /><Metric label="Estimated monthly" value={formatLkr(Math.round(monthly), "rent")} /><Metric label="Total paid" value={formatLkr(Math.round(monthly * years * 12))} /></div><Link href={`/tools/mortgage?price=${encodeURIComponent(String(propertyValue))}`} className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#9b742b]">Open mortgage tools <ArrowRight size={15} /></Link></section>
        </div>
        <aside className="h-fit space-y-5"><section className="rounded-[24px] bg-[#0b1f33] p-6 text-white sm:p-7"><p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#d8b66a]">Request project information</p><h2 className="mt-3 font-display text-2xl font-semibold leading-tight">Ask about this project.</h2><p className="mt-3 text-sm leading-6 text-white/55">Your request is stored in FinzProperty. Automatic email, brochure and developer delivery are not configured.</p>{sent ? <div className="mt-7 rounded-2xl bg-white/10 p-5"><Check size={19} className="text-[#b4d8bd]" /><h3 className="mt-3 font-semibold">Recorded request #{sent}</h3><p className="mt-2 text-sm leading-6 text-white/60">We recorded your request; automatic delivery is not configured.</p><button type="button" onClick={() => setSent(null)} className="mt-4 text-xs font-semibold text-[#f0d99c]">Send another request</button></div> : <form onSubmit={request} className="mt-6 grid gap-3"><label className="text-xs font-semibold text-white/75">What do you need?<select value={intent} onChange={event => setIntent(event.target.value as RequestIntent)} className="mt-1.5 h-11 w-full rounded-xl bg-white/10 px-3 text-sm text-white"><option value="details" className="text-[#0b1f33]">Project details</option><option value="availability" className="text-[#0b1f33]">Availability</option><option value="brochure" className="text-[#0b1f33]">Brochure information</option><option value="callback" className="text-[#0b1f33]">Request a callback</option></select></label><DarkField label="Your name" value={form.name} required onChange={value => setForm({ ...form, name: value })} /><DarkField label="Email address" type="email" value={form.email} required onChange={value => setForm({ ...form, email: value })} /><DarkField label="Phone number" value={form.phone} onChange={value => setForm({ ...form, phone: value })} /><label className="text-xs font-semibold text-white/75">Message<textarea required minLength={10} rows={4} value={form.message} onChange={event => setForm({ ...form, message: event.target.value })} className="mt-1.5 w-full resize-none rounded-xl bg-white/10 p-3 text-sm text-white outline-none placeholder:text-white/35" placeholder="Tell us what you would like to know" /></label>{error && <p role="alert" className="text-xs leading-5 text-[#f2b3a9]">{error}</p>}<button disabled={submitRequest.isPending} className="mt-1 rounded-full bg-[#d8b66a] px-5 py-3 text-sm font-semibold text-[#0b1f33] disabled:opacity-60">{submitRequest.isPending ? "Recording…" : "Record request"}</button></form>}</section><section className="rounded-[24px] border border-[#e7e2d9] bg-white p-6"><p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#ad8436]">Known location</p><h2 className="mt-2 font-display text-xl font-semibold">{development.location || "Location unavailable"}</h2><p className="mt-2 text-sm leading-6 text-[#75828a]">The map uses the published locality, not a verified project boundary or exact address.</p><PropertyMap items={mapItems} /><a href={mapHref} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-[#9b742b]">Open locality in Google Maps <ExternalLink size={13} /></a></section><section className="rounded-[24px] border border-[#e7e2d9] bg-white p-6"><FileText size={20} className="text-[#b18a41]" /><h2 className="mt-3 font-display text-xl font-semibold">Documents and plans</h2><p className="mt-2 text-sm leading-6 text-[#75828a]">Brochure, payment plan and floorplan data are unavailable for this record.</p><button type="button" onClick={() => setIntent("brochure")} className="mt-4 inline-flex items-center gap-2 rounded-full border border-[#dcd6ca] px-4 py-2.5 text-xs font-semibold text-[#53616d]">Request information <ArrowRight size={14} /></button></section></aside>
      </div>
    </main>
  </PageShell>;
}

function PageShell({ children }: { children: React.ReactNode }) { return <div className="min-h-screen bg-[#f7f5f0] text-[#0b1f33]"><SiteHeader solid />{children}<Footer /></div>; }
function DemoNotice() { return <p className="mt-5 flex items-start gap-2 rounded-xl border border-[#e8d6ad] bg-[#fff6e4] px-4 py-3 text-xs leading-5 text-[#7a612e]"><ShieldCheck size={15} className="mt-0.5 shrink-0" /> Demonstration project records are shown to illustrate the experience and are not verified live offers.</p>; }
function SelectField({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: string[] }) { return <label className="flex min-h-12 items-center rounded-[15px] border border-[#ece8e1] px-3"><span className="sr-only">{label}</span><select aria-label={label} value={value} onChange={event => onChange(event.target.value)} className="w-full bg-transparent text-sm outline-none"><option value="all">All {label.toLowerCase()}</option>{options.map(option => <option key={option} value={option}>{option}</option>)}</select></label>; }
function DevelopmentRow({ development }: { development: Development }) { return <article className="grid gap-5 rounded-[22px] border border-[#e7e2d9] bg-white p-4 sm:grid-cols-[220px_1fr_auto] sm:items-center"><img src={development.image} alt={development.name} loading="lazy" className="h-44 w-full rounded-[17px] object-cover sm:h-36" /><div><div className="flex flex-wrap gap-2"><span className="rounded-full bg-[#f4edda] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.13em] text-[#8f6b2c]">{development.status || "Status unavailable"}</span>{development.isDemo && <span className="rounded-full bg-[#fff3df] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.13em] text-[#875f22]">Demonstration</span>}</div><h2 className="mt-3 font-display text-2xl font-semibold tracking-[-0.035em]"><Link href={`/developments/${development.slug}`} className="hover:text-[#9b742b]">{development.name}</Link></h2><p className="mt-2 flex items-center gap-1.5 text-sm text-[#75828a]"><MapPin size={14} className="text-[#b18a41]" /> {development.location || "Location unavailable"}</p><p className="mt-3 text-xs leading-5 text-[#7b878e]">Developer: {development.developer || "Unavailable"} · Units: {development.units || "Unavailable"}</p></div><div className="sm:text-right"><p className="text-xs text-[#899399]">Starting price</p><p className="mt-1 text-lg font-bold">{formatLkr(development.fromPrice)}</p><Link href={`/developments/${development.slug}`} className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-[#9b742b]">More details <ArrowRight size={14} /></Link></div></article>; }
function DevelopmentTable({ items }: { items: Development[] }) { return <div className="overflow-x-auto rounded-[22px] border border-[#e7e2d9] bg-white"><table className="w-full min-w-[760px] text-left text-sm"><thead className="border-b border-[#eee9e1] text-[11px] uppercase tracking-[0.13em] text-[#8b969b]"><tr><th className="px-5 py-4">Project</th><th className="py-4 pr-5">Locality</th><th className="py-4 pr-5">Developer</th><th className="py-4 pr-5">Status</th><th className="py-4 pr-5">From</th><th className="py-4">Details</th></tr></thead><tbody className="divide-y divide-[#f0ece6]">{items.map(item => <tr key={item.id}><td className="px-5 py-4 font-semibold">{item.name}</td><td className="py-4 pr-5">{item.location || "Unavailable"}</td><td className="py-4 pr-5">{item.developer || "Unavailable"}</td><td className="py-4 pr-5">{item.status || "Unavailable"}</td><td className="py-4 pr-5 font-semibold">{formatLkr(item.fromPrice)}</td><td className="py-4"><Link href={`/developments/${item.slug}`} className="text-xs font-semibold text-[#9b742b]">Open <ArrowRight size={13} className="ml-1 inline" /></Link></td></tr>)}</tbody></table></div>; }
function DevelopmentMap({ items }: { items: Development[] }) { return <PropertyMap items={items.map(item => ({ id: item.id, title: item.name, location: item.location, image: item.image, price: item.fromPrice, href: `/developments/${item.slug}` }))} />; }
function InfoTile({ label, value }: { label: string; value: string }) { return <div className="rounded-2xl bg-[#f7f5f0] p-4"><p className="text-[10px] font-bold uppercase tracking-[0.13em] text-[#9b742b]">{label}</p><p className="mt-2 text-sm font-semibold text-[#243948]">{value}</p></div>; }
function Metric({ label, value }: { label: string; value: string }) { return <div><p className="text-[10px] uppercase tracking-[0.12em] text-white/45">{label}</p><p className="mt-1 text-sm font-semibold text-[#f0d99c]">{value}</p></div>; }
function NumberField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) { return <label className="text-xs font-semibold text-[#56636d]">{label}<input type="number" min="0" value={value} onChange={event => onChange(event.target.value)} className="mt-1.5 h-11 w-full rounded-xl border border-[#e7e2d9] px-3 text-sm font-normal outline-none focus:border-[#c7a455]" /></label>; }
function DarkField({ label, value, onChange, type = "text", required = false }: { label: string; value: string; onChange: (value: string) => void; type?: string; required?: boolean }) { return <label className="text-xs font-semibold text-white/75">{label}<input required={required} type={type} value={value} onChange={event => onChange(event.target.value)} className="mt-1.5 h-11 w-full rounded-xl bg-white/10 px-3 text-sm text-white outline-none placeholder:text-white/35" /></label>; }
function LoadingState({ label }: { label: string }) { return <div className="rounded-[24px] border border-[#e7e2d9] bg-white p-16 text-center text-sm text-[#6f7c84]">{label}</div>; }
function ErrorState({ onRetry }: { onRetry: () => void }) { return <div role="alert" className="rounded-[24px] border border-[#eadbd5] bg-white p-12 text-center"><RefreshCw size={26} className="mx-auto text-[#ad8436]" /><h2 className="mt-4 font-display text-2xl font-semibold">We couldn’t load the project records.</h2><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#7b8890]">No substitute projects are shown. Please try the live query again.</p><button type="button" onClick={onRetry} className="mt-5 rounded-full bg-[#0b1f33] px-5 py-2.5 text-sm font-semibold text-white">Retry</button></div>; }
function EmptyState({ onReset }: { onReset: () => void }) { return <div className="rounded-[24px] border border-dashed border-[#d8d0c2] bg-white px-6 py-16 text-center"><Search size={28} className="mx-auto text-[#a98136]" /><h2 className="mt-4 font-display text-2xl font-semibold">No project records match</h2><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#7d898f]">Try another locality, status or starting-price range. No inferred projects are added to empty results.</p><button type="button" onClick={onReset} className="mt-6 rounded-full bg-[#0b1f33] px-5 py-3 text-sm font-semibold text-white">Clear filters</button></div>; }
function NotFoundDevelopment() { return <div className="rounded-[24px] border border-[#e7e2d9] bg-white p-14 text-center"><h1 className="font-display text-3xl font-semibold">Development not found</h1><p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#6f7c84]">This project is not present in the public catalog.</p><Link href="/new-developments" className="mt-6 inline-flex rounded-full bg-[#0b1f33] px-5 py-3 text-sm font-semibold text-white">Browse developments</Link></div>; }
function Pagination({ page, pageCount, onPage }: { page: number; pageCount: number; onPage: (page: number) => void }) { return <nav aria-label="Development result pages" className="mt-8 flex flex-wrap justify-center gap-2"><button type="button" disabled={page === 1} onClick={() => onPage(page - 1)} className="inline-flex items-center gap-1 rounded-full border bg-white px-4 py-2 text-sm disabled:opacity-30"><ChevronLeft size={15} /> Previous</button>{Array.from({ length: pageCount }, (_, index) => index + 1).filter(item => Math.abs(item - page) <= 2 || item === 1 || item === pageCount).map(item => <button type="button" key={item} aria-current={item === page ? "page" : undefined} onClick={() => onPage(item)} className={cn("h-10 w-10 rounded-full border bg-white text-sm", item === page && "bg-[#0b1f33] text-white")}>{item}</button>)}<button type="button" disabled={page === pageCount} onClick={() => onPage(page + 1)} className="inline-flex items-center gap-1 rounded-full border bg-white px-4 py-2 text-sm disabled:opacity-30">Next <ChevronRight size={15} /></button></nav>; }
function unique(values: string[]) { return Array.from(new Set(values.filter(Boolean))).sort(); }
function toNumber(value: string | null | undefined) { if (!value?.trim()) return undefined; const parsed = Number(value.replace(/,/g, "")); return Number.isFinite(parsed) ? parsed : undefined; }
function calculateEmi(principal: number, annualRate: number, years: number) { const months = years * 12; if (principal <= 0) return 0; if (annualRate <= 0) return principal / months; const rate = annualRate / 100 / 12; return principal * rate * (1 + rate) ** months / ((1 + rate) ** months - 1); }
