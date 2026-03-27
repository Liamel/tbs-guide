import { asc, eq } from "drizzle-orm";

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
import { defaultLocale, getEntryTypeFromSection, getSectionFromEntryType, pickLocaleText } from "@/lib/i18n";
import type {
  DestinationView,
  EntryCardView,
  EntryDetailView,
  EntryRecord,
  MediaAssetRecord,
  HomepageView,
  SearchResultView,
  SiteSnapshot,
} from "@/lib/content/types";
import type { EntrySection, EntryType, Locale } from "@/lib/i18n";
import { normalizeMediaAssetUrl } from "@/lib/content/media";
import { sampleSiteSnapshot } from "@/lib/content/sample-data";

function fallbackSnapshot() {
  return normalizeSnapshot(structuredClone(sampleSiteSnapshot));
}

function normalizeMediaAssetRecord(asset: MediaAssetRecord): MediaAssetRecord {
  return {
    ...asset,
    secureUrl: normalizeMediaAssetUrl(asset.secureUrl),
  };
}

function normalizeSnapshot(snapshot: SiteSnapshot): SiteSnapshot {
  return {
    ...snapshot,
    mediaAssets: snapshot.mediaAssets.map(normalizeMediaAssetRecord),
  };
}

async function loadSnapshotFromDatabase(): Promise<SiteSnapshot> {
  const db = getDb();

  const [
    regionRows,
    categoryRows,
    mediaRows,
    entryRows,
    translationRows,
    linkRows,
    highlightRows,
    transportRows,
    homepageRow,
    homepageSlotRows,
  ] = await Promise.all([
    db.select().from(regions).orderBy(asc(regions.orderIndex)),
    db.select().from(categories).orderBy(asc(categories.orderIndex)),
    db.select().from(mediaAssets),
    db.select().from(entries).orderBy(asc(entries.sortOrder)),
    db.select().from(entryTranslations),
    db.select().from(entryCategoryLinks),
    db.select().from(entryHighlights).orderBy(asc(entryHighlights.sortOrder)),
    db.select().from(entryTransportOptions).orderBy(asc(entryTransportOptions.sortOrder)),
    db.query.homepageContent.findFirst({
      where: eq(homepageContent.key, "main"),
    }),
    db.select().from(homepageFeatureSlots).orderBy(asc(homepageFeatureSlots.sortOrder)),
  ]);

  const entryMap = new Map<string, EntryRecord>();

  for (const row of entryRows) {
    entryMap.set(row.id, {
      id: row.id,
      type: row.type as EntryType,
      slug: row.slug,
      regionId: row.regionId,
      heroMediaId: row.heroMediaId ?? "",
      categoryIds: [],
      address: row.address,
      latitude: Number(row.latitude),
      longitude: Number(row.longitude),
      isPublished: row.isPublished,
      isFeatured: row.isFeatured,
      sortOrder: row.sortOrder,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
      translations: {} as EntryRecord["translations"],
      highlights: [],
      transports: [],
    });
  }

  for (const row of translationRows) {
    const entry = entryMap.get(row.entryId);
    if (!entry) {
      continue;
    }

    entry.translations[row.locale] = {
      locale: row.locale,
      eyebrow: row.eyebrow,
      title: row.title,
      summary: row.summary,
      body: row.body,
      seoTitle: row.seoTitle,
      seoDescription: row.seoDescription,
      pullQuote: row.pullQuote,
      journeyTitle: row.journeyTitle,
      journeySummary: row.journeySummary,
      locationLabel: row.locationLabel,
      mapLabel: row.mapLabel,
    };
  }

  for (const row of linkRows) {
    const entry = entryMap.get(row.entryId);
    if (entry) {
      entry.categoryIds.push(row.categoryId);
    }
  }

  for (const row of highlightRows) {
    const entry = entryMap.get(row.entryId);
    if (entry) {
      entry.highlights.push({
        id: row.id,
        sortOrder: row.sortOrder,
        title: row.title,
        description: row.description,
      });
    }
  }

  for (const row of transportRows) {
    const entry = entryMap.get(row.entryId);
    if (entry) {
      entry.transports.push({
        id: row.id,
        mode: row.mode,
        sortOrder: row.sortOrder,
        title: row.title,
        description: row.description,
        ctaLabel: row.ctaLabel,
        ctaHref: row.ctaHref,
      });
    }
  }

  if (!homepageRow) {
    return fallbackSnapshot();
  }

  return normalizeSnapshot({
    regions: regionRows,
    categories: categoryRows,
    mediaAssets: mediaRows.map((row) => ({
      ...row,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    })),
    entries: Array.from(entryMap.values()),
    homepage: homepageRow,
    homepageSlots: homepageSlotRows,
  });
}

export async function loadSiteSnapshot(): Promise<SiteSnapshot> {
  if (!hasDatabase()) {
    return fallbackSnapshot();
  }

  try {
    return await loadSnapshotFromDatabase();
  } catch {
    return fallbackSnapshot();
  }
}

function buildCardView(
  snapshot: SiteSnapshot,
  entry: EntryRecord,
  locale: Locale,
): EntryCardView {
  const region = snapshot.regions.find((candidate) => candidate.id === entry.regionId);
  const media = snapshot.mediaAssets.find((candidate) => candidate.id === entry.heroMediaId);
  const categoriesForEntry = snapshot.categories.filter((candidate) =>
    entry.categoryIds.includes(candidate.id),
  );
  const translation = entry.translations[locale] ?? entry.translations[defaultLocale];

  return {
    id: entry.id,
    slug: entry.slug,
    section: getSectionFromEntryType(entry.type),
    type: entry.type,
    title: translation.title,
    eyebrow: translation.eyebrow,
    summary: translation.summary,
    imageUrl: media?.secureUrl ?? sampleSiteSnapshot.mediaAssets[0].secureUrl,
    imageAlt: pickLocaleText(media?.alt, locale) || translation.title,
    regionName: pickLocaleText(region?.name, locale),
    categoryLabels: categoriesForEntry.map((category) => pickLocaleText(category.label, locale)),
    locationLabel: translation.locationLabel,
    featured: entry.isFeatured,
  };
}

function scoreSearchMatch(text: string, query: string, title: string, summary: string, regionName: string) {
  let score = 0;

  if (title.startsWith(query)) {
    score += 60;
  } else if (title.includes(query)) {
    score += 36;
  }

  if (summary.includes(query)) {
    score += 14;
  }

  if (regionName.includes(query)) {
    score += 8;
  }

  if (text.includes(query)) {
    score += 4;
  }

  return score;
}

export async function getDestinationViews(locale: Locale): Promise<DestinationView[]> {
  const snapshot = await loadSiteSnapshot();

  return snapshot.regions
    .slice()
    .sort((left, right) => left.orderIndex - right.orderIndex)
    .map((region) => {
      const regionEntries = snapshot.entries
        .filter((entry) => entry.isPublished && entry.regionId === region.id)
        .sort((left, right) => left.sortOrder - right.sortOrder);
      const leadEntry = regionEntries[0];
      const leadCard = leadEntry ? buildCardView(snapshot, leadEntry, locale) : undefined;

      return {
        id: region.id,
        slug: region.slug,
        name: pickLocaleText(region.name, locale),
        description: pickLocaleText(region.description, locale),
        imageUrl: leadCard?.imageUrl ?? sampleSiteSnapshot.mediaAssets[0].secureUrl,
        imageAlt: leadCard?.imageAlt || pickLocaleText(region.name, locale),
        storyCount: regionEntries.length,
        sections: Array.from(
          new Set(regionEntries.map((entry) => getSectionFromEntryType(entry.type))),
        ),
      };
    });
}

export async function searchEntries(
  locale: Locale,
  query: string,
  limit = 6,
): Promise<SearchResultView[]> {
  const normalizedQuery = query.trim().toLocaleLowerCase();

  if (normalizedQuery.length < 2) {
    return [];
  }

  const snapshot = await loadSiteSnapshot();
  const terms = normalizedQuery.split(/\s+/).filter(Boolean);

  return snapshot.entries
    .filter((entry) => entry.isPublished)
    .flatMap((entry) => {
      const card = buildCardView(snapshot, entry, locale);
      const translation = entry.translations[locale] ?? entry.translations[defaultLocale];
      const searchText = [
        card.title,
        card.summary,
        card.eyebrow,
        card.regionName,
        ...card.categoryLabels,
        translation.body,
      ]
        .join(" ")
        .toLocaleLowerCase();

      if (!terms.every((term) => searchText.includes(term))) {
        return [];
      }

      return [
        {
          ...card,
          score: scoreSearchMatch(
            searchText,
            normalizedQuery,
            card.title.toLocaleLowerCase(),
            card.summary.toLocaleLowerCase(),
            card.regionName.toLocaleLowerCase(),
          ),
        },
      ];
    })
    .sort((left, right) => right.score - left.score)
    .slice(0, limit)
    .map((result) => ({
      id: result.id,
      slug: result.slug,
      section: result.section,
      title: result.title,
      summary: result.summary,
      eyebrow: result.eyebrow,
      imageUrl: result.imageUrl,
      imageAlt: result.imageAlt,
      regionName: result.regionName,
    }));
}

export async function getHomepageView(locale: Locale): Promise<HomepageView> {
  const snapshot = await loadSiteSnapshot();
  const featured = Object.fromEntries(
    snapshot.homepageSlots.map((slot) => [slot.slotKey, snapshot.entries.find((entry) => entry.id === slot.entryId)]),
  );

  const heroImage = snapshot.mediaAssets.find((asset) => asset.id === "media-home-hero");

  return {
    hero: {
      kicker: pickLocaleText(snapshot.homepage.heroKicker, locale),
      lead: pickLocaleText(snapshot.homepage.heroLead, locale),
      accent: pickLocaleText(snapshot.homepage.heroAccent, locale),
      description: pickLocaleText(snapshot.homepage.heroDescription, locale),
      primaryCtaLabel: pickLocaleText(snapshot.homepage.primaryCtaLabel, locale),
      secondaryCtaLabel: pickLocaleText(snapshot.homepage.secondaryCtaLabel, locale),
      featuredImageUrl: heroImage?.secureUrl ?? sampleSiteSnapshot.mediaAssets[0].secureUrl,
    },
    mustSee: ["must-see-1", "must-see-2", "must-see-3"]
      .map((slotKey) => featured[slotKey])
      .filter((entry): entry is EntryRecord => Boolean(entry))
      .map((entry) => buildCardView(snapshot, entry, locale)),
    featuredVineyard: featured["featured-vineyard"]
      ? buildCardView(snapshot, featured["featured-vineyard"], locale)
      : undefined,
    experiences: ["experience-1", "experience-2", "experience-3"]
      .map((slotKey) => featured[slotKey])
      .filter((entry): entry is EntryRecord => Boolean(entry))
      .map((entry) => buildCardView(snapshot, entry, locale)),
    newsletter: {
      title: pickLocaleText(snapshot.homepage.newsletterTitle, locale),
      description: pickLocaleText(snapshot.homepage.newsletterDescription, locale),
    },
  };
}

export async function listEntriesBySection(
  locale: Locale,
  section: EntrySection,
  filters?: {
    categorySlug?: string;
    regionSlug?: string;
  },
) {
  const snapshot = await loadSiteSnapshot();
  const entryType = getEntryTypeFromSection(section);

  if (!entryType) {
    return [];
  }

  const regionId = filters?.regionSlug
    ? snapshot.regions.find((region) => region.slug === filters.regionSlug)?.id
    : undefined;
  const categoryId = filters?.categorySlug
    ? snapshot.categories.find((category) => category.slug === filters.categorySlug)?.id
    : undefined;

  return snapshot.entries
    .filter((entry) => entry.isPublished && entry.type === entryType)
    .filter((entry) => (regionId ? entry.regionId === regionId : true))
    .filter((entry) => (categoryId ? entry.categoryIds.includes(categoryId) : true))
    .sort((left, right) => left.sortOrder - right.sortOrder)
    .map((entry) => buildCardView(snapshot, entry, locale));
}

export async function getEntryDetail(
  locale: Locale,
  section: string,
  slug: string,
): Promise<EntryDetailView | null> {
  const snapshot = await loadSiteSnapshot();
  const entryType = getEntryTypeFromSection(section);
  const entry = snapshot.entries.find(
    (candidate) =>
      candidate.isPublished &&
      candidate.slug === slug &&
      (!entryType || candidate.type === entryType),
  );

  if (!entry) {
    return null;
  }

  const translation = entry.translations[locale] ?? entry.translations[defaultLocale];
  const card = buildCardView(snapshot, entry, locale);

  return {
    ...card,
    body: translation.body,
    pullQuote: translation.pullQuote,
    journeyTitle: translation.journeyTitle,
    journeySummary: translation.journeySummary,
    mapLabel: translation.mapLabel,
    address: pickLocaleText(entry.address, locale),
    latitude: entry.latitude,
    longitude: entry.longitude,
    highlights: entry.highlights.map((highlight) => ({
      id: highlight.id,
      title: pickLocaleText(highlight.title, locale),
      description: pickLocaleText(highlight.description, locale),
    })),
    transports: entry.transports.map((transport) => ({
      id: transport.id,
      mode: transport.mode,
      title: pickLocaleText(transport.title, locale),
      description: pickLocaleText(transport.description, locale),
      ctaLabel: pickLocaleText(transport.ctaLabel, locale),
      ctaHref: transport.ctaHref,
    })),
  };
}

export async function getCmsEntriesSnapshot() {
  return loadSiteSnapshot();
}

export async function getEntryCategoryOptions(type?: EntryType) {
  const snapshot = await loadSiteSnapshot();
  return snapshot.categories
    .filter((category) => (type ? category.type === type : true))
    .sort((left, right) => left.orderIndex - right.orderIndex);
}

export async function getEntryRegionOptions() {
  const snapshot = await loadSiteSnapshot();
  return snapshot.regions.sort((left, right) => left.orderIndex - right.orderIndex);
}
