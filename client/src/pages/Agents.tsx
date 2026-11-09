import { useMemo, useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  Check,
  MapPin,
  MessageCircle,
  Phone,
  Search,
  ShieldCheck,
  Star,
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { SiteHeader } from "@/components/finz/SiteHeader";
import { Footer, SectionHeading } from "@/components/finz/Sections";
import { PropertyCard } from "@/components/finz/PropertyCard";
import { useAgents, useProperties } from "@/lib/marketplace";
import type { Agent } from "@shared/marketplace";

export default function Agents({ slug }: { slug?: string }) {
  const [location] = useLocation();
  const agentsQuery = useAgents();
  const propertiesQuery = useProperties();
  if (agentsQuery.isLoading || propertiesQuery.isLoading)
    return (
      <PageShell>
        <StateMessage text="Loading agents…" />
      </PageShell>
    );
  if (agentsQuery.error || propertiesQuery.error)
    return (
      <PageShell>
        <StateMessage
          text="We couldn't load the agent directory. Please try again."
          error
        />
      </PageShell>
    );
  if (slug) {
    const selected = agentsQuery.data.find(
      agent => agent.slug === slug || String(agent.id) === slug
    );
    if (!selected)
      return (
        <PageShell>
          <StateMessage text="That agent profile could not be found." error />
        </PageShell>
      );
    return <AgentProfile agent={selected} properties={propertiesQuery.data} />;
  }
  return (
    <AgentDirectory
      agents={agentsQuery.data}
      properties={propertiesQuery.data}
      location={location}
    />
  );
}

function AgentDirectory({
  agents,
  properties,
  location,
}: {
  agents: Agent[];
  properties: ReturnType<typeof useProperties>["data"];
  location: string;
}) {
  const params = new URLSearchParams(location.split("?")[1] ?? "");
  const [search, setSearch] = useState(params.get("q") ?? "");
  const [area, setArea] = useState(params.get("location") ?? "");
  const [category, setCategory] = useState(params.get("category") ?? "all");
  const [page, setPage] = useState(1);
  const activeProperties = useMemo(
    () => properties.filter(property => property.status === "active"),
    [properties]
  );
  const matchesCategory = (agent: Agent) => {
    if (category === "all") return true;
    const rows = activeProperties.filter(
      property => property.agentId === agent.id
    );
    if (category === "residential-sales")
      return rows.some(
        property =>
          property.intent === "buy" &&
          property.kind !== "Land" &&
          property.kind !== "Commercial"
      );
    if (category === "letting-rentals")
      return rows.some(property => property.intent === "rent");
    if (category === "land")
      return rows.some(property => property.kind === "Land");
    return rows.some(property => property.kind === "Commercial");
  };
  const filtered = useMemo(
    () =>
      agents.filter(
        agent =>
          matchesCategory(agent) &&
          `${agent.name} ${agent.company} ${agent.location}`
            .toLowerCase()
            .includes(search.trim().toLowerCase()) &&
          (!area || agent.location.toLowerCase().includes(area.toLowerCase()))
      ),
    [agents, area, category, search, activeProperties]
  );
  const pageSize = 12;
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const visible = filtered.slice((page - 1) * pageSize, page * pageSize);
  const countFor = (agent: Agent) =>
    activeProperties.filter(property => property.agentId === agent.id).length;
  return (
    <div className="min-h-screen bg-[#f7f5f0] text-[#0b1f33]">
      <SiteHeader solid />
      <main className="mx-auto max-w-[1320px] px-5 py-10 lg:px-8">
        <div className="rounded-[28px] bg-[#0b1f33] px-6 py-14 text-white sm:px-10">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#d8b66a]">
            Find your local expert
          </p>
          <h1 className="mt-4 max-w-2xl font-display text-[48px] font-semibold leading-[1.02] tracking-[-0.055em]">
            People who know the market, not just the listing.
          </h1>
          <p className="mt-5 max-w-xl text-sm leading-6 text-white/60">
            Connect with property professionals across Sri Lanka. Verification
            badges only appear when returned by the marketplace.
          </p>
          <div className="mt-8 grid max-w-2xl gap-2 sm:grid-cols-[1fr_180px_auto]">
            <label className="flex items-center gap-2 rounded-2xl bg-white p-2 text-[#0b1f33]">
              <Search size={18} className="ml-3 text-[#a98136]" />
              <input
                value={search}
                onChange={event => setSearch(event.target.value)}
                className="h-11 min-w-0 flex-1 bg-transparent px-2 text-sm outline-none"
                placeholder="Search agents or agencies"
                aria-label="Search agents or agencies"
              />
            </label>
            <input
              value={area}
              onChange={event => setArea(event.target.value)}
              className="h-14 rounded-2xl bg-white px-4 text-sm text-[#0b1f33] outline-none"
              placeholder="Location"
              aria-label="Filter agents by location"
            />
            <button
              type="button"
              onClick={() => setPage(1)}
              className="rounded-xl bg-[#d8b66a] px-5 py-3 text-sm font-semibold text-[#0b1f33]"
            >
              Search
            </button>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {[
              ["all", "All agencies"],
              ["residential-sales", "Residential sales"],
              ["letting-rentals", "Letting / rentals"],
              ["land", "Land"],
              ["commercial", "Commercial"],
            ].map(([value, label]) => (
              <button
                type="button"
                key={value}
                onClick={() => {
                  setCategory(value);
                  setPage(1);
                }}
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${category === value ? "border-[#d8b66a] bg-[#d8b66a] text-[#0b1f33]" : "border-white/20 text-white/70"}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <section className="py-16">
          <SectionHeading
            eyebrow="Agent directory"
            title="A better way to begin a conversation"
            copy="Every profile shows the person behind the property, their local focus, and the homes they currently represent."
          />
          {visible.length ? (
            <>
              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {visible.map(agent => (
                  <AgentCard
                    key={agent.id}
                    agent={agent}
                    activeCount={countFor(agent)}
                  />
                ))}
              </div>
              {pageCount > 1 && (
                <div className="mt-8 flex items-center justify-center gap-3">
                  <button
                    type="button"
                    disabled={page === 1}
                    onClick={() => setPage(current => current - 1)}
                    className="rounded-full border border-[#dcd6ca] px-4 py-2 text-xs font-semibold disabled:opacity-40"
                  >
                    Previous
                  </button>
                  <span className="text-xs text-[#7d898f]">
                    Page {page} of {pageCount}
                  </span>
                  <button
                    type="button"
                    disabled={page === pageCount}
                    onClick={() => setPage(current => current + 1)}
                    className="rounded-full border border-[#dcd6ca] px-4 py-2 text-xs font-semibold disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          ) : (
            <StateMessage text="No agents match those filters." />
          )}
        </section>
        <section className="mb-10 grid gap-4 sm:grid-cols-3">
          {[
            {
              icon: ShieldCheck,
              title: "Clear contact details",
              copy: "Use the phone and WhatsApp links returned on a profile.",
            },
            {
              icon: Star,
              title: "Local expertise",
              copy: "Search by area and specialist focus.",
            },
            {
              icon: Building2,
              title: "Active inventory",
              copy: "See the properties they represent now.",
            },
          ].map(item => (
            <div
              key={item.title}
              className="rounded-[20px] border border-[#e7e2d9] bg-white p-5"
            >
              <item.icon
                className="text-[#ad8436]"
                size={22}
                strokeWidth={1.7}
              />
              <h3 className="mt-6 text-sm font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm text-[#7d898f]">{item.copy}</p>
            </div>
          ))}
        </section>
      </main>
      <Footer />
    </div>
  );
}

function AgentCard({
  agent,
  activeCount,
}: {
  agent: Agent;
  activeCount: number;
}) {
  return (
    <Link
      href={`/agents/${agent.slug}`}
      className="group rounded-[22px] border border-[#e7e2d9] bg-white p-5 transition hover:-translate-y-1 hover:border-[#d4bf8d] hover:shadow-[0_18px_50px_rgba(18,37,53,0.08)]"
    >
      <div className="flex items-start gap-4">
        <img
          src={agent.avatar}
          alt={agent.name}
          loading="lazy"
          className="h-16 w-16 rounded-2xl object-cover"
        />
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <h2 className="truncate font-display text-xl font-semibold tracking-[-0.03em]">
              {agent.name}
            </h2>
            {agent.verified && !agent.isDemo && (
              <BadgeCheck
                aria-label="Verified agent"
                size={16}
                className="shrink-0 text-[#5b8d72]"
              />
            )}
            {agent.isDemo && (
              <span className="rounded-full bg-[#fff3df] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-[#875f22]">
                Demo
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-[#78858d]">{agent.company}</p>
          <p className="mt-2 flex items-center gap-1 text-xs text-[#9b742b]">
            <MapPin size={12} /> {agent.location}
          </p>
        </div>
      </div>
      <p className="mt-5 line-clamp-3 text-sm leading-6 text-[#6f7d86]">
        {agent.bio}
      </p>
      <div className="mt-5 flex items-center justify-between border-t border-[#f0ece6] pt-4">
        <span className="text-xs font-semibold text-[#596874]">
          {activeCount} active listings
        </span>
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#a27a31]">
          View profile{" "}
          <ArrowRight
            size={14}
            className="transition group-hover:translate-x-1"
          />
        </span>
      </div>
    </Link>
  );
}

function AgentProfile({
  agent,
  properties,
}: {
  agent: Agent;
  properties: ReturnType<typeof useProperties>["data"];
}) {
  const activeProperties = properties.filter(
    property => property.agentId === agent.id && property.status === "active"
  );
  const [filter, setFilter] = useState("all");
  const phone = agent.phone?.trim();
  const isDemo = Boolean(agent.isDemo);
  const filteredProperties = activeProperties.filter(
    property =>
      filter === "all" ||
      (filter === "sales" && property.intent === "buy") ||
      (filter === "rentals" && property.intent === "rent") ||
      (filter === "land" && property.kind === "Land") ||
      (filter === "commercial" && property.kind === "Commercial")
  );
  return (
    <div className="min-h-screen bg-[#f7f5f0] text-[#0b1f33]">
      <SiteHeader solid />
      <main className="mx-auto max-w-[1320px] px-5 py-10 lg:px-8">
        <Link
          href="/agents"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#6d7b84]"
        >
          <ArrowRight size={15} className="rotate-180" /> All agents
        </Link>
        <div className="mt-6 rounded-[26px] border border-[#e7e2d9] bg-white p-6 sm:p-9">
          <div className="flex flex-col gap-7 sm:flex-row sm:items-center">
            <img
              src={agent.avatar}
              alt={agent.name}
              loading="lazy"
              className="h-28 w-28 rounded-[24px] object-cover"
            />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-display text-[42px] font-semibold tracking-[-0.05em]">
                  {agent.name}
                </h1>
                {agent.verified && !agent.isDemo && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#edf6ef] px-3 py-1 text-xs font-semibold text-[#4f7b60]">
                    <BadgeCheck size={14} /> Verified
                  </span>
                )}
                {agent.isDemo && (
                  <span className="rounded-full bg-[#fff3df] px-3 py-1 text-xs font-semibold text-[#875f22]">
                    Demonstration profile
                  </span>
                )}
              </div>
              <p className="mt-2 text-sm text-[#78858d]">
                {agent.company} · {agent.location}
              </p>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-[#65737d]">
                {agent.bio}
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {phone && !isDemo && (
                  <>
                    <a
                      href={`tel:${phone}`}
                      className="inline-flex items-center gap-2 rounded-full bg-[#0b1f33] px-4 py-2.5 text-xs font-semibold text-white"
                    >
                      <Phone size={14} /> {phone}
                    </a>
                    <a
                      href={`https://wa.me/${phone.replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-full border border-[#dcd6ca] px-4 py-2.5 text-xs font-semibold text-[#53616d]"
                    >
                      <MessageCircle size={14} /> WhatsApp
                    </a>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
        <section className="py-14">
          <SectionHeading
            eyebrow="Active listings"
            title={`${activeProperties.length} properties represented`}
          />
          {isDemo && (
            <p className="mt-3 text-sm text-[#875f22]">
              Demonstration profile: contact actions are disabled and the
              displayed profile data should not be treated as a live agency
              contact.
            </p>
          )}
          <div className="mt-5 flex flex-wrap gap-2">
            {[
              ["all", "All"],
              ["sales", "Sales"],
              ["rentals", "Rentals"],
              ["land", "Land"],
              ["commercial", "Commercial"],
            ].map(([value, label]) => (
              <button
                type="button"
                key={value}
                onClick={() => setFilter(value)}
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${filter === value ? "border-[#0b1f33] bg-[#0b1f33] text-white" : "border-[#dcd6ca] text-[#53616d]"}`}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProperties.length ? (
              filteredProperties.map(property => (
                <PropertyCard key={property.id} property={property} />
              ))
            ) : (
              <p className="text-sm text-[#7d898f]">
                No active listings match this filter.
              </p>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f7f5f0] text-[#0b1f33]">
      <SiteHeader solid />
      <main className="mx-auto max-w-[1320px] px-5 py-10 lg:px-8">
        {children}
      </main>
      <Footer />
    </div>
  );
}
function StateMessage({
  text,
  error = false,
}: {
  text: string;
  error?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-8 text-center text-sm ${error ? "border-[#edc8c2] bg-[#fff8f6] text-[#9a5147]" : "border-dashed border-[#dcd6ca] bg-white text-[#7d898f]"}`}
    >
      {text}
    </div>
  );
}
