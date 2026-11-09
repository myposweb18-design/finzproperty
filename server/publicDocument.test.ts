import { describe, it, expect, vi } from "vitest";
import {
  seedProperties,
  seedAgents,
  seedDevelopments,
} from "../shared/marketplace";
vi.mock("./db", () => ({
  listMarketplaceProperties: vi.fn(async () =>
    seedProperties.map(p => ({ ...p, isDemo: true }))
  ),
  listMarketplaceAgents: vi.fn(async () => seedAgents),
  listMarketplaceDevelopments: vi.fn(async () => seedDevelopments),
}));
vi.mock("./portal", () => ({
  getDevelopmentBySlug: vi.fn(async (slug: string) =>
    seedDevelopments.find(p => p.slug === slug)
  ),
}));
import { renderPublicDocument, escapeHtml } from "./publicDocument";
const shell =
  '<html><head><title>FinzProperty</title><meta name="description" content="Default"/></head><body><div id="root"></div></body></html>';
describe("public document serving", () => {
  it("renders real public listing information and no ad creation", async () => {
    const r = await renderPublicDocument(shell, "/buy?kind=Apartment");
    expect(r.status).toBe(200);
    expect(r.html).toContain("<h1>");
    expect(r.html).toContain("Apartment");
    expect(r.html).not.toContain("post-property");
    expect(r.html).toContain("Demonstration");
  });
  it("keeps private pages noindex without private records", async () => {
    const r = await renderPublicDocument(shell, "/admin");
    expect(r.html).toContain("noindex,nofollow");
    expect(r.html).not.toContain(seedProperties[0].title);
  });
  it("returns true404 for absent records and removed posting routes", async () => {
    for (const p of [
      "/properties/nonexistent",
      "/developments/nonexistent",
      "/guides/nonexistent",
      "/post-property",
      "/tools/unknown",
    ]) {
      const r = await renderPublicDocument(shell, p);
      expect(r.status).toBe(404);
      expect(r.html).toContain("Page not found");
    }
  });
  it("escapes untrusted text and serves actual guide paragraphs", async () => {
    expect(escapeHtml('<script>"&')).toBe("&lt;script&gt;&quot;&amp;");
    const r = await renderPublicDocument(shell, "/guides/buying-property");
    expect(r.html).toContain("A good property decision starts");
    expect(r.html).toContain("How to research a property before buying");
  });
});
