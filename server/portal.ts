import { and, count, desc, eq } from "drizzle-orm";
import {
  agents,
  developments,
  enquiries,
  favourites,
  listingReports,
  newsletterSubscribers,
  portalRequests,
  properties,
  savedSearches,
  users,
} from "../drizzle/schema";
import { getDb } from "./db";

export const PORTAL_REQUEST_TYPES = [
  "contact",
  "project",
  "valuation",
  "wanted",
  "service",
  "mortgage",
  "event",
] as const;
export type PortalRequestType = (typeof PORTAL_REQUEST_TYPES)[number];
export type PortalRequestStatus = "pending" | "reviewed" | "closed";

export async function getPortalStatus() {
  const db = await getDb();
  const [propertyRows, agentRows, developmentRows] = await Promise.all([
    db
      .select({ isDemo: properties.isDemo })
      .from(properties)
      .where(eq(properties.isDemo, true))
      .limit(1),
    db
      .select({ isDemo: agents.isDemo })
      .from(agents)
      .where(eq(agents.isDemo, true))
      .limit(1),
    db
      .select({ isDemo: developments.isDemo })
      .from(developments)
      .where(eq(developments.isDemo, true))
      .limit(1),
  ]);
  return {
    demo:
      propertyRows.length > 0 ||
      agentRows.length > 0 ||
      developmentRows.length > 0,
    emailConfigured: false as const,
    alertDelivery: "in-app" as const,
  };
}

export async function getDevelopmentBySlug(slug: string) {
  const db = await getDb();
  const rows = await db
    .select()
    .from(developments)
    .where(eq(developments.slug, slug))
    .limit(1);
  return rows[0] ? { ...rows[0], isDemo: rows[0].isDemo } : undefined;
}

export async function getSavedSearches(userId: number) {
  const db = await getDb();
  return db
    .select({
      id: savedSearches.id,
      name: savedSearches.name,
      query: savedSearches.query,
      frequency: savedSearches.frequency,
      createdAt: savedSearches.createdAt,
    })
    .from(savedSearches)
    .where(eq(savedSearches.userId, userId))
    .orderBy(desc(savedSearches.createdAt));
}

export async function createSavedSearch(input: {
  userId: number;
  name: string;
  query: Record<string, string>;
  frequency: "daily" | "weekly" | "off";
}) {
  const db = await getDb();
  const result = await db.insert(savedSearches).values({
    userId: input.userId,
    name: input.name,
    query: JSON.stringify(input.query),
    frequency: input.frequency,
  });
  return { id: Number(result[0].insertId) };
}

export async function deleteSavedSearch(userId: number, id: number) {
  const db = await getDb();
  const existing = await db
    .select({ id: savedSearches.id })
    .from(savedSearches)
    .where(and(eq(savedSearches.id, id), eq(savedSearches.userId, userId)))
    .limit(1);
  if (!existing.length) throw new Error("Saved search not found");
  await db
    .delete(savedSearches)
    .where(and(eq(savedSearches.id, id), eq(savedSearches.userId, userId)));
  return { success: true as const };
}

export async function getUserEnquiries(userId: number) {
  const db = await getDb();
  const rows = await db
    .select({
      id: enquiries.id,
      propertyId: enquiries.propertyId,
      name: enquiries.name,
      email: enquiries.email,
      phone: enquiries.phone,
      message: enquiries.message,
      viewingDate: enquiries.viewingDate,
      createdAt: enquiries.createdAt,
      propertyTitle: properties.title,
      propertySlug: properties.slug,
    })
    .from(enquiries)
    .leftJoin(properties, eq(properties.id, enquiries.propertyId))
    .where(eq(enquiries.userId, userId))
    .orderBy(desc(enquiries.createdAt));
  return rows;
}

export async function getPortalSummary(userId: number) {
  const db = await getDb();
  const [favouriteRows, searchRows, enquiryRows] = await Promise.all([
    db
      .select({ value: count() })
      .from(favourites)
      .where(eq(favourites.userId, userId)),
    db
      .select({ value: count() })
      .from(savedSearches)
      .where(eq(savedSearches.userId, userId)),
    db
      .select({ value: count() })
      .from(enquiries)
      .where(eq(enquiries.userId, userId)),
  ]);
  return {
    favoriteCount: Number(favouriteRows[0]?.value ?? 0),
    searchCount: Number(searchRows[0]?.value ?? 0),
    enquiryCount: Number(enquiryRows[0]?.value ?? 0),
  };
}

export async function updateUserName(userId: number, name: string) {
  const db = await getDb();
  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  if (!existing.length) throw new Error("User not found");
  await db.update(users).set({ name }).where(eq(users.id, userId));
  return { success: true as const };
}

async function validateTargets(input: {
  propertyId?: number;
  developmentId?: number;
}) {
  const db = await getDb();
  if (input.propertyId !== undefined) {
    const property = await db
      .select({ id: properties.id })
      .from(properties)
      .where(
        and(
          eq(properties.id, input.propertyId),
          eq(properties.status, "active")
        )
      )
      .limit(1);
    if (!property.length) throw new Error("Active property not found");
  }
  if (input.developmentId !== undefined) {
    const development = await db
      .select({ id: developments.id })
      .from(developments)
      .where(eq(developments.id, input.developmentId))
      .limit(1);
    if (!development.length) throw new Error("Development not found");
  }
}

export async function createPortalRequest(input: {
  userId?: number;
  type: PortalRequestType;
  name: string;
  email: string;
  phone?: string;
  message: string;
  propertyId?: number;
  developmentId?: number;
}) {
  await validateTargets(input);
  const db = await getDb();
  const result = await db.insert(portalRequests).values(input);
  return { id: Number(result[0].insertId) };
}

export async function getUserPortalRequests(userId: number) {
  const db = await getDb();
  return db
    .select()
    .from(portalRequests)
    .where(eq(portalRequests.userId, userId))
    .orderBy(desc(portalRequests.createdAt));
}

export async function subscribeNewsletter(email: string) {
  const db = await getDb();
  await db
    .insert(newsletterSubscribers)
    .values({ email, consentedAt: new Date() })
    .onDuplicateKeyUpdate({ set: { email, consentedAt: new Date() } });
  return { subscribed: true as const };
}

export async function createListingReport(input: {
  propertyId: number;
  userId?: number;
  reason: string;
  details?: string;
  email?: string;
}) {
  await validateTargets({ propertyId: input.propertyId });
  const db = await getDb();
  const result = await db.insert(listingReports).values(input);
  return { id: Number(result[0].insertId) };
}

export async function getAdminStats() {
  const db = await getDb();
  const [
    propertyRows,
    userRows,
    enquiryRows,
    reportRows,
    requestRows,
    pendingReports,
    pendingRequests,
  ] = await Promise.all([
    db.select({ value: count() }).from(properties),
    db.select({ value: count() }).from(users),
    db.select({ value: count() }).from(enquiries),
    db.select({ value: count() }).from(listingReports),
    db.select({ value: count() }).from(portalRequests),
    db
      .select({ value: count() })
      .from(listingReports)
      .where(eq(listingReports.status, "pending")),
    db
      .select({ value: count() })
      .from(portalRequests)
      .where(eq(portalRequests.status, "pending")),
  ]);
  const value = (rows: Array<{ value: number | string }> | undefined) =>
    Number(rows?.[0]?.value ?? 0);
  return {
    properties: value(propertyRows),
    users: value(userRows),
    enquiries: value(enquiryRows),
    reports: value(reportRows),
    requests: value(requestRows),
    pending: value(pendingReports) + value(pendingRequests),
  };
}

export async function getAdminRequests() {
  const db = await getDb();
  return db
    .select()
    .from(portalRequests)
    .orderBy(desc(portalRequests.createdAt));
}

export async function getAdminReports() {
  const db = await getDb();
  return db
    .select()
    .from(listingReports)
    .orderBy(desc(listingReports.createdAt));
}

export async function resolvePortalRequest(
  id: number,
  status: Exclude<PortalRequestStatus, "pending">
) {
  const db = await getDb();
  const existing = await db
    .select({ id: portalRequests.id })
    .from(portalRequests)
    .where(eq(portalRequests.id, id))
    .limit(1);
  if (!existing.length) throw new Error("Request not found");
  await db
    .update(portalRequests)
    .set({ status })
    .where(eq(portalRequests.id, id));
  return { success: true as const };
}

export async function resolveListingReport(id: number) {
  const db = await getDb();
  const existing = await db
    .select({ id: listingReports.id })
    .from(listingReports)
    .where(eq(listingReports.id, id))
    .limit(1);
  if (!existing.length) throw new Error("Report not found");
  await db
    .update(listingReports)
    .set({ status: "resolved", resolvedAt: new Date() })
    .where(eq(listingReports.id, id));
  return { success: true as const };
}
