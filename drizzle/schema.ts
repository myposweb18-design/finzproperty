import {
  boolean,
  bigint,
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const agents = mysqlTable("agents", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 180 }).notNull().unique(),
  name: varchar("name", { length: 180 }).notNull(),
  company: varchar("company", { length: 180 }).notNull(),
  location: varchar("location", { length: 180 }).notNull(),
  avatar: text("avatar").notNull(),
  verified: boolean("verified").default(false).notNull(),
  phone: varchar("phone", { length: 40 }).notNull(),
  listings: int("listings").default(0).notNull(),
  bio: text("bio").notNull(),
  isDemo: boolean("isDemo").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const developments = mysqlTable("developments", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 180 }).notNull().unique(),
  name: varchar("name", { length: 180 }).notNull(),
  developer: varchar("developer", { length: 180 }).notNull(),
  location: varchar("location", { length: 180 }).notNull(),
  status: varchar("status", { length: 120 }).notNull(),
  fromPrice: bigint("fromPrice", { mode: "number" }).notNull(),
  units: varchar("units", { length: 180 }).notNull(),
  image: text("image").notNull(),
  accent: varchar("accent", { length: 120 }).notNull(),
  isDemo: boolean("isDemo").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const properties = mysqlTable("properties", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 220 }).notNull().unique(),
  title: varchar("title", { length: 220 }).notNull(),
  intent: mysqlEnum("intent", ["buy", "rent"]).notNull(),
  kind: mysqlEnum("kind", [
    "House",
    "Apartment",
    "Land",
    "Commercial",
    "Bungalow",
    "Villa",
    "Studio",
    "Annex",
    "Hostel",
    "Room",
  ]).notNull(),
  location: varchar("location", { length: 220 }).notNull(),
  district: varchar("district", { length: 120 }).notNull(),
  city: varchar("city", { length: 120 }).notNull(),
  price: bigint("price", { mode: "number" }).notNull(),
  bedrooms: int("bedrooms").default(0).notNull(),
  bathrooms: int("bathrooms").default(0).notNull(),
  landSize: varchar("landSize", { length: 80 }),
  floorArea: varchar("floorArea", { length: 80 }),
  image: text("image").notNull(),
  gallery: text("gallery").notNull(),
  featured: boolean("featured").default(false).notNull(),
  verified: boolean("verified").default(false).notNull(),
  tag: varchar("tag", { length: 80 }),
  agentId: int("agentId").notNull(),
  description: text("description").notNull(),
  amenities: text("amenities").notNull(),
  posted: varchar("posted", { length: 80 }).notNull(),
  status: mysqlEnum("status", ["active", "pending", "sold"])
    .default("active")
    .notNull(),
  subtype: varchar("subtype", { length: 100 }),
  shortTerm: boolean("shortTerm").default(false).notNull(),
  urgent: boolean("urgent").default(false).notNull(),
  ready: boolean("ready").default(false).notNull(),
  offPlan: boolean("offPlan").default(false).notNull(),
  videoUrl: text("videoUrl"),
  tourUrl: text("tourUrl"),
  developmentId: int("developmentId"),
  isDemo: boolean("isDemo").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const favourites = mysqlTable("favourites", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  propertyId: int("propertyId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const savedSearches = mysqlTable("savedSearches", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 160 }).notNull(),
  query: text("query").notNull(),
  frequency: varchar("frequency", { length: 32 }).default("instant").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const enquiries = mysqlTable("enquiries", {
  id: int("id").autoincrement().primaryKey(),
  propertyId: int("propertyId").notNull(),
  userId: int("userId"),
  name: varchar("name", { length: 160 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  phone: varchar("phone", { length: 40 }),
  message: text("message").notNull(),
  viewingDate: varchar("viewingDate", { length: 60 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const portalRequests = mysqlTable("portalRequests", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  type: mysqlEnum("type", [
    "contact",
    "project",
    "valuation",
    "wanted",
    "service",
    "mortgage",
    "event",
  ]).notNull(),
  name: varchar("name", { length: 160 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  phone: varchar("phone", { length: 40 }),
  message: text("message").notNull(),
  propertyId: int("propertyId"),
  developmentId: int("developmentId"),
  status: mysqlEnum("status", ["pending", "reviewed", "closed"])
    .default("pending")
    .notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const newsletterSubscribers = mysqlTable("newsletterSubscribers", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  consentedAt: timestamp("consentedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const listingReports = mysqlTable("listingReports", {
  id: int("id").autoincrement().primaryKey(),
  propertyId: int("propertyId").notNull(),
  userId: int("userId"),
  reason: varchar("reason", { length: 160 }).notNull(),
  details: text("details"),
  email: varchar("email", { length: 320 }),
  status: mysqlEnum("status", ["pending", "resolved"])
    .default("pending")
    .notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  resolvedAt: timestamp("resolvedAt"),
});

export const seedVersions = mysqlTable("seedVersions", {
  id: int("id").autoincrement().primaryKey(),
  seedKey: varchar("seedKey", { length: 120 }).notNull().unique(),
  version: varchar("version", { length: 40 }).notNull(),
  appliedAt: timestamp("appliedAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type PropertyRow = typeof properties.$inferSelect;
export type AgentRow = typeof agents.$inferSelect;
export type DevelopmentRow = typeof developments.$inferSelect;
export type PortalRequestRow = typeof portalRequests.$inferSelect;
export type ListingReportRow = typeof listingReports.$inferSelect;
