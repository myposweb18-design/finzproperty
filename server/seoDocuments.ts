import {
  listMarketplaceAgents,
  listMarketplaceDevelopments,
  listMarketplaceProperties,
} from "./db";
import { editorialEntries } from "../shared/editorial";
import { districts } from "../shared/search";
import { infoPages, servicePages, toolPages } from "../shared/siteRoutes";

const origin = () =>
  (process.env.PUBLIC_APP_URL || "https://finzproperty.com").replace(/\/$/, "");
const clean = (path: string) => `${origin()}${path === "/" ? "/" : path}`;

export async function renderSitemap() {
  const [properties, developments, agents] = await Promise.all([
    listMarketplaceProperties(),
    listMarketplaceDevelopments(),
    listMarketplaceAgents(),
  ]);
  const paths = new Set([
    "/",
    "/buy",
    "/rent",
    "/land",
    "/commercial",
    "/new-developments",
    "/apartment-finder",
    "/agents",
    "/tools",
    "/locations",
    "/guides",
    "/property-news",
    "/insights",
    ...infoPages
      .filter(page => !["privacy", "terms", "safety"].includes(page))
      .map(page => `/${page}`),
    ...toolPages.map(slug => `/tools/${slug}`),
    ...servicePages.map(slug => `/services/${slug}`),
    ...districts.map(district => `/locations/${encodeURIComponent(district)}`),
    ...editorialEntries.map(
      entry => `/${entry.kind === "guide" ? "guides" : "news"}/${entry.slug}`
    ),
    ...properties
      .filter(item => !item.isDemo)
      .map(item => `/properties/${item.slug}`),
    ...developments
      .filter(item => !item.isDemo)
      .map(item => `/developments/${item.slug}`),
    ...agents.filter(item => !item.isDemo).map(item => `/agents/${item.slug}`),
  ]);
  const urls = [...paths]
    .map(path => `<url><loc>${escapeXml(clean(path))}</loc></url>`)
    .join("");
  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`;
}

export function renderRobots() {
  return `User-agent: *\nAllow: /\nDisallow: /api/\nDisallow: /account\nDisallow: /saved-properties\nDisallow: /saved-searches\nDisallow: /admin\nSitemap: ${clean("/sitemap.xml")}\n`;
}

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}
