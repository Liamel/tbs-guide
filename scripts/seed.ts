import { config as loadEnv } from "dotenv";

loadEnv({ path: ".env.local", override: true });
loadEnv({ path: ".env", override: false });

import { auth } from "@/lib/auth/auth";
import { env } from "@/lib/env";
import { getDb, hasDatabase } from "@/lib/data/db";
import {
  categories,
  entries,
  entryCategoryLinks,
  entryHighlights,
  entryTransportOptions,
  entryTranslations,
  homepageContent,
  homepageFeatureSlots,
  mediaAssets,
  regions,
} from "@/lib/data/schema";
import { sampleSiteSnapshot } from "@/lib/content/sample-data";

async function main() {
  if (!hasDatabase()) {
    throw new Error("DATABASE_URL is required to seed the database.");
  }

  const db = getDb();

  await db.delete(homepageFeatureSlots);
  await db.delete(homepageContent);
  await db.delete(entryTransportOptions);
  await db.delete(entryHighlights);
  await db.delete(entryCategoryLinks);
  await db.delete(entryTranslations);
  await db.delete(entries);
  await db.delete(categories);
  await db.delete(regions);
  await db.delete(mediaAssets);

  await db.insert(regions).values(sampleSiteSnapshot.regions);
  await db.insert(categories).values(sampleSiteSnapshot.categories);
  await db.insert(mediaAssets).values(
    sampleSiteSnapshot.mediaAssets.map((asset) => ({
      ...asset,
      createdAt: new Date(asset.createdAt),
      updatedAt: new Date(asset.updatedAt ?? asset.createdAt),
    })),
  );
  await db.insert(entries).values(
    sampleSiteSnapshot.entries.map((entry) => ({
      id: entry.id,
      type: entry.type,
      slug: entry.slug,
      regionId: entry.regionId,
      heroMediaId: entry.heroMediaId,
      address: entry.address,
      latitude: entry.latitude.toString(),
      longitude: entry.longitude.toString(),
      isPublished: entry.isPublished,
      isFeatured: entry.isFeatured,
      sortOrder: entry.sortOrder,
      createdAt: new Date(entry.createdAt),
      updatedAt: new Date(entry.updatedAt),
    })),
  );
  await db.insert(entryTranslations).values(
    sampleSiteSnapshot.entries.flatMap((entry) =>
      Object.values(entry.translations).map((translation) => ({
        id: crypto.randomUUID(),
        entryId: entry.id,
        ...translation,
      })),
    ),
  );
  await db.insert(entryCategoryLinks).values(
    sampleSiteSnapshot.entries.flatMap((entry) =>
      entry.categoryIds.map((categoryId) => ({
        entryId: entry.id,
        categoryId,
      })),
    ),
  );
  await db.insert(entryHighlights).values(
    sampleSiteSnapshot.entries.flatMap((entry) =>
      entry.highlights.map((highlight) => ({
        id: highlight.id,
        entryId: entry.id,
        sortOrder: highlight.sortOrder,
        title: highlight.title,
        description: highlight.description,
      })),
    ),
  );
  await db.insert(entryTransportOptions).values(
    sampleSiteSnapshot.entries.flatMap((entry) =>
      entry.transports.map((transport) => ({
        id: transport.id,
        entryId: entry.id,
        mode: transport.mode,
        sortOrder: transport.sortOrder,
        title: transport.title,
        description: transport.description,
        ctaLabel: transport.ctaLabel,
        ctaHref: transport.ctaHref,
      })),
    ),
  );
  await db.insert(homepageContent).values({
    ...sampleSiteSnapshot.homepage,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  await db.insert(homepageFeatureSlots).values(sampleSiteSnapshot.homepageSlots);

  if (env.CMS_OWNER_PASSWORD) {
    try {
      const ownerUser = {
        email: process.env.CMS_OWNER_EMAIL ?? "owner@kartli-guide.internal",
        password: env.CMS_OWNER_PASSWORD,
        name: process.env.CMS_OWNER_NAME ?? "Kartli Owner",
        role: "owner",
        data: {
          username: process.env.CMS_OWNER_USERNAME ?? "kartli_owner",
          displayUsername: process.env.CMS_OWNER_USERNAME ?? "kartli_owner",
        },
      };

      await auth.api.createUser({
        body: ownerUser as never,
      });
    } catch {
      // Ignore duplicate owner bootstrap on repeated seeds.
    }
  }

  console.log("Seed complete.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
