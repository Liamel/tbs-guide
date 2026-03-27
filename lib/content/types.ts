import type { CmsRole } from "@/lib/auth/roles";
import type { EntrySection, EntryType, Locale, LocaleText } from "@/lib/i18n";

export type RegionRecord = {
  id: string;
  slug: string;
  name: LocaleText;
  description: LocaleText;
  orderIndex: number;
};

export type CategoryRecord = {
  id: string;
  slug: string;
  type: EntryType;
  label: LocaleText;
  orderIndex: number;
};

export type MediaAssetRecord = {
  id: string;
  publicId: string;
  secureUrl: string;
  width: number;
  height: number;
  blurDataUrl?: string | null;
  alt: LocaleText;
  kind: string;
  createdAt: string;
  updatedAt?: string;
};

export type EntryTranslationRecord = {
  locale: Locale;
  eyebrow: string;
  title: string;
  summary: string;
  body: string;
  seoTitle: string;
  seoDescription: string;
  pullQuote: string;
  journeyTitle: string;
  journeySummary: string;
  locationLabel: string;
  mapLabel: string;
};

export type EntryHighlightRecord = {
  id: string;
  sortOrder: number;
  title: LocaleText;
  description: LocaleText;
};

export type EntryTransportRecord = {
  id: string;
  mode: string;
  sortOrder: number;
  title: LocaleText;
  description: LocaleText;
  ctaLabel: LocaleText;
  ctaHref: string;
};

export type EntryRecord = {
  id: string;
  type: EntryType;
  slug: string;
  regionId: string;
  heroMediaId: string;
  categoryIds: string[];
  address: LocaleText;
  latitude: number;
  longitude: number;
  isPublished: boolean;
  isFeatured: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  translations: Record<Locale, EntryTranslationRecord>;
  highlights: EntryHighlightRecord[];
  transports: EntryTransportRecord[];
};

export type HomepageContentRecord = {
  id: string;
  key: string;
  heroKicker: LocaleText;
  heroLead: LocaleText;
  heroAccent: LocaleText;
  heroDescription: LocaleText;
  primaryCtaLabel: LocaleText;
  secondaryCtaLabel: LocaleText;
  newsletterTitle: LocaleText;
  newsletterDescription: LocaleText;
};

export type HomepageFeatureSlotRecord = {
  id: string;
  slotKey: string;
  entryId: string;
  sortOrder: number;
};

export type SiteSnapshot = {
  regions: RegionRecord[];
  categories: CategoryRecord[];
  mediaAssets: MediaAssetRecord[];
  entries: EntryRecord[];
  homepage: HomepageContentRecord;
  homepageSlots: HomepageFeatureSlotRecord[];
};

export type CmsUserRecord = {
  id: string;
  name: string;
  email: string;
  username: string;
  role: CmsRole;
  banned?: boolean | null;
  createdAt: string;
};

export type EntryCardView = {
  id: string;
  slug: string;
  section: EntrySection;
  type: EntryType;
  title: string;
  eyebrow: string;
  summary: string;
  imageUrl: string;
  imageAlt: string;
  regionName: string;
  categoryLabels: string[];
  locationLabel: string;
  featured: boolean;
};

export type EntryDetailView = EntryCardView & {
  body: string;
  pullQuote: string;
  journeyTitle: string;
  journeySummary: string;
  mapLabel: string;
  address: string;
  latitude: number;
  longitude: number;
  highlights: {
    id: string;
    title: string;
    description: string;
  }[];
  transports: {
    id: string;
    mode: string;
    title: string;
    description: string;
    ctaLabel: string;
    ctaHref: string;
  }[];
};

export type HomepageView = {
  hero: {
    kicker: string;
    lead: string;
    accent: string;
    description: string;
    primaryCtaLabel: string;
    secondaryCtaLabel: string;
    featuredImageUrl: string;
  };
  mustSee: EntryCardView[];
  featuredVineyard?: EntryCardView;
  experiences: EntryCardView[];
  newsletter: {
    title: string;
    description: string;
  };
};
