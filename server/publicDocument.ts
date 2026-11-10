import {
  listMarketplaceAgents,
  listMarketplaceDevelopments,
  listMarketplaceProperties,
} from "./db";
import { getDevelopmentBySlug } from "./portal";
import {
  editorialEntries,
  getEditorialCopy,
  getEditorialEntry,
} from "../shared/editorial";
import { districts, filterProperties, parseFilters } from "../shared/search";
import { formatLkr } from "../shared/marketplace";
import { infoPages, servicePages, toolPages } from "../shared/siteRoutes";
import { businessContact } from "../shared/contact";

export function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
const safeJsonLd = (value: unknown) =>
  JSON.stringify(value)
    .replaceAll("<", "\\u003c")
    .replaceAll(">", "\\u003e")
    .replaceAll("&", "\\u0026");
const link = (href: string, label: string) =>
  `<a href="${escapeHtml(href)}">${escapeHtml(label)}</a>`;
const businessContactMarkup = `<p><strong>Direct business contact</strong>: <a href="${escapeHtml(businessContact.telHref)}" aria-label="${escapeHtml(`Call ${businessContact.displayPhone}`)}">Call ${escapeHtml(businessContact.displayPhone)}</a> · <a href="${escapeHtml(businessContact.whatsappHref)}" target="_blank" rel="noopener noreferrer" aria-label="${escapeHtml(`WhatsApp ${businessContact.displayPhone}`)}">WhatsApp ${escapeHtml(businessContact.displayPhone)}</a></p>`;
const readable = (s: string) =>
  s
    .split("-")
    .map(p => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ");
export async function renderPublicDocument(
  template: string,
  originalUrl: string
) {
  const url = new URL(originalUrl, "https://internal.invalid");
  const path = url.pathname.replace(/\/$/, "") || "/";
  const configuredOrigin = (
    process.env.PUBLIC_APP_URL || "https://finzproperty.com"
  ).replace(/\/$/, "");
  const canonicalUrl = `${configuredOrigin}${path === "/" ? "/" : path}`;
  const defaultImage = `${configuredOrigin}/finz-property-logo.png`;
  let title = "Find property in Sri Lanka",
    description =
      "Explore Sri Lankan homes, land, apartments and commercial property with FinzProperty.",
    body = "",
    status = 200,
    noindex = false,
    ogImage = defaultImage;
  const privatePaths = [
    "/account",
    "/saved-properties",
    "/saved-searches",
    "/admin",
  ];
  if (privatePaths.includes(path)) {
    title = "Your private FinzProperty account";
    description =
      "Sign in to securely access your saved properties, searches and requests.";
    noindex = true;
    body = `<p>Your account requires a valid session. Private information is never included in public page HTML.</p>${link("/account", "Open your account")}`;
  } else if (
    path === "/" ||
    ["/buy", "/rent", "/land", "/commercial", "/apartment-finder"].includes(
      path
    )
  ) {
    const filters = parseFilters(url.searchParams, path.slice(1));
    if (path === "/apartment-finder") filters.kind = "Apartment";
    const rows = filterProperties(
      await listMarketplaceProperties(),
      path === "/" ? {} : filters
    );
    title =
      path === "/"
        ? "Find your place in Sri Lanka"
        : path === "/apartment-finder"
          ? "Apartment Finder in Sri Lanka"
          : `${path === "/rent" ? "Rent" : path === "/land" ? "Land" : path === "/commercial" ? "Commercial property" : "Buy property"} in Sri Lanka`;
    body = `<p>${rows.length} current listing records. Demonstration inventory, where labeled, is not verified live property.</p><div>${rows
      .slice(0, 30)
      .map(
        p =>
          `<article><h2>${link(`/properties/${p.slug}`, p.title)}</h2><p>${escapeHtml(p.location)} · ${escapeHtml(p.kind)} · ${escapeHtml(formatLkr(p.price, p.intent))}</p><p>${escapeHtml(p.description)}</p>${p.isDemo ? "<p>Demonstration listing — not a live offer.</p>" : ""}</article>`
      )
      .join("")}</div>${link("/locations", "Browse all districts")}`;
  } else if (path.startsWith("/properties/")) {
    const rows = await listMarketplaceProperties();
    const p = rows.find(p => p.slug === decodeURIComponent(path.slice(12)));
    if (!p) status = 404;
    else {
      title = p.title;
      description = `${p.kind} in ${p.location}. ${formatLkr(p.price, p.intent)}. ${p.isDemo ? "Demonstration record, not a live offer." : "View details and advertiser information."}`;
      ogImage = p.image.startsWith("http")
        ? p.image
        : `${configuredOrigin}${p.image.startsWith("/") ? "" : "/"}${p.image}`;
      body = `<p>${escapeHtml(p.location)} · ${escapeHtml(formatLkr(p.price, p.intent))}</p><img src="${escapeHtml(p.image)}" alt="${escapeHtml(p.title)}" width="480"/><h2>Property information</h2><p>${escapeHtml(p.description)}</p><p>${p.bedrooms} bedrooms · ${p.bathrooms} bathrooms · ${escapeHtml(p.floorArea || "Floor area not provided")} · ${escapeHtml(p.landSize || "Land extent not provided")}</p><h2>Recorded features</h2><p>${p.amenities.map(escapeHtml).join(", ")}</p>${p.isDemo ? "<p>Demonstration listing — photos, prices and contacts are illustrative.</p>" : ""}${link(`/tools/mortgage?price=${p.price}`, "Estimate home loan payments")}`;
    }
  } else if (path === "/new-developments") {
    title = "New developments in Sri Lanka";
    const rows = await listMarketplaceDevelopments();
    body = `<p>Search project records by locality, budget and recorded status. Missing availability is not inferred.</p>${rows.map(p => `<article><h2>${link(`/developments/${p.slug}`, p.name)}</h2><p>${escapeHtml(p.location)} · ${escapeHtml(p.developer)}</p>${p.isDemo ? "<p>Demonstration project, not confirmed availability.</p>" : ""}</article>`).join("")}`;
  } else if (path.startsWith("/developments/")) {
    const p = await getDevelopmentBySlug(decodeURIComponent(path.slice(14)));
    if (!p) status = 404;
    else {
      title = p.name;
      description = `Explore the ${p.name} project record in ${p.location}. Request current project information.`;
      body = `<p>${escapeHtml(p.location)} · ${escapeHtml(p.developer)}</p><h2>Project record</h2><p>${escapeHtml(p.status)}</p><p>Unit availability, brochures, floor plans and payment terms must be confirmed. No missing project facts are invented.</p>${p.isDemo ? "<p>Demonstration project — not a verified live offer.</p>" : ""}${link(`/tools/mortgage?price=${p.fromPrice}`, "Estimate repayments")}`;
    }
  } else if (path === "/agents" || path.startsWith("/agents/")) {
    const rows = await listMarketplaceAgents();
    const selected =
      path === "/agents"
        ? rows
        : rows.filter(
            p =>
              p.slug === decodeURIComponent(path.slice(8)) ||
              String(p.id) === path.slice(8)
          );
    if (path !== "/agents" && !selected.length) status = 404;
    title =
      path === "/agents"
        ? "Sri Lankan property advertiser directory"
        : selected[0]?.company || "Agent not found";
    body = selected
      .map(
        p =>
          `<article><h2>${link(`/agents/${p.slug}`, p.company)}</h2><p>${escapeHtml(p.name)} · ${escapeHtml(p.location)}</p><p>${escapeHtml(p.bio)}</p><p>${p.listings} active associated records${p.isDemo ? " · demonstration advertiser" : ""}</p></article>`
      )
      .join("");
  } else if (["/guides", "/insights", "/property-news"].includes(path)) {
    title =
      path === "/property-news"
        ? "FinzProperty news and practical guides"
        : "Property guides for a clearer decision";
    body = editorialEntries
      .map(
        p =>
          `<article><h2>${link(`/${p.kind === "guide" ? "guides" : "news"}/${p.slug}`, p.title)}</h2><p>${escapeHtml(p.summary)}</p></article>`
      )
      .join("");
  } else if (path.startsWith("/guides/") || path.startsWith("/news/")) {
    const entry = getEditorialEntry(decodeURIComponent(path.split("/")[2]));
    if (!entry) status = 404;
    else {
      title = entry.title;
      description = entry.summary;
      const raw = url.searchParams.get("lang");
      const language = raw === "si" || raw === "ta" ? raw : "en";
      const copy = getEditorialCopy(entry, language);
      body = `<p>${escapeHtml(copy.intro)}</p>${copy.sections.map(s => `<section><h2>${escapeHtml(s.heading)}</h2>${s.paragraphs.map(p => `<p>${escapeHtml(p)}</p>`).join("")}</section>`).join("")}${link("/guides", "Explore all guides")}`;
    }
  } else if (path === "/tools" || path.startsWith("/tools/")) {
    const slug = path.split("/")[2];
    if (slug && !toolPages.includes(slug)) status = 404;
    title = slug
      ? `${readable(slug)} for property decisions`
      : "Property calculators and market resources";
    description =
      "Use validated mortgage, affordability, investment and land-conversion tools with explicit assumptions.";
    body = `<p>Estimate repayments, borrowing power, rental returns and land measurements. Rates and exchange values are editable assumptions, not verified live financial offers. Price indicators require sufficient non-demonstration records.</p><h2>Available tools</h2>${toolPages.map(s => `<p>${link(`/tools/${s}`, readable(s))}</p>`).join("")}<p>Historical proprietary indexes and market reports require external data connections; no historic series is fabricated.</p>`;
  } else if (path === "/locations" || path.startsWith("/locations/")) {
    const district = path.split("/")[2]
      ? decodeURIComponent(path.split("/")[2])
      : undefined;
    if (district && !districts.includes(district)) status = 404;
    title = district
      ? `Explore property in ${district}`
      : "Explore all 25 districts in Sri Lanka";
    body = `<p>Browse current property records and approximate localities, not a formal valuation or transaction-price index.</p>${(district ? [district] : districts).map(d => `<p>${link(`/buy?district=${encodeURIComponent(d)}`, `Buy property in ${d}`)} · ${link(`/rent?district=${encodeURIComponent(d)}`, "Rental records")}</p>`).join("")}`;
  } else if (path === "/services" || path.startsWith("/services/")) {
    const slug = path.split("/")[2];
    if (slug && !servicePages.includes(slug)) status = 404;
    title = slug
      ? `${readable(slug)} assistance requests`
      : "Property and professional assistance";
    body = `<p>Record a private request for valuation, legal documents, mortgage advice, construction, moving or research. Provider availability and regulated services require separately confirmed professionals. Submission stores your request; it is not a guaranteed match or external delivery.</p>${servicePages.map(s => `<p>${link(`/services/${s}`, readable(s))}</p>`).join("")}`;
  } else if (infoPages.includes(path.slice(1))) {
    const name = path.slice(1);
    title = `${readable(name)} · FinzProperty`;
    const copy: Record<string, string> = {
      about:
        "FinzProperty is a Sri Lankan property discovery application with search, comparison, learning resources and private assistance requests.",
      contact:
        "Send feedback or ask for help. Direct business contact is available by phone or WhatsApp; the validated request form is recorded in the app for review and is not automatic external delivery.",
      faq: "Find help with property search, saving criteria, accounts, enquiries, calculator assumptions and safe marketplace use.",
      privacy:
        "The app stores OAuth identity, saved properties/searches, enquiries, reports, requests and consented newsletter preferences. Browser storage supports visitor comparison, favourites and recent views. Request data access or removal through Contact.",
      terms:
        "Listings are advertiser information, not guarantees of accuracy, title, condition, availability or financial performance. Demonstration records are not live offers. Check facts independently before any agreement.",
      safety:
        "Verify identity, authority, documents, property condition and payment instructions independently. Never make payments based only on photographs or messaging. Report suspicious listing records.",
      events:
        "No FinzProperty event schedule is confirmed. You can record interest in future learning events and visit clearly identified external archives.",
    };
    description = copy[name];
    body = `<p>${escapeHtml(copy[name])}</p>${name === "contact" ? businessContactMarkup : ""}<h2>Related resources</h2>${link("/contact", "Contact and request help")} · ${link("/guides", "Practical property guides")}`;
  } else if (path === "/compare") {
    title = "Compare your shortlisted properties";
    noindex = true;
    body = `<p>Your comparison is stored on this device. Select up to four records from the property results to compare them.</p>${link("/buy", "Find properties to compare")}`;
  } else status = 404;
  if (status === 404) {
    title = "Page not found";
    description = "This FinzProperty page or record is not available.";
    noindex = true;
    body = `<p>The requested page or active record could not be found.</p>${link("/", "Return to FinzProperty")}`;
  }
  const pageTitle = `${title} | FinzProperty`;
  const structuredData = {
    "@context": "https://schema.org",
    "@type": path.startsWith("/properties/") ? "RealEstateListing" : "WebPage",
    name: pageTitle,
    description,
    url: canonicalUrl,
    isPartOf: {
      "@type": "WebSite",
      name: "FinzProperty",
      url: configuredOrigin,
    },
    ...(path.startsWith("/properties/") && { image: ogImage }),
  };
  let result = template
    .replace(
      /<title>[\s\S]*?<\/title>/i,
      `<title>${escapeHtml(pageTitle)}</title>`
    )
    .replace(
      /<meta\s+name="description"[^>]*>/i,
      `<meta name="description" content="${escapeHtml(description)}"/>`
    );
  result = result.replace(
    "</head>",
    `<meta name="robots" content="${noindex ? "noindex,nofollow" : "index,follow"}"/><link rel="canonical" href="${escapeHtml(canonicalUrl)}"/><meta property="og:type" content="${path.startsWith("/properties/") ? "product" : "website"}"/><meta property="og:title" content="${escapeHtml(pageTitle)}"/><meta property="og:description" content="${escapeHtml(description)}"/><meta property="og:url" content="${escapeHtml(canonicalUrl)}"/><meta property="og:image" content="${escapeHtml(ogImage)}"/><meta property="og:site_name" content="FinzProperty"/><meta name="twitter:card" content="summary_large_image"/><meta name="twitter:title" content="${escapeHtml(pageTitle)}"/><meta name="twitter:description" content="${escapeHtml(description)}"/><meta name="twitter:image" content="${escapeHtml(ogImage)}"/><script type="application/ld+json">${safeJsonLd(structuredData)}</script></head>`
  );
  result = result.replace(
    '<div id="root"></div>',
    `<div id="root"><div style="max-width:1100px;margin:auto;padding:32px;font-family:Arial,sans-serif;color:#0b1f33"><header>${link("/", "FINZ PROPERTY")} · ${link("/buy", "Buy")} · ${link("/rent", "Rent")} · ${link("/apartment-finder", "Apartment Finder")} · ${link("/tools", "Tools")} · ${link("/guides", "Guides")}</header><main><h1>${escapeHtml(title)}</h1>${body}</main><footer>${businessContactMarkup}${link("/privacy", "Privacy")} · ${link("/terms", "Terms")} · ${link("/safety", "Safety")}</footer></div></div>`
  );
  return { html: result, status };
}
