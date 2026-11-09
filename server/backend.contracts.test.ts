import { afterEach, describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

const mocks = vi.hoisted(() => ({
  createEnquiry: vi.fn().mockResolvedValue({
    id: 42,
    propertyId: 7,
    name: "A User",
    email: "a@example.com",
    message: "Please arrange a viewing",
    userId: 9,
  }),
}));

vi.mock("./db", () => ({
  createEnquiry: mocks.createEnquiry,
  getMarketplaceProperty: vi.fn().mockResolvedValue(undefined),
  listFavourites: vi.fn().mockResolvedValue([]),
  listMarketplaceAgents: vi.fn().mockResolvedValue([]),
  listMarketplaceDevelopments: vi.fn().mockResolvedValue([]),
  listMarketplaceProperties: vi.fn().mockResolvedValue([]),
  toggleFavourite: vi.fn().mockResolvedValue({ saved: true }),
}));

vi.mock("./portal", () => ({
  createListingReport: vi.fn(),
  createPortalRequest: vi.fn(),
  createSavedSearch: vi.fn(),
  deleteSavedSearch: vi.fn(),
  getAdminReports: vi.fn(),
  getAdminRequests: vi.fn(),
  getAdminStats: vi.fn(),
  getDevelopmentBySlug: vi.fn(),
  getPortalStatus: vi.fn().mockResolvedValue({
    demo: false,
    emailConfigured: false,
    alertDelivery: "in-app",
  }),
  getPortalSummary: vi.fn(),
  getSavedSearches: vi.fn(),
  getUserEnquiries: vi.fn(),
  getUserPortalRequests: vi.fn(),
  resolveListingReport: vi.fn(),
  resolvePortalRequest: vi.fn(),
  subscribeNewsletter: vi.fn(),
  updateUserName: vi.fn(),
}));

import { appRouter } from "./routers";

function context(user: TrpcContext["user"], ip = "198.51.100.10"): TrpcContext {
  return {
    user,
    req: { ip, protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

const user = {
  id: 9,
  openId: "user-9",
  name: "A User",
  email: "a@example.com",
  loginMethod: "manus",
  role: "user" as const,
  createdAt: new Date(),
  updatedAt: new Date(),
  lastSignedIn: new Date(),
};

const admin = { ...user, id: 1, openId: "admin-1", role: "admin" as const };

afterEach(() => {
  vi.clearAllMocks();
});

describe("backend router contracts", () => {
  it("validates numeric listing ranges before querying", async () => {
    const caller = appRouter.createCaller(context(null));
    await expect(
      caller.marketplace.listings({ minPrice: 100, maxPrice: 10 })
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("keeps empty marketplace matches empty instead of injecting seed records", async () => {
    const caller = appRouter.createCaller(context(null));
    await expect(
      caller.marketplace.listings({ q: "no-database-match" })
    ).resolves.toEqual([]);
  });

  it("requires authentication for saved searches and admin role for moderation", async () => {
    await expect(
      appRouter.createCaller(context(null)).portal.savedSearches()
    ).rejects.toMatchObject({ code: "UNAUTHORIZED" });
    await expect(
      appRouter.createCaller(context(user)).portal.adminStats()
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(
      appRouter.createCaller(context(admin)).portal.adminStats()
    ).resolves.toEqual(undefined);
  });

  it("attaches the authenticated user to public enquiries", async () => {
    const caller = appRouter.createCaller(context(user, "198.51.100.11"));
    await caller.marketplace.enquire({
      propertyId: 7,
      name: "A User",
      email: "a@example.com",
      message: "Please arrange a viewing",
    });
    expect(mocks.createEnquiry).toHaveBeenCalledWith(
      expect.objectContaining({ propertyId: 7, userId: 9 })
    );
  });

  it("rejects unsupported portal request types at the public boundary", async () => {
    const caller = appRouter.createCaller(context(null));
    await expect(
      caller.portal.submitRequest({
        type: "property-ad" as never,
        name: "A User",
        email: "a@example.com",
        message: "Please contact me about a service",
      })
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });
});
