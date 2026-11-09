import { Link } from "wouter";
import { X, MapPin, GitCompareArrows } from "lucide-react";
import { SiteHeader } from "@/components/finz/SiteHeader";
import { Footer } from "@/components/finz/Sections";
import { useProperties, useAgents } from "@/lib/marketplace";
import { useVisitorState } from "@/lib/visitorState";
import { districts } from "@shared/search";
import { formatLkr, type Property } from "@shared/marketplace";
import { PropertyMap } from "@/components/finz/PropertyMap";

export function CompareProperties() {
  const query = useProperties();
  const { compareIds, toggleCompare, clearComparison } = useVisitorState();
  const rows = query.data.filter(p => compareIds.includes(p.id));
  const fields: Array<{ label: string; value: (p: Property) => string }> = [
    { label: "Price", value: p => formatLkr(p.price, p.intent) },
    {
      label: "Offer",
      value: p => (p.intent === "rent" ? "For rent" : "For sale"),
    },
    { label: "Property type", value: p => p.kind },
    { label: "Location", value: p => p.location },
    { label: "Bedrooms", value: p => String(p.bedrooms || "—") },
    { label: "Bathrooms", value: p => String(p.bathrooms || "—") },
    { label: "Floor area", value: p => p.floorArea || "Not supplied" },
    { label: "Land size", value: p => p.landSize || "Not supplied" },
    { label: "Features", value: p => p.amenities.join(", ") || "Not supplied" },
    { label: "Advertiser", value: p => p.agentCompany || "Not supplied" },
    {
      label: "Data status",
      value: p => (p.isDemo ? "Demonstration" : "Advertised listing"),
    },
  ];
  return (
    <div className="min-h-screen bg-[#f7f5f0]">
      <SiteHeader solid />
      <main className="mx-auto max-w-[1320px] px-5 py-10 lg:px-8">
        <div className="flex flex-wrap justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-[#a98136]">
              Your shortlist
            </p>
            <h1 className="mt-3 font-display text-4xl font-semibold">
              Compare the details.
            </h1>
            <p className="mt-3 text-sm text-[#71808b]">
              Up to four properties, side by side. Comparison is saved on this
              device.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/buy" className="text-sm font-semibold text-[#9b742b]">
              Add properties →
            </Link>
            {compareIds.length > 0 && (
              <button
                onClick={clearComparison}
                className="rounded-full border px-4 py-2 text-xs"
              >
                Clear comparison
              </button>
            )}
          </div>
        </div>
        {query.isLoading ? (
          <p className="py-16">Loading shortlist…</p>
        ) : query.error ? (
          <p role="alert" className="py-16">
            Inventory could not be loaded.{" "}
            <button onClick={() => query.refetch()} className="underline">
              Retry
            </button>
          </p>
        ) : rows.length ? (
          <div className="mt-8 overflow-x-auto rounded-2xl border bg-white">
            <table className="min-w-[650px] w-full border-collapse text-left text-sm">
              <thead>
                <tr>
                  <th className="w-40 p-5 text-xs uppercase text-[#7c8991]">
                    Compare
                  </th>
                  {rows.map(p => (
                    <th
                      key={p.id}
                      className="min-w-[230px] max-w-[300px] p-5 align-top"
                    >
                      <div className="relative">
                        <img
                          src={p.image}
                          alt={p.title}
                          className="aspect-[1.5] w-full rounded-xl object-cover"
                        />
                        <button
                          aria-label={`Remove ${p.title}`}
                          onClick={() => toggleCompare(p.id)}
                          className="absolute right-2 top-2 rounded-full bg-white p-2"
                        >
                          <X size={14} />
                        </button>
                      </div>
                      <Link
                        href={`/properties/${p.slug}`}
                        className="mt-4 block font-display text-xl font-semibold hover:text-[#9b742b]"
                      >
                        {p.title}
                      </Link>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {fields.map(f => (
                  <tr key={f.label} className="border-t border-[#eee9e1]">
                    <th className="p-5 text-xs font-semibold text-[#7a8790]">
                      {f.label}
                    </th>
                    {rows.map(p => (
                      <td key={p.id} className="p-5 align-top text-[#344b5c]">
                        {f.value(p)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="mt-10 rounded-2xl border border-dashed p-16 text-center">
            <GitCompareArrows size={32} className="mx-auto text-[#a98136]" />
            <h2 className="mt-4 text-xl font-semibold">
              Your comparison is empty
            </h2>
            <p className="mt-3 text-sm text-[#7c8991]">
              Select Compare on a property card or details page.
            </p>
            <Link
              href="/buy"
              className="mt-5 inline-block rounded-full bg-[#0b1f33] px-5 py-3 text-sm text-white"
            >
              Browse properties
            </Link>
          </div>
        )}
        {compareIds.length > rows.length && !query.isLoading && (
          <p className="mt-4 text-xs text-[#7c8991]">
            Some shortlisted records are no longer available. Clear your
            comparison to remove unavailable entries.
          </p>
        )}
      </main>
      <Footer />
    </div>
  );
}
export function Locations({ district }: { district?: string }) {
  const query = useProperties();
  const agents = useAgents();
  const rows = district
    ? query.data.filter(p => p.district === district)
    : query.data;
  if (district && !districts.includes(district))
    return (
      <div>
        <SiteHeader solid />
        <main className="p-10">
          <h1>Unknown district</h1>
          <Link href="/locations">Browse districts</Link>
        </main>
        <Footer />
      </div>
    );
  return (
    <div className="min-h-screen bg-[#fffdf9]">
      <SiteHeader solid />
      <main className="mx-auto max-w-[1320px] px-5 py-10 lg:px-8">
        <p className="text-xs uppercase tracking-widest text-[#a98136]">
          Area discovery
        </p>
        <h1 className="mt-3 font-display text-4xl font-semibold">
          {district ? `Explore ${district}` : "Every district, one place."}
        </h1>
        <p className="mt-4 max-w-xl text-sm leading-6 text-[#7c8991]">
          Browse Sri Lanka's 25 districts. Counts reflect current records in
          this app; demonstration prices are not a market index or formal
          valuation.
        </p>
        {district ? (
          <>
            <div className="my-6 flex flex-wrap gap-3">
              <Link
                href={`/buy?district=${encodeURIComponent(district)}`}
                className="rounded-full bg-[#0b1f33] px-5 py-3 text-sm text-white"
              >
                Properties for sale
              </Link>
              <Link
                href={`/rent?district=${encodeURIComponent(district)}`}
                className="rounded-full border px-5 py-3 text-sm"
              >
                Rental property
              </Link>
              <Link
                href={`/tools/price-meter?district=${encodeURIComponent(district)}`}
                className="rounded-full border px-5 py-3 text-sm"
              >
                Price indicator
              </Link>
              <a
                href={`https://www.google.com/maps/search/${encodeURIComponent(`${district} Sri Lanka schools hospitals transport`)}`}
                target="_blank"
                rel="noreferrer"
                className="rounded-full border px-5 py-3 text-sm"
              >
                Explore nearby amenities
              </a>
            </div>
            <PropertyMap
              items={rows.map(p => ({
                id: p.id,
                title: p.title,
                location: p.location,
                image: p.image,
                price: p.price,
                intent: p.intent,
                href: `/properties/${p.slug}`,
              }))}
            />
            <h2 className="mt-10 text-2xl font-semibold">Local advertisers</h2>
            <div className="mt-4 flex flex-wrap gap-3">
              {agents.data
                .filter(a => a.location.includes(district))
                .map(a => (
                  <Link
                    key={a.id}
                    href={`/agents/${a.slug}`}
                    className="rounded-xl border p-4 text-sm"
                  >
                    {a.company}
                    {a.isDemo && (
                      <span className="ml-2 text-xs text-[#8b949b]">Demo</span>
                    )}
                  </Link>
                ))}
            </div>
            <p className="mt-4 text-xs text-[#8b949b]">
              Local coverage must be confirmed directly; profiles are not proof
              of professional credentials.
            </p>
          </>
        ) : (
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {districts.map(d => (
              <Link
                key={d}
                href={`/locations/${encodeURIComponent(d)}`}
                className="flex items-center gap-3 rounded-xl border border-[#e7e2d9] p-5 hover:border-[#d8b66a]"
              >
                <MapPin size={18} className="text-[#a98136]" />
                <span className="flex-1 font-semibold">{d}</span>
                <span className="text-xs text-[#8b949b]">
                  {query.isLoading
                    ? "…"
                    : query.error
                      ? "—"
                      : query.data.filter(p => p.district === d).length}
                </span>
              </Link>
            ))}
          </div>
        )}
        {query.error && (
          <p role="alert" className="mt-5 text-sm">
            Inventory counts unavailable.{" "}
            <button onClick={() => query.refetch()} className="underline">
              Retry
            </button>
          </p>
        )}
      </main>
      <Footer />
    </div>
  );
}
