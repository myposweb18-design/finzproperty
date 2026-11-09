import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import {
  adminProcedure,
  protectedProcedure,
  publicProcedure,
  router,
} from "./_core/trpc";
import {
  createEnquiry,
  getMarketplaceProperty,
  listFavourites,
  listMarketplaceAgents,
  listMarketplaceDevelopments,
  listMarketplaceProperties,
  toggleFavourite,
} from "./db";
import {
  createListingReport,
  createPortalRequest,
  createSavedSearch,
  deleteSavedSearch,
  getAdminReports,
  getAdminRequests,
  getAdminStats,
  getDevelopmentBySlug,
  getPortalStatus,
  getPortalSummary,
  getSavedSearches,
  getUserEnquiries,
  getUserPortalRequests,
  resolveListingReport,
  resolvePortalRequest,
  subscribeNewsletter,
  updateUserName,
} from "./portal";

const finiteNumber = z.number().finite();
const nonNegativeInt = finiteNumber.int().nonnegative();
const optionalNonNegativeInt = nonNegativeInt.optional();
const optionalNonNegativeNumber = finiteNumber.nonnegative().optional();

const listingInput = z
  .object({
    intent: z.enum(["buy", "rent"]).optional(),
    kind: z.string().trim().max(40).optional(),
    district: z.string().trim().max(120).optional(),
    q: z.string().trim().max(220).optional(),
    featured: z.boolean().optional(),
    minPrice: optionalNonNegativeNumber,
    maxPrice: optionalNonNegativeNumber,
    bedrooms: optionalNonNegativeInt,
    bathrooms: optionalNonNegativeInt,
    minArea: optionalNonNegativeNumber,
    maxArea: optionalNonNegativeNumber,
    minLand: optionalNonNegativeNumber,
    maxLand: optionalNonNegativeNumber,
    amenity: z.string().trim().max(120).optional(),
    agentId: optionalNonNegativeInt,
  })
  .refine(
    value =>
      value.minPrice === undefined ||
      value.maxPrice === undefined ||
      value.minPrice <= value.maxPrice,
    { message: "minPrice must not exceed maxPrice", path: ["minPrice"] }
  )
  .refine(
    value =>
      value.minArea === undefined ||
      value.maxArea === undefined ||
      value.minArea <= value.maxArea,
    { message: "minArea must not exceed maxArea", path: ["minArea"] }
  )
  .refine(
    value =>
      value.minLand === undefined ||
      value.maxLand === undefined ||
      value.minLand <= value.maxLand,
    { message: "minLand must not exceed maxLand", path: ["minLand"] }
  );

const email = z.string().trim().email().max(320);
const name = z.string().trim().min(2).max(160);
const message = z.string().trim().min(10).max(4000);

const requestInput = z.object({
  type: z.enum([
    "contact",
    "project",
    "valuation",
    "wanted",
    "service",
    "mortgage",
    "event",
  ]),
  name,
  email,
  phone: z.string().trim().max(40).optional(),
  message,
  propertyId: nonNegativeInt.optional(),
  developmentId: nonNegativeInt.optional(),
});

const recentEnquiryAttempts = new Map<string, number[]>();
const ENQUIRY_WINDOW_MS = 60_000;
const ENQUIRY_LIMIT = 5;

function requestIp(req: {
  ip?: string;
  headers: Record<string, string | string[] | undefined>;
}) {
  const forwarded = req.headers["x-forwarded-for"];
  const firstForwarded = Array.isArray(forwarded)
    ? forwarded[0]
    : forwarded?.split(",")[0];
  return (firstForwarded?.trim() || req.ip || "unknown").slice(0, 128);
}

function enforceEnquiryThrottle(req: Parameters<typeof requestIp>[0]) {
  const now = Date.now();
  if (recentEnquiryAttempts.size > 5000) {
    for (const [k, v] of recentEnquiryAttempts) {
      if (!v.length || now - v[v.length - 1] > ENQUIRY_WINDOW_MS)
        recentEnquiryAttempts.delete(k);
    }
  }
  const key = requestIp(req);
  const attempts = (recentEnquiryAttempts.get(key) ?? []).filter(
    timestamp => now - timestamp < ENQUIRY_WINDOW_MS
  );
  if (attempts.length >= ENQUIRY_LIMIT)
    throw new TRPCError({
      code: "TOO_MANY_REQUESTS",
      message: "Please wait before sending another enquiry.",
    });
  attempts.push(now);
  recentEnquiryAttempts.set(key, attempts);
}

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  marketplace: router({
    listings: publicProcedure
      .input(listingInput.optional())
      .query(({ input }) => listMarketplaceProperties(input ?? {})),
    property: publicProcedure
      .input(z.object({ slug: z.string().trim().min(1).max(220) }))
      .query(({ input }) => getMarketplaceProperty(input.slug)),
    agents: publicProcedure
      .input(
        z
          .object({
            q: z.string().trim().max(220).optional(),
            location: z.string().trim().max(180).optional(),
          })
          .optional()
      )
      .query(({ input }) => listMarketplaceAgents(input ?? {})),
    developments: publicProcedure.query(() => listMarketplaceDevelopments()),
    favourites: protectedProcedure.query(({ ctx }) =>
      listFavourites(ctx.user.id)
    ),
    toggleFavourite: protectedProcedure
      .input(z.object({ propertyId: nonNegativeInt }))
      .mutation(({ ctx, input }) =>
        toggleFavourite(ctx.user.id, input.propertyId)
      ),
    enquire: publicProcedure
      .input(
        z.object({
          propertyId: nonNegativeInt,
          name,
          email,
          phone: z.string().trim().max(40).optional(),
          message: z.string().trim().min(10).max(2000),
          viewingDate: z.string().trim().max(60).optional(),
        })
      )
      .mutation(({ ctx, input }) => {
        enforceEnquiryThrottle(ctx.req);
        return createEnquiry({ ...input, userId: ctx.user?.id });
      }),
  }),
  portal: router({
    status: publicProcedure.query(() => getPortalStatus()),
    development: publicProcedure
      .input(z.object({ slug: z.string().trim().min(1).max(180) }))
      .query(({ input }) => getDevelopmentBySlug(input.slug)),
    projectListings: publicProcedure
      .input(z.object({ developmentId: nonNegativeInt }))
      .query(async ({ input }) =>
        (await listMarketplaceProperties()).filter(
          p => p.developmentId === input.developmentId
        )
      ),
    savedSearches: protectedProcedure.query(({ ctx }) =>
      getSavedSearches(ctx.user.id)
    ),
    saveSearch: protectedProcedure
      .input(
        z.object({
          name: z.string().trim().min(1).max(160),
          query: z
            .record(z.string().max(64), z.string().max(1024))
            .refine(value => Object.keys(value).length <= 50, {
              message: "Too many search filters",
            }),
          frequency: z.enum(["daily", "weekly", "off"]),
        })
      )
      .mutation(({ ctx, input }) =>
        createSavedSearch({ ...input, userId: ctx.user.id })
      ),
    removeSearch: protectedProcedure
      .input(z.object({ id: nonNegativeInt }))
      .mutation(({ ctx, input }) => deleteSavedSearch(ctx.user.id, input.id)),
    enquiries: protectedProcedure.query(({ ctx }) =>
      getUserEnquiries(ctx.user.id)
    ),
    summary: protectedProcedure.query(({ ctx }) =>
      getPortalSummary(ctx.user.id)
    ),
    updateProfile: protectedProcedure
      .input(z.object({ name }))
      .mutation(({ ctx, input }) => updateUserName(ctx.user.id, input.name)),
    submitRequest: publicProcedure
      .input(requestInput)
      .mutation(({ ctx, input }) => {
        enforceEnquiryThrottle(ctx.req);
        return createPortalRequest({ ...input, userId: ctx.user?.id });
      }),
    requests: protectedProcedure.query(({ ctx }) =>
      getUserPortalRequests(ctx.user.id)
    ),
    subscribe: publicProcedure
      .input(z.object({ email }))
      .mutation(({ ctx, input }) => {
        enforceEnquiryThrottle(ctx.req);
        return subscribeNewsletter(input.email.toLowerCase());
      }),
    report: publicProcedure
      .input(
        z.object({
          propertyId: nonNegativeInt,
          reason: z.string().trim().min(2).max(160),
          details: z.string().trim().max(2000).optional(),
          email: email.optional(),
        })
      )
      .mutation(({ ctx, input }) => {
        enforceEnquiryThrottle(ctx.req);
        return createListingReport({ ...input, userId: ctx.user?.id });
      }),
    adminStats: adminProcedure.query(() => getAdminStats()),
    adminRequests: adminProcedure.query(() => getAdminRequests()),
    adminReports: adminProcedure.query(() => getAdminReports()),
    resolveRequest: adminProcedure
      .input(
        z.object({ id: nonNegativeInt, status: z.enum(["reviewed", "closed"]) })
      )
      .mutation(({ input }) => resolvePortalRequest(input.id, input.status)),
    resolveReport: adminProcedure
      .input(z.object({ id: nonNegativeInt }))
      .mutation(({ input }) => resolveListingReport(input.id)),
  }),
});

export type AppRouter = typeof appRouter;
