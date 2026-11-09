import { createConnection } from "mysql2/promise";
import { drizzle } from "drizzle-orm/mysql2";
import { count, eq } from "drizzle-orm";
import {
  agents,
  developments,
  properties,
  seedVersions,
} from "../drizzle/schema";
import {
  seedAgents,
  seedDevelopments,
  seedProperties,
} from "../shared/marketplace";

const SEED_KEY = "finzproperty-demo-inventory";
const SEED_VERSION = "1";

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error("DATABASE_URL is required");

  const connection = await createConnection(databaseUrl);
  try {
    const db = drizzle(connection);
    await db.transaction(async tx => {
      const alreadyApplied = await tx
        .select({ id: seedVersions.id })
        .from(seedVersions)
        .where(eq(seedVersions.seedKey, SEED_KEY))
        .limit(1);
      if (alreadyApplied.length) {
        console.log(
          `Demo seed ${SEED_VERSION} is already recorded; nothing to do.`
        );
        return;
      }

      const [agentCount, propertyCount, developmentCount] = await Promise.all([
        tx.select({ value: count() }).from(agents),
        tx.select({ value: count() }).from(properties),
        tx.select({ value: count() }).from(developments),
      ]);
      const inventoryIsEmpty = [
        agentCount,
        propertyCount,
        developmentCount,
      ].every(rows => Number(rows[0]?.value ?? 0) === 0);
      if (!inventoryIsEmpty) {
        console.log(
          "Inventory is not entirely empty; demo records were not inserted."
        );
        return;
      }

      await tx.insert(agents).values(
        seedAgents.map(agent => ({
          slug: agent.slug,
          name: agent.name,
          company: agent.company,
          location: agent.location,
          avatar: agent.avatar,
          verified: agent.verified,
          phone: agent.phone,
          listings: 0,
          bio: agent.bio,
          isDemo: true,
        }))
      );

      await tx.insert(developments).values(
        seedDevelopments.map(development => ({
          slug: development.slug,
          name: development.name,
          developer: development.developer,
          location: development.location,
          status: development.status,
          fromPrice: development.fromPrice,
          units: development.units,
          image: development.image,
          accent: development.accent,
          isDemo: true,
        }))
      );

      const insertedAgents = await tx
        .select({ id: agents.id, slug: agents.slug })
        .from(agents);
      const agentIdBySlug = new Map(
        insertedAgents.map(agent => [agent.slug, agent.id])
      );
      const missingAgent = seedAgents.find(
        agent => !agentIdBySlug.has(agent.slug)
      );
      if (missingAgent)
        throw new Error(
          `Demo agent insert could not be verified: ${missingAgent.slug}`
        );

      await tx.insert(properties).values(
        seedProperties.map(property => {
          const agentId = agentIdBySlug.get(
            seedAgents.find(agent => agent.id === property.agentId)?.slug ?? ""
          );
          if (!agentId)
            throw new Error(
              `Demo property agent could not be resolved: ${property.slug}`
            );
          return {
            slug: property.slug,
            title: property.title,
            intent: property.intent,
            kind: property.kind,
            location: property.location,
            district: property.district,
            city: property.city,
            price: property.price,
            bedrooms: property.bedrooms,
            bathrooms: property.bathrooms,
            landSize: property.landSize ?? null,
            floorArea: property.floorArea ?? null,
            image: property.image,
            gallery: JSON.stringify(property.gallery),
            featured: property.featured ?? false,
            verified: property.verified ?? false,
            tag: property.tag ?? null,
            agentId,
            description: property.description,
            amenities: JSON.stringify(property.amenities),
            posted: property.posted,
            status: property.status,
            isDemo: true,
          };
        })
      );

      await tx
        .insert(seedVersions)
        .values({ seedKey: SEED_KEY, version: SEED_VERSION });
      console.log(
        `Inserted ${seedProperties.length} demo properties, ${seedAgents.length} agents, and ${seedDevelopments.length} developments.`
      );
    });
  } finally {
    await connection.end();
  }
}

void main().catch(error => {
  console.error("Demo seed failed:", error);
  process.exitCode = 1;
});
