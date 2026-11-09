import {
  ArrowRight,
  Building2,
  Calculator,
  ChevronRight,
  CircleDollarSign,
  FileText,
  House,
  MapPin,
  Search,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
  Waves,
} from "lucide-react";
import { Link } from "wouter";
import { SiteHeader } from "@/components/finz/SiteHeader";
import { SearchPanel } from "@/components/finz/SearchPanel";
import { DevelopmentCard, PropertyCard } from "@/components/finz/PropertyCard";
import { Footer, SectionHeading } from "@/components/finz/Sections";
import { useDevelopments, useProperties } from "@/lib/marketplace";
import { editorialGuides } from "@shared/editorial";
import { HeroShowcase } from "@/components/finz/HeroShowcase";
import { ContactActions } from "@/components/finz/ContactActions";
import { heroSlides } from "@/lib/heroSlides";

const browse = [
  {
    icon: House,
    label: "Homes for sale",
    sub: "Find somewhere to settle",
    href: "/buy?kind=House",
    color: "bg-[#e6f0ef] text-[#39716c]",
  },
  {
    icon: Building2,
    label: "Apartments for rent",
    sub: "Live well, right where you are",
    href: "/rent?kind=Apartment",
    color: "bg-[#f4eddd] text-[#a27b35]",
  },
  {
    icon: Waves,
    label: "Land by the coast",
    sub: "Make room for what's next",
    href: "/land",
    color: "bg-[#e9eaf1] text-[#5c698d]",
  },
  {
    icon: Sparkles,
    label: "New developments",
    sub: "See what's coming up",
    href: "/new-developments",
    color: "bg-[#f1e7e8] text-[#986267]",
  },
];

export default function Home() {
  const featured = useProperties({ featured: true }).data.slice(0, 4);
  const developments = useDevelopments().data;
  return (
    <div className="min-h-screen bg-[#fffdf9] text-[#0b1f33]">
      <HeroShowcase slides={heroSlides}>
        <SiteHeader />
        <div className="relative mx-auto flex max-w-[1320px] flex-col justify-center px-5 pb-14 pt-[155px] lg:px-8">
          <div className="animate-fade-up max-w-[680px]">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[#f0d99c] backdrop-blur-md">
              <span className="h-1.5 w-1.5 rounded-full bg-[#d8b66a]" />{" "}
              Property, considered
            </div>
            <h1 className="max-w-[730px] font-display text-[54px] font-semibold leading-[0.98] tracking-[-0.06em] text-white sm:text-[68px] lg:text-[82px]">
              Find your place in{" "}
              <span className="text-[#e0c27d]">Sri Lanka.</span>
            </h1>
            <p className="mt-6 max-w-[530px] text-[16px] leading-7 text-white/72 sm:text-[18px]">
              Explore homes, land, apartments, and commercial property. Search
              by location, compare the details, and plan your next move.
            </p>
          </div>
          <div className="mt-12">
            <SearchPanel />
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-x-7 gap-y-3 text-xs font-medium text-white/55">
            <span className="inline-flex items-center gap-2">
              <ShieldCheck size={14} className="text-[#d8b66a]" /> Detailed
              property information
            </span>
            <span className="inline-flex items-center gap-2">
              <MapPin size={14} className="text-[#d8b66a]" /> Every district,
              one place
            </span>
            <span className="inline-flex items-center gap-2">
              <Users size={14} className="text-[#d8b66a]" /> Advertiser
              directory
            </span>
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <span className="text-xs font-medium text-white/60">
              Talk to FinzProperty
            </span>
            <ContactActions
              variant="dark"
              message="Hi FinzProperty, I’d like help finding a property in Sri Lanka."
            />
          </div>
        </div>
      </HeroShowcase>

      <main>
        {(featured.some(p => p.isDemo) || developments.some(d => d.isDemo)) && (
          <div className="border-b border-[#e8d6ad] bg-[#fff6e4] px-5 py-3 text-center text-xs leading-5 text-[#7a612e]">
            Demonstration inventory — listing photos, prices, advertisers and
            projects are illustrative, not verified live offers.
          </div>
        )}
        <section className="border-b border-[#ebe6dd] bg-[#fffdf9]">
          <div className="mx-auto grid max-w-[1320px] gap-3 px-5 py-8 sm:grid-cols-2 lg:grid-cols-4 lg:px-8">
            {browse.map(item => (
              <Link
                href={item.href}
                key={item.label}
                className="group flex items-center gap-3 rounded-2xl p-3 transition hover:bg-[#f7f3ec]"
              >
                <span
                  className={`grid h-11 w-11 shrink-0 place-items-center rounded-[14px] ${item.color}`}
                >
                  <item.icon size={20} strokeWidth={1.7} />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-[#203344]">
                    {item.label}
                  </span>
                  <span className="block truncate text-xs text-[#8b959a]">
                    {item.sub}
                  </span>
                </span>
                <ChevronRight
                  size={16}
                  className="ml-auto text-[#b6b8b4] transition group-hover:translate-x-1 group-hover:text-[#ad8436]"
                />
              </Link>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-[1320px] px-5 py-20 lg:px-8">
          <SectionHeading
            eyebrow="Curated for you"
            title="Properties worth a closer look"
            copy="A considered shortlist of homes, land, and spaces that stand out for their location, quality, or potential."
            action={
              <Link
                href="/buy"
                className="hidden items-center gap-2 text-sm font-semibold text-[#9b742b] hover:text-[#0b1f33] sm:flex"
              >
                View all properties <ArrowRight size={16} />{" "}
              </Link>
            }
          />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map(property => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
          <Link
            href="/buy"
            className="mt-7 flex items-center justify-center gap-2 text-sm font-semibold text-[#9b742b] sm:hidden"
          >
            View all properties <ArrowRight size={16} />
          </Link>
        </section>

        <section className="bg-[#f4f1eb]">
          <div className="mx-auto max-w-[1320px] px-5 py-20 lg:px-8">
            <SectionHeading
              eyebrow="Explore what's next"
              title="New developments, thoughtfully found"
              copy="See the projects shaping the way Sri Lanka will live, work, and grow next."
              action={
                <Link
                  href="/new-developments"
                  className="hidden items-center gap-2 text-sm font-semibold text-[#9b742b] hover:text-[#0b1f33] sm:flex"
                >
                  Explore developments <ArrowRight size={16} />
                </Link>
              }
            />
            <div className="grid gap-5 md:grid-cols-3">
              {developments.map(development => (
                <DevelopmentCard
                  key={development.id}
                  development={development}
                />
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1320px] px-5 py-20 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
            <div>
              <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-[#ad8436]">
                Search with more confidence
              </p>
              <h2 className="max-w-md font-display text-[42px] font-semibold leading-[1.03] tracking-[-0.055em] text-[#0b1f33]">
                The right property is about more than a price.
              </h2>
              <p className="mt-5 max-w-md text-sm leading-6 text-[#71808b]">
                Go beyond the listing. Understand an area, compare the numbers,
                and connect with people who know the market.
              </p>
              <Link
                href="/insights"
                className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#0b1f33] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#163b5c]"
              >
                Explore property insights <ArrowRight size={16} />
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                {
                  icon: TrendingUp,
                  title: "Area price trends",
                  copy: "Explore asking-price context and external market indices.",
                  href: "/tools/market-insights",
                },
                {
                  icon: Calculator,
                  title: "Affordability tools",
                  copy: "Plan your next move with clearer numbers.",
                  href: "/tools/affordability",
                },
                {
                  icon: FileText,
                  title: "Buying guides",
                  copy: "Make sense of every step, from search to keys.",
                  href: "/guides",
                },
                {
                  icon: CircleDollarSign,
                  title: "Investment view",
                  copy: "Explore potential with a more considered lens.",
                  href: "/tools/investment",
                },
              ].map(tool => (
                <Link
                  href={tool.href}
                  key={tool.title}
                  className="fp-card group rounded-[20px] border border-[#e8e3da] bg-white p-5"
                >
                  <tool.icon
                    size={21}
                    strokeWidth={1.7}
                    className="text-[#ae8437]"
                  />
                  <h3 className="mt-7 text-[15px] font-semibold text-[#203344]">
                    {tool.title}
                  </h3>
                  <p className="mt-2 text-sm leading-5 text-[#859097]">
                    {tool.copy}
                  </p>
                  <ArrowRight
                    size={16}
                    className="mt-5 text-[#b7a271] transition group-hover:translate-x-1"
                  />
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1320px] px-5 py-20 lg:px-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[#ad8436]">
                From the journal
              </p>
              <h2 className="font-display text-[34px] font-semibold tracking-[-0.045em] text-[#0b1f33]">
                A little more context
              </h2>
            </div>
            <Link
              href="/insights"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#9b742b]"
            >
              Read property insights <ArrowRight size={16} />
            </Link>
          </div>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {editorialGuides
              .filter(g =>
                [
                  "buying-property",
                  "property-checks",
                  "financing-a-home",
                ].includes(g.slug)
              )
              .map(g => ({
                category: g.topic,
                title: g.title,
                copy: g.summary,
                href: `/guides/${g.slug}`,
                image:
                  g.slug === "buying-property"
                    ? "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1000&q=80"
                    : g.slug === "property-checks"
                      ? "https://images.unsplash.com/photo-1577717903315-1691ae25ab3f?auto=format&fit=crop&w=1000&q=80"
                      : "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1000&q=80",
              }))
              .map(article => (
                <Link
                  href={article.href}
                  key={article.title}
                  className="group overflow-hidden rounded-[20px] border border-[#e8e3da] bg-white"
                >
                  <div className="aspect-[1.6/1] overflow-hidden">
                    <img
                      src={article.image}
                      alt=""
                      className="fp-card-media h-full w-full object-cover"
                    />
                  </div>
                  <div className="p-5">
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#ad8436]">
                      {article.category}
                    </p>
                    <h3 className="mt-3 font-display text-[21px] font-semibold leading-tight tracking-[-0.03em] text-[#0b1f33]">
                      {article.title}
                    </h3>
                    <p className="mt-2 text-sm leading-5 text-[#7f8a90]">
                      {article.copy}
                    </p>
                    <span className="mt-5 inline-flex items-center gap-2 text-xs font-semibold text-[#9b742b]">
                      Read article <ArrowRight size={14} />
                    </span>
                  </div>
                </Link>
              ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
