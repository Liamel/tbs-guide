import { z } from "zod";

import { locales } from "@/lib/i18n";

export const localeTextSchema = z.object({
  en: z.string(),
  ka: z.string(),
  ru: z.string(),
});

export const entryTranslationSchema = z.object({
  eyebrow: z.string(),
  title: z.string(),
  summary: z.string(),
  body: z.string(),
  seoTitle: z.string(),
  seoDescription: z.string(),
  pullQuote: z.string(),
  journeyTitle: z.string(),
  journeySummary: z.string(),
  locationLabel: z.string(),
  mapLabel: z.string(),
});

export const entryFormSchema = z.object({
  id: z.string().optional(),
  type: z.enum(["heritage", "vineyard", "experience", "destination"]),
  slug: z.string().min(3),
  regionId: z.string().min(1),
  heroMediaId: z.string().min(1),
  categoryIds: z.array(z.string()).default([]),
  address: localeTextSchema,
  latitude: z.number(),
  longitude: z.number(),
  isPublished: z.boolean(),
  isFeatured: z.boolean(),
  sortOrder: z.number().int().default(0),
  translations: z.object({
    en: entryTranslationSchema,
    ka: entryTranslationSchema,
    ru: entryTranslationSchema,
  }),
  highlights: z.array(
    z.object({
      id: z.string().optional(),
      sortOrder: z.number().int(),
      title: localeTextSchema,
      description: localeTextSchema,
    }),
  ),
  transports: z.array(
    z.object({
      id: z.string().optional(),
      mode: z.string(),
      sortOrder: z.number().int(),
      title: localeTextSchema,
      description: localeTextSchema,
      ctaLabel: localeTextSchema,
      ctaHref: z.string(),
    }),
  ),
});

export type EntryFormValues = z.infer<typeof entryFormSchema>;

export const homepageFormSchema = z.object({
  key: z.string().default("main"),
  heroKicker: localeTextSchema,
  heroLead: localeTextSchema,
  heroAccent: localeTextSchema,
  heroDescription: localeTextSchema,
  primaryCtaLabel: localeTextSchema,
  secondaryCtaLabel: localeTextSchema,
  newsletterTitle: localeTextSchema,
  newsletterDescription: localeTextSchema,
  featuredSlots: z.record(z.string(), z.string()),
});

export type HomepageFormValues = z.infer<typeof homepageFormSchema>;

export const cmsUserCreateSchema = z.object({
  name: z.string().min(2),
  username: z
    .string()
    .min(3)
    .regex(/^[a-z0-9_]+$/),
  password: z.string().min(8),
  email: z.string().email().optional().or(z.literal("")),
});

export type CmsUserCreateValues = z.infer<typeof cmsUserCreateSchema>;

export const cmsPasswordResetSchema = z.object({
  userId: z.string().min(1),
  password: z.string().min(8),
});

export type CmsPasswordResetValues = z.infer<typeof cmsPasswordResetSchema>;

export function ensurePublishableTranslations(values: EntryFormValues) {
  if (!values.isPublished) {
    return;
  }

  for (const locale of locales) {
    const translation = values.translations[locale];
    const requiredFields = [
      translation.title,
      translation.summary,
      translation.body,
      translation.seoTitle,
      translation.seoDescription,
      translation.journeyTitle,
      translation.journeySummary,
      translation.locationLabel,
      translation.mapLabel,
    ];

    if (requiredFields.some((field) => !field.trim())) {
      throw new Error(`Locale "${locale}" must be fully populated before publishing.`);
    }
  }
}

export function createEmptyEntryDraft(): EntryFormValues {
  const blankTranslation = {
    eyebrow: "",
    title: "",
    summary: "",
    body: "",
    seoTitle: "",
    seoDescription: "",
    pullQuote: "",
    journeyTitle: "",
    journeySummary: "",
    locationLabel: "",
    mapLabel: "",
  };

  return {
    type: "heritage",
    slug: "",
    regionId: "",
    heroMediaId: "",
    categoryIds: [],
    address: {
      en: "",
      ka: "",
      ru: "",
    },
    latitude: 41.7151,
    longitude: 44.8271,
    isPublished: false,
    isFeatured: false,
    sortOrder: 0,
    translations: {
      en: { ...blankTranslation },
      ka: { ...blankTranslation },
      ru: { ...blankTranslation },
    },
    highlights: [],
    transports: [],
  };
}
