import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  jsonb,
  numeric,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

import type { EntryType, Locale, LocaleText } from "@/lib/i18n";

const localeEnumValues = ["en", "ka", "ru"] as const;
const entryTypeValues = ["heritage", "vineyard", "experience", "destination"] as const;

const now = () => new Date();
const id = () => crypto.randomUUID();

export const localeEnum = text("locale", {
  enum: localeEnumValues,
});

export const entryTypeEnum = text("type", {
  enum: entryTypeValues,
});

export const users = pgTable("user", {
  id: text("id")
    .primaryKey()
    .$defaultFn(id),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("emailVerified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("createdAt", { withTimezone: true }).notNull().$defaultFn(now),
  updatedAt: timestamp("updatedAt", { withTimezone: true }).notNull().$defaultFn(now),
  username: text("username").unique(),
  displayUsername: text("displayUsername"),
  role: text("role").notNull().default("moderator"),
  banned: boolean("banned").default(false),
  banReason: text("banReason"),
  banExpires: timestamp("banExpires", { withTimezone: true }),
});

export const sessions = pgTable("session", {
  id: text("id")
    .primaryKey()
    .$defaultFn(id),
  expiresAt: timestamp("expiresAt", { withTimezone: true }).notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("createdAt", { withTimezone: true }).notNull().$defaultFn(now),
  updatedAt: timestamp("updatedAt", { withTimezone: true }).notNull().$defaultFn(now),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  impersonatedBy: text("impersonatedBy"),
});

export const accounts = pgTable("account", {
  id: text("id")
    .primaryKey()
    .$defaultFn(id),
  accountId: text("accountId").notNull(),
  providerId: text("providerId").notNull(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  idToken: text("idToken"),
  accessTokenExpiresAt: timestamp("accessTokenExpiresAt", { withTimezone: true }),
  refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt", { withTimezone: true }),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("createdAt", { withTimezone: true }).notNull().$defaultFn(now),
  updatedAt: timestamp("updatedAt", { withTimezone: true }).notNull().$defaultFn(now),
});

export const verifications = pgTable("verification", {
  id: text("id")
    .primaryKey()
    .$defaultFn(id),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expiresAt", { withTimezone: true }).notNull(),
  createdAt: timestamp("createdAt", { withTimezone: true }).notNull().$defaultFn(now),
  updatedAt: timestamp("updatedAt", { withTimezone: true }).notNull().$defaultFn(now),
});

export const regions = pgTable("region", {
  id: text("id")
    .primaryKey()
    .$defaultFn(id),
  slug: text("slug").notNull().unique(),
  name: jsonb("name").$type<LocaleText>().notNull(),
  description: jsonb("description").$type<LocaleText>().notNull(),
  orderIndex: integer("orderIndex").notNull().default(0),
});

export const categories = pgTable("category", {
  id: text("id")
    .primaryKey()
    .$defaultFn(id),
  slug: text("slug").notNull().unique(),
  type: entryTypeEnum.notNull(),
  label: jsonb("label").$type<LocaleText>().notNull(),
  orderIndex: integer("orderIndex").notNull().default(0),
});

export const mediaAssets = pgTable("media_asset", {
  id: text("id")
    .primaryKey()
    .$defaultFn(id),
  publicId: text("publicId").notNull(),
  secureUrl: text("secureUrl").notNull(),
  width: integer("width").notNull().default(0),
  height: integer("height").notNull().default(0),
  blurDataUrl: text("blurDataUrl"),
  alt: jsonb("alt").$type<LocaleText>().notNull(),
  kind: text("kind").notNull().default("photo"),
  createdAt: timestamp("createdAt", { withTimezone: true }).notNull().$defaultFn(now),
  updatedAt: timestamp("updatedAt", { withTimezone: true }).notNull().$defaultFn(now),
});

export const entries = pgTable(
  "entry",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(id),
    type: entryTypeEnum.notNull(),
    slug: text("slug").notNull(),
    regionId: text("regionId")
      .notNull()
      .references(() => regions.id, { onDelete: "restrict" }),
    heroMediaId: text("heroMediaId").references(() => mediaAssets.id, {
      onDelete: "set null",
    }),
    address: jsonb("address").$type<LocaleText>().notNull(),
    latitude: numeric("latitude", { precision: 9, scale: 6 }).notNull(),
    longitude: numeric("longitude", { precision: 9, scale: 6 }).notNull(),
    isPublished: boolean("isPublished").notNull().default(false),
    isFeatured: boolean("isFeatured").notNull().default(false),
    sortOrder: integer("sortOrder").notNull().default(0),
    createdByUserId: text("createdByUserId").references(() => users.id, {
      onDelete: "set null",
    }),
    updatedByUserId: text("updatedByUserId").references(() => users.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("createdAt", { withTimezone: true }).notNull().$defaultFn(now),
    updatedAt: timestamp("updatedAt", { withTimezone: true }).notNull().$defaultFn(now),
  },
  (table) => [uniqueIndex("entry_slug_unique").on(table.slug)],
);

export const entryTranslations = pgTable(
  "entry_translation",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(id),
    entryId: text("entryId")
      .notNull()
      .references(() => entries.id, { onDelete: "cascade" }),
    locale: localeEnum.notNull(),
    eyebrow: text("eyebrow").notNull().default(""),
    title: text("title").notNull(),
    summary: text("summary").notNull(),
    body: text("body").notNull(),
    seoTitle: text("seoTitle").notNull().default(""),
    seoDescription: text("seoDescription").notNull().default(""),
    pullQuote: text("pullQuote").notNull().default(""),
    journeyTitle: text("journeyTitle").notNull().default(""),
    journeySummary: text("journeySummary").notNull().default(""),
    locationLabel: text("locationLabel").notNull().default(""),
    mapLabel: text("mapLabel").notNull().default(""),
  },
  (table) => [uniqueIndex("entry_translation_unique").on(table.entryId, table.locale)],
);

export const entryCategoryLinks = pgTable(
  "entry_category_link",
  {
    entryId: text("entryId")
      .notNull()
      .references(() => entries.id, { onDelete: "cascade" }),
    categoryId: text("categoryId")
      .notNull()
      .references(() => categories.id, { onDelete: "cascade" }),
  },
  (table) => [primaryKey({ columns: [table.entryId, table.categoryId] })],
);

export const entryHighlights = pgTable("entry_highlight", {
  id: text("id")
    .primaryKey()
    .$defaultFn(id),
  entryId: text("entryId")
    .notNull()
    .references(() => entries.id, { onDelete: "cascade" }),
  sortOrder: integer("sortOrder").notNull().default(0),
  title: jsonb("title").$type<LocaleText>().notNull(),
  description: jsonb("description").$type<LocaleText>().notNull(),
});

export const entryTransportOptions = pgTable("entry_transport_option", {
  id: text("id")
    .primaryKey()
    .$defaultFn(id),
  entryId: text("entryId")
    .notNull()
    .references(() => entries.id, { onDelete: "cascade" }),
  mode: text("mode").notNull().default("transfer"),
  sortOrder: integer("sortOrder").notNull().default(0),
  title: jsonb("title").$type<LocaleText>().notNull(),
  description: jsonb("description").$type<LocaleText>().notNull(),
  ctaLabel: jsonb("ctaLabel").$type<LocaleText>().notNull(),
  ctaHref: text("ctaHref").notNull().default("#"),
});

export const homepageContent = pgTable("homepage_content", {
  id: text("id")
    .primaryKey()
    .$defaultFn(id),
  key: text("key").notNull().unique().default("main"),
  heroKicker: jsonb("heroKicker").$type<LocaleText>().notNull(),
  heroLead: jsonb("heroLead").$type<LocaleText>().notNull(),
  heroAccent: jsonb("heroAccent").$type<LocaleText>().notNull(),
  heroDescription: jsonb("heroDescription").$type<LocaleText>().notNull(),
  primaryCtaLabel: jsonb("primaryCtaLabel").$type<LocaleText>().notNull(),
  secondaryCtaLabel: jsonb("secondaryCtaLabel").$type<LocaleText>().notNull(),
  newsletterTitle: jsonb("newsletterTitle").$type<LocaleText>().notNull(),
  newsletterDescription: jsonb("newsletterDescription").$type<LocaleText>().notNull(),
  createdAt: timestamp("createdAt", { withTimezone: true }).notNull().$defaultFn(now),
  updatedAt: timestamp("updatedAt", { withTimezone: true }).notNull().$defaultFn(now),
});

export const homepageFeatureSlots = pgTable("homepage_feature_slot", {
  id: text("id")
    .primaryKey()
    .$defaultFn(id),
  slotKey: text("slotKey").notNull().unique(),
  entryId: text("entryId")
    .notNull()
    .references(() => entries.id, { onDelete: "cascade" }),
  sortOrder: integer("sortOrder").notNull().default(0),
});

export const entryRelations = relations(entries, ({ one, many }) => ({
  region: one(regions, {
    fields: [entries.regionId],
    references: [regions.id],
  }),
  heroMedia: one(mediaAssets, {
    fields: [entries.heroMediaId],
    references: [mediaAssets.id],
  }),
  translations: many(entryTranslations),
  highlights: many(entryHighlights),
  transports: many(entryTransportOptions),
  categoryLinks: many(entryCategoryLinks),
}));

export const entryTranslationRelations = relations(entryTranslations, ({ one }) => ({
  entry: one(entries, {
    fields: [entryTranslations.entryId],
    references: [entries.id],
  }),
}));

export const regionRelations = relations(regions, ({ many }) => ({
  entries: many(entries),
}));

export const mediaRelations = relations(mediaAssets, ({ many }) => ({
  entries: many(entries),
}));

export const categoryRelations = relations(categories, ({ many }) => ({
  entryLinks: many(entryCategoryLinks),
}));

export const entryCategoryLinkRelations = relations(entryCategoryLinks, ({ one }) => ({
  entry: one(entries, {
    fields: [entryCategoryLinks.entryId],
    references: [entries.id],
  }),
  category: one(categories, {
    fields: [entryCategoryLinks.categoryId],
    references: [categories.id],
  }),
}));

export const highlightRelations = relations(entryHighlights, ({ one }) => ({
  entry: one(entries, {
    fields: [entryHighlights.entryId],
    references: [entries.id],
  }),
}));

export const transportRelations = relations(entryTransportOptions, ({ one }) => ({
  entry: one(entries, {
    fields: [entryTransportOptions.entryId],
    references: [entries.id],
  }),
}));

export type DbLocale = Locale;
export type DbEntryType = EntryType;

export const schema = {
  user: users,
  session: sessions,
  account: accounts,
  verification: verifications,
  users,
  sessions,
  accounts,
  verifications,
  regions,
  categories,
  mediaAssets,
  entries,
  entryTranslations,
  entryCategoryLinks,
  entryHighlights,
  entryTransportOptions,
  homepageContent,
  homepageFeatureSlots,
};
