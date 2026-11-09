import { and, desc, eq, like, or, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  agents,
  developments,
  enquiries,
  favourites,
  InsertUser,
  properties,
  users,
} from "../drizzle/schema";
import type { Agent, Development, Property } from "../shared/marketplace";
import { areaValue } from "../shared/search";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db) {
    if (!process.env.DATABASE_URL)
      throw new Error("Database is not configured");
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      throw new Error("Database is not available", { cause: error });
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  const textFields = ["name", "email", "loginMethod"] as const;
  textFields.forEach(field => {
    if (user[field] !== undefined) {
      values[field] = user[field] ?? null;
      updateSet[field] = user[field] ?? null;
    }
  });
  if (user.lastSignedIn !== undefined) {
    values.lastSignedIn = user.lastSignedIn;
    updateSet.lastSignedIn = user.lastSignedIn;
  }
  if (user.role !== undefined) {
    values.role = user.role;
    updateSet.role = user.role;
  } else if (user.openId === ENV.ownerOpenId) {
    values.role = "admin";
    updateSet.role = "admin";
  }
  if (!values.lastSignedIn) values.lastSignedIn = new Date();
  if (!Object.keys(updateSet).length) updateSet.lastSignedIn = new Date();
  await db
    .insert(users)
    .values(values)
    .onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  const result = await db
    .select()
    .from(users)
    .where(eq(users.openId, openId))
    .limit(1);
  return result[0];
}

type PropertyWithDemo = Property & { isDemo: boolean };
type AgentWithDemo = Agent & { isDemo: boolean };
type DevelopmentWithDemo = Development & { isDemo: boolean };

function parseNumericMeasurement(
  value: string | null | undefined
): number | undefined {
  if (!value) return undefined;
  const match = value.replace(/,/g, "").match(/\d+(?:\.\d+)?/);
  return match ? Number(match[0]) : undefined;
}

function parseJsonArray(value: string, field: string): string[] {
  const parsed: unknown = JSON.parse(value || "[]");
  if (
    !Array.isArray(parsed) ||
    !parsed.every(item => typeof item === "string")
  ) {
    throw new Error(`Invalid ${field} data in property record`);
  }
  return parsed;
}

function hydrateProperty(
  row: typeof properties.$inferSelect,
  agent?: typeof agents.$inferSelect
): PropertyWithDemo {
  return {
    ...row,
    landSize: row.landSize ?? undefined,
    floorArea: row.floorArea ?? undefined,
    tag: row.tag ?? undefined,
    subtype: row.subtype ?? undefined,
    videoUrl: row.videoUrl ?? undefined,
    tourUrl: row.tourUrl ?? undefined,
    developmentId: row.developmentId ?? undefined,
    gallery: parseJsonArray(row.gallery, "gallery"),
    amenities: parseJsonArray(row.amenities, "amenities"),
    agentId: row.agentId,
    agentName: agent?.name ?? "",
    agentCompany: agent?.company ?? "",
    agentAvatar: agent?.avatar ?? "",
    status: row.status as Property["status"],
    intent: row.intent as Property["intent"],
    kind: row.kind as Property["kind"],
    isDemo: row.isDemo,
  };
}

function propertyMatchesNumericFilters(
  property: Property,
  input: {
    minLand?: number;
    maxLand?: number;
    minArea?: number;
    maxArea?: number;
  }
) {
  const land = property.landSize
    ? areaValue(property.landSize, true)
    : undefined;
  const area = property.floorArea ? areaValue(property.floorArea) : undefined;
  if (
    input.minLand !== undefined &&
    (land === undefined || land < input.minLand)
  )
    return false;
  if (
    input.maxLand !== undefined &&
    (land === undefined || land > input.maxLand)
  )
    return false;
  if (
    input.minArea !== undefined &&
    (area === undefined || area < input.minArea)
  )
    return false;
  if (
    input.maxArea !== undefined &&
    (area === undefined || area > input.maxArea)
  )
    return false;
  return true;
}

export type MarketplaceListingInput = {
  intent?: "buy" | "rent";
  kind?: string;
  district?: string;
  q?: string;
  featured?: boolean;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  bathrooms?: number;
  minArea?: number;
  maxArea?: number;
  minLand?: number;
  maxLand?: number;
  amenity?: string;
  agentId?: number;
};

export async function listMarketplaceProperties(
  input: MarketplaceListingInput = {}
): Promise<Property[]> {
  const db = await getDb();
  const filters = [eq(properties.status, "active")];
  if (input.intent) filters.push(eq(properties.intent, input.intent));
  if (input.kind && input.kind !== "all")
    filters.push(eq(properties.kind, input.kind as "House"));
  if (input.district && input.district !== "all")
    filters.push(eq(properties.district, input.district));
  if (input.featured) filters.push(eq(properties.featured, true));
  if (input.minPrice !== undefined)
    filters.push(sql`${properties.price} >= ${input.minPrice}`);
  if (input.maxPrice !== undefined)
    filters.push(sql`${properties.price} <= ${input.maxPrice}`);
  if (input.bedrooms !== undefined)
    filters.push(sql`${properties.bedrooms} >= ${input.bedrooms}`);
  if (input.bathrooms !== undefined)
    filters.push(sql`${properties.bathrooms} >= ${input.bathrooms}`);
  if (input.agentId !== undefined)
    filters.push(eq(properties.agentId, input.agentId));
  if (input.q) {
    filters.push(
      or(
        like(properties.title, `%${input.q}%`),
        like(properties.location, `%${input.q}%`)
      ) as never
    );
  }

  const rows = await db
    .select()
    .from(properties)
    .where(and(...filters))
    .orderBy(desc(properties.featured), desc(properties.createdAt));
  const agentRows = rows.length ? await db.select().from(agents) : [];
  const byId = new Map(agentRows.map(row => [row.id, row]));
  const hydrated = rows.map(row => hydrateProperty(row, byId.get(row.agentId)));
  const amenity = input.amenity?.trim().toLowerCase();
  return hydrated.filter(
    property =>
      (!amenity ||
        property.amenities.some(
          item =>
            item.toLowerCase() === amenity ||
            item.toLowerCase().includes(amenity)
        )) &&
      propertyMatchesNumericFilters(property, input)
  );
}

export async function getMarketplaceProperty(
  slug: string
): Promise<Property | undefined> {
  const db = await getDb();
  const rows = await db
    .select()
    .from(properties)
    .where(and(eq(properties.slug, slug), eq(properties.status, "active")))
    .limit(1);
  if (!rows.length) return undefined;
  const agentRows = await db
    .select()
    .from(agents)
    .where(eq(agents.id, rows[0].agentId))
    .limit(1);
  return hydrateProperty(rows[0], agentRows[0]);
}

export async function listMarketplaceAgents(
  input: { q?: string; location?: string } = {}
): Promise<Agent[]> {
  const db = await getDb();
  const rows = await db
    .select()
    .from(agents)
    .orderBy(desc(agents.verified), desc(agents.createdAt));
  const activeCounts = await db
    .select({ agentId: properties.agentId, count: sql<number>`count(*)` })
    .from(properties)
    .where(eq(properties.status, "active"))
    .groupBy(properties.agentId);
  const countByAgent = new Map(
    activeCounts.map(row => [row.agentId, Number(row.count)])
  );
  const q = input.q?.trim().toLowerCase();
  const location = input.location?.trim().toLowerCase();
  return rows
    .filter(
      row =>
        (!q || `${row.name} ${row.company}`.toLowerCase().includes(q)) &&
        (!location ||
          location === "all" ||
          row.location.toLowerCase().includes(location))
    )
    .map(
      row =>
        ({
          ...row,
          listings: countByAgent.get(row.id) ?? 0,
          isDemo: row.isDemo,
        }) as AgentWithDemo
    );
}

export async function listMarketplaceDevelopments(): Promise<Development[]> {
  const db = await getDb();
  const rows = await db
    .select()
    .from(developments)
    .orderBy(desc(developments.createdAt));
  return rows.map(
    row => ({ ...row, isDemo: row.isDemo }) as DevelopmentWithDemo
  );
}

export async function createEnquiry(input: {
  propertyId: number;
  userId?: number;
  name: string;
  email: string;
  phone?: string;
  message: string;
  viewingDate?: string;
}) {
  const db = await getDb();
  const property = await db
    .select({ id: properties.id })
    .from(properties)
    .where(
      and(eq(properties.id, input.propertyId), eq(properties.status, "active"))
    )
    .limit(1);
  if (!property.length) throw new Error("Active property not found");
  const result = await db.insert(enquiries).values(input);
  return { id: Number(result[0].insertId), ...input };
}

export async function toggleFavourite(userId: number, propertyId: number) {
  const db = await getDb();
  return db.transaction(async tx => {
    const owner = await tx
      .select({ id: users.id })
      .from(users)
      .where(eq(users.id, userId))
      .for("update");
    if (!owner.length) throw new Error("User not found");
    const property = await tx
      .select({ id: properties.id })
      .from(properties)
      .where(
        and(eq(properties.id, propertyId), eq(properties.status, "active"))
      )
      .limit(1);
    if (!property.length) throw new Error("Active property not found");
    const condition = and(
      eq(favourites.userId, userId),
      eq(favourites.propertyId, propertyId)
    );
    const existing = await tx
      .select()
      .from(favourites)
      .where(condition)
      .limit(1);
    if (existing.length) {
      await tx.delete(favourites).where(condition);
      return { saved: false };
    }
    await tx.insert(favourites).values({ userId, propertyId });
    return { saved: true };
  });
}

export async function listFavourites(userId: number) {
  const db = await getDb();
  const rows = await db
    .select({ propertyId: favourites.propertyId })
    .from(favourites)
    .innerJoin(properties, eq(properties.id, favourites.propertyId))
    .where(and(eq(favourites.userId, userId), eq(properties.status, "active")));
  return [...new Set(rows.map(row => row.propertyId))];
}
