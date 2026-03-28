"use client";

import { startTransition, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";

import { saveEntryAction } from "@/app/CMS/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  CmsField,
  CmsPageHeader,
  CmsSection,
  CmsStatusBadge,
  cmsControlClassName,
  cmsSelectTriggerClassName,
  cmsTextareaClassName,
} from "@/components/cms/cms-ui";
import type { CategoryRecord, EntryRecord, MediaAssetRecord, RegionRecord } from "@/lib/content/types";
import { createEmptyEntryDraft, type EntryFormValues } from "@/lib/content/validators";
import { cn } from "@/lib/utils";
import {
  localeLabels,
  locales,
  pickLocaleText,
  type Locale,
} from "@/lib/i18n";

type TranslationFieldKey = keyof EntryFormValues["translations"]["en"];

type TranslationFieldConfig = {
  key: TranslationFieldKey;
  label: string;
  hint: string;
  kind?: "input" | "textarea";
  inputClassName?: string;
  wrapperClassName?: string;
};

const typeOptions = [
  { value: "heritage", label: "Heritage" },
  { value: "vineyard", label: "Vineyard" },
  { value: "experience", label: "Experience" },
  { value: "destination", label: "Destination" },
] as const satisfies ReadonlyArray<{
  value: EntryFormValues["type"];
  label: string;
}>;

const transportModeOptions = [
  { value: "transfer", label: "Transfer" },
  { value: "bus", label: "Bus" },
  { value: "hike", label: "Hike" },
] as const;

const storyFields: TranslationFieldConfig[] = [
  {
    key: "eyebrow",
    label: "Eyebrow",
    hint: "Short label above the title on listing cards and the detail page hero.",
  },
  {
    key: "title",
    label: "Title",
    hint: "Primary public headline for cards, hero sections, and page titles.",
  },
  {
    key: "summary",
    label: "Summary",
    hint: "Short intro used on listing cards and near the top of the detail page.",
    kind: "textarea",
    inputClassName: "min-h-28",
  },
  {
    key: "body",
    label: "Body",
    hint: "Main long-form story shown in the public detail page.",
    kind: "textarea",
    inputClassName: "min-h-64",
  },
];

const seoFields: TranslationFieldConfig[] = [
  {
    key: "seoTitle",
    label: "SEO Title",
    hint: "Search engine title. Keep it clear and close to the public headline.",
  },
  {
    key: "seoDescription",
    label: "SEO Description",
    hint: "Search snippet shown in results and shared previews.",
    kind: "textarea",
    inputClassName: "min-h-28",
  },
  {
    key: "locationLabel",
    label: "Location Label",
    hint: "Heading above the address block on the public detail page.",
  },
  {
    key: "mapLabel",
    label: "Map Label",
    hint: "Heading above the map section on the public detail page.",
  },
];

const journeyFields: TranslationFieldConfig[] = [
  {
    key: "pullQuote",
    label: "Pull Quote",
    hint: "Optional callout quote between the story and highlights.",
    kind: "textarea",
    inputClassName: "min-h-28",
  },
  {
    key: "journeyTitle",
    label: "Journey Title",
    hint: "Heading above the transport and access options.",
  },
  {
    key: "journeySummary",
    label: "Journey Summary",
    hint: "Short explainer above the transport cards.",
    kind: "textarea",
    inputClassName: "min-h-28",
  },
];

function toFormValue(entry?: EntryRecord): EntryFormValues {
  if (!entry) {
    return createEmptyEntryDraft();
  }

  return {
    id: entry.id,
    type: entry.type,
    slug: entry.slug,
    regionId: entry.regionId,
    heroMediaId: entry.heroMediaId,
    categoryIds: entry.categoryIds,
    address: entry.address,
    latitude: entry.latitude,
    longitude: entry.longitude,
    isPublished: entry.isPublished,
    isFeatured: entry.isFeatured,
    sortOrder: entry.sortOrder,
    translations: entry.translations,
    highlights: entry.highlights,
    transports: entry.transports,
  };
}

function toNumber(value: string) {
  const nextValue = Number(value);
  return Number.isFinite(nextValue) ? nextValue : 0;
}

function isLocalePublishReady(values: EntryFormValues, locale: Locale) {
  const translation = values.translations[locale];
  const requiredFields = [
    values.address[locale],
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

  return requiredFields.every((field) => field.trim().length > 0);
}

export function CmsEntryEditor({
  entry,
  regions,
  categories,
  mediaAssets,
}: {
  entry?: EntryRecord;
  regions: RegionRecord[];
  categories: CategoryRecord[];
  mediaAssets: MediaAssetRecord[];
}) {
  const router = useRouter();
  const [value, setValue] = useState<EntryFormValues>(() => toFormValue(entry));
  const [pending, setPending] = useState(false);

  const formId = entry ? `cms-entry-form-${entry.id}` : "cms-entry-form-new";
  const categoryOptions = useMemo(
    () => categories.filter((category) => category.type === value.type),
    [categories, value.type],
  );

  const localeReadiness = useMemo(
    () =>
      Object.fromEntries(locales.map((locale) => [locale, isLocalePublishReady(value, locale)])) as Record<
        Locale,
        boolean
      >,
    [value],
  );

  function updateTranslation(locale: Locale, field: TranslationFieldKey, nextValue: string) {
    setValue((current) => ({
      ...current,
      translations: {
        ...current.translations,
        [locale]: {
          ...current.translations[locale],
          [field]: nextValue,
        },
      },
    }));
  }

  function updateAddress(locale: Locale, nextValue: string) {
    setValue((current) => ({
      ...current,
      address: {
        ...current.address,
        [locale]: nextValue,
      },
    }));
  }

  function toggleCategory(categoryId: string) {
    setValue((current) => ({
      ...current,
      categoryIds: current.categoryIds.includes(categoryId)
        ? current.categoryIds.filter((value) => value !== categoryId)
        : [...current.categoryIds, categoryId],
    }));
  }

  function renderTranslationField(locale: Locale, field: TranslationFieldConfig) {
    const inputValue = value.translations[locale][field.key];

    return (
      <CmsField
        key={`${locale}-${field.key}`}
        label={field.label}
        hint={field.hint}
        className={field.wrapperClassName}
      >
        {field.kind === "textarea" ? (
          <Textarea
            value={inputValue}
            onChange={(event) => updateTranslation(locale, field.key, event.target.value)}
            className={cn(cmsTextareaClassName, field.inputClassName)}
          />
        ) : (
          <Input
            value={inputValue}
            onChange={(event) => updateTranslation(locale, field.key, event.target.value)}
            className={cn(cmsControlClassName, field.inputClassName)}
          />
        )}
      </CmsField>
    );
  }

  return (
    <div className="space-y-6">
      <CmsPageHeader
        eyebrow="Entry Editor"
        title={entry?.translations.en.title || "Create New Entry"}
        description="This screen controls how an entry appears on cards, detail pages, SEO previews, and journey blocks across every supported language."
        meta={
          <>
            <CmsStatusBadge tone={value.isPublished ? "success" : "warning"}>
              {value.isPublished ? "Published" : "Draft"}
            </CmsStatusBadge>
            <CmsStatusBadge tone={value.isFeatured ? "accent" : "neutral"}>
              {value.isFeatured ? "Featured" : "Standard"}
            </CmsStatusBadge>
            <CmsStatusBadge tone="neutral" className="capitalize">
              {value.type}
            </CmsStatusBadge>
          </>
        }
        actions={
          <Button
            type="submit"
            form={formId}
            data-cms-save="true"
            className="cms-primary-button h-11 rounded-xl"
            disabled={pending}
          >
            {pending ? "Saving..." : "Save Entry"}
          </Button>
        }
      />

      <form
        id={formId}
        className="space-y-6"
        onSubmit={(event) => {
          event.preventDefault();

          startTransition(async () => {
            try {
              setPending(true);
              const result = await saveEntryAction(value);
              toast.success("Entry saved.");
              router.push(`/CMS/entries/${result.entryId}`);
              router.refresh();
            } catch (error) {
              toast.error(error instanceof Error ? error.message : "Unable to save entry.");
            } finally {
              setPending(false);
            }
          });
        }}
      >
        <CmsSection
          eyebrow="Setup"
          title="Entry setup"
          description="Choose where the entry lives on the site, which image it uses, and whether it is currently visible to the public."
        >
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <CmsField
              label="Type"
              hint="The type decides which public section this entry belongs to."
            >
              <Select
                value={value.type}
                onValueChange={(selected) =>
                  setValue((current) => ({
                    ...current,
                    type: (selected || current.type) as EntryFormValues["type"],
                    categoryIds: [],
                  }))
                }
              >
                <SelectTrigger className={cmsSelectTriggerClassName}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {typeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CmsField>

            <CmsField
              label="Slug"
              hint="Used in the URL. Keep it short, unique, and lowercase."
            >
              <Input
                value={value.slug}
                onChange={(event) => setValue((current) => ({ ...current, slug: event.target.value }))}
                className={cmsControlClassName}
              />
            </CmsField>

            <CmsField
              label="Region"
              hint="Used for regional grouping and public filtering."
            >
              <Select
                value={value.regionId}
                onValueChange={(selected) =>
                  setValue((current) => ({ ...current, regionId: selected || current.regionId }))
                }
              >
                <SelectTrigger className={cmsSelectTriggerClassName}>
                  <SelectValue placeholder="Select region" />
                </SelectTrigger>
                <SelectContent>
                  {regions.map((region) => (
                    <SelectItem key={region.id} value={region.id}>
                      {region.name.en}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CmsField>

            <CmsField
              label="Hero Media"
              hint="Primary image for listing cards and the detail page hero."
            >
              <Select
                value={value.heroMediaId}
                onValueChange={(selected) =>
                  setValue((current) => ({ ...current, heroMediaId: selected || current.heroMediaId }))
                }
              >
                <SelectTrigger className={cmsSelectTriggerClassName}>
                  <SelectValue placeholder="Select media" />
                </SelectTrigger>
                <SelectContent>
                  {mediaAssets.map((asset) => (
                    <SelectItem key={asset.id} value={asset.id}>
                      {asset.alt.en || asset.publicId}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CmsField>

            <CmsField
              label="Latitude"
              hint="Map marker latitude. Decimal format is supported."
            >
              <Input
                type="number"
                step="any"
                value={value.latitude}
                onChange={(event) =>
                  setValue((current) => ({ ...current, latitude: toNumber(event.target.value) }))
                }
                className={cmsControlClassName}
              />
            </CmsField>

            <CmsField
              label="Longitude"
              hint="Map marker longitude. Decimal format is supported."
            >
              <Input
                type="number"
                step="any"
                value={value.longitude}
                onChange={(event) =>
                  setValue((current) => ({ ...current, longitude: toNumber(event.target.value) }))
                }
                className={cmsControlClassName}
              />
            </CmsField>

            <CmsField
              label="Sort Order"
              hint="Lower numbers appear earlier in public lists."
            >
              <Input
                type="number"
                step="1"
                value={value.sortOrder}
                onChange={(event) =>
                  setValue((current) => ({ ...current, sortOrder: toNumber(event.target.value) }))
                }
                className={cmsControlClassName}
              />
            </CmsField>
          </div>

          <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="cms-surface-subtle rounded-[1.5rem] p-4">
              <p className="cms-kicker">Visibility</p>
              <h3 className="mt-2 font-heading text-xl text-foreground">Publishing state</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Draft entries stay hidden from the public site. Published entries must be fully populated in every locale.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Button
                  type="button"
                  variant={value.isPublished ? "default" : "outline"}
                  className={cn(
                    "h-11 rounded-xl px-4",
                    value.isPublished && "cms-primary-button",
                    !value.isPublished && "bg-white/90",
                  )}
                  onClick={() => setValue((current) => ({ ...current, isPublished: !current.isPublished }))}
                >
                  {value.isPublished ? "Published" : "Draft"}
                </Button>
                <Button
                  type="button"
                  variant={value.isFeatured ? "default" : "outline"}
                  className={cn(
                    "h-11 rounded-xl px-4",
                    value.isFeatured && "cms-primary-button",
                    !value.isFeatured && "bg-white/90",
                  )}
                  onClick={() => setValue((current) => ({ ...current, isFeatured: !current.isFeatured }))}
                >
                  {value.isFeatured ? "Featured" : "Standard"}
                </Button>
              </div>
            </div>

            <div className="cms-surface-subtle rounded-[1.5rem] p-4">
              <p className="cms-kicker">Categorization</p>
              <h3 className="mt-2 font-heading text-xl text-foreground">Entry categories</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Categories are filtered by the selected entry type and control where the story appears in public groupings.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {categoryOptions.map((category) => {
                  const selected = value.categoryIds.includes(category.id);

                  return (
                    <Button
                      key={category.id}
                      type="button"
                      variant={selected ? "default" : "outline"}
                      className={cn(
                        "rounded-full px-4",
                        selected && "cms-primary-button",
                        !selected && "bg-white/90",
                      )}
                      onClick={() => toggleCategory(category.id)}
                    >
                      {pickLocaleText(category.label, "en")}
                    </Button>
                  );
                })}
                {categoryOptions.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No categories are available for this entry type.
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        </CmsSection>

        <CmsSection
          eyebrow="Writing"
          title="Localized content"
          description="Each locale controls the live copy for cards, detail pages, search metadata, map blocks, and journey information."
        >
          <Tabs defaultValue="en" className="gap-5">
            <TabsList className="grid h-auto w-full gap-2 rounded-none bg-transparent p-0 sm:grid-cols-3">
              {locales.map((locale) => (
                <TabsTrigger
                  key={locale}
                  value={locale}
                  className="cms-surface-subtle h-auto w-full justify-start rounded-[1rem] px-4 py-3 text-left data-active:bg-white data-active:text-foreground"
                >
                  <div className="space-y-1">
                    <div className="font-medium text-foreground">{localeLabels[locale]}</div>
                    <div className="text-xs text-muted-foreground">
                      {localeReadiness[locale] ? "Ready to publish" : "Needs required fields"}
                    </div>
                  </div>
                </TabsTrigger>
              ))}
            </TabsList>

            {locales.map((locale) => (
              <TabsContent key={locale} value={locale} className="space-y-4">
                <div className="cms-surface-subtle rounded-[1.5rem] p-5">
                  <div className="space-y-2">
                    <p className="cms-kicker">{localeLabels[locale]}</p>
                    <h3 className="font-heading text-xl text-foreground">Public story fields</h3>
                    <p className="text-sm leading-6 text-muted-foreground">
                      These fields power the card title, detail page hero, body copy, and address block for this language.
                    </p>
                  </div>
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <CmsField
                      label="Address"
                      hint="Physical address or location text shown in the location block."
                      className="md:col-span-2"
                    >
                      <Input
                        value={value.address[locale]}
                        onChange={(event) => updateAddress(locale, event.target.value)}
                        className={cmsControlClassName}
                      />
                    </CmsField>
                    {storyFields.map((field) =>
                      renderTranslationField(locale, {
                        ...field,
                        wrapperClassName: field.key === "body" ? "md:col-span-2" : undefined,
                      }),
                    )}
                  </div>
                </div>

                <div className="grid gap-4 xl:grid-cols-2">
                  <div className="cms-surface-subtle rounded-[1.5rem] p-5">
                    <div className="space-y-2">
                      <p className="cms-kicker">Search and navigation</p>
                      <h3 className="font-heading text-xl text-foreground">SEO and labels</h3>
                      <p className="text-sm leading-6 text-muted-foreground">
                        These fields help visitors understand the page in search results and inside the location/map sections.
                      </p>
                    </div>
                    <div className="mt-4 grid gap-4">
                      {seoFields.map((field) => renderTranslationField(locale, field))}
                    </div>
                  </div>

                  <div className="cms-surface-subtle rounded-[1.5rem] p-5">
                    <div className="space-y-2">
                      <p className="cms-kicker">Journey block</p>
                      <h3 className="font-heading text-xl text-foreground">Travel and callout copy</h3>
                      <p className="text-sm leading-6 text-muted-foreground">
                        Use this area for the pull quote and the summary that introduces transport options.
                      </p>
                    </div>
                    <div className="mt-4 grid gap-4">
                      {journeyFields.map((field) => renderTranslationField(locale, field))}
                    </div>
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CmsSection>

        <CmsSection
          eyebrow="Highlights"
          title="Story highlights"
          description="Highlights appear beneath the main story. Keep titles short and descriptions focused so the section scans quickly."
          action={
            <Button
              type="button"
              variant="outline"
              className="h-11 rounded-xl bg-white/90"
              onClick={() =>
                setValue((current) => ({
                  ...current,
                  highlights: [
                    ...current.highlights,
                    {
                      sortOrder: current.highlights.length,
                      title: { en: "", ka: "", ru: "" },
                      description: { en: "", ka: "", ru: "" },
                    },
                  ],
                }))
              }
            >
              <Plus className="size-4" />
              Add Highlight
            </Button>
          }
        >
          {value.highlights.length === 0 ? (
            <div className="cms-surface-subtle rounded-[1.5rem] p-5 text-sm leading-6 text-muted-foreground">
              No highlights yet. Add a few scannable points if the story needs key facts or standout moments beneath the main body.
            </div>
          ) : (
            <div className="grid gap-4">
              {value.highlights.map((highlight, index) => (
                <div key={highlight.id ?? index} className="cms-surface-subtle rounded-[1.5rem] p-5">
                  <div className="mb-4 flex items-start justify-between gap-4">
                    <div>
                      <p className="cms-kicker">Highlight {index + 1}</p>
                      <h3 className="mt-2 font-heading text-xl text-foreground">Highlight block</h3>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      className="rounded-full text-primary"
                      onClick={() =>
                        setValue((current) => ({
                          ...current,
                          highlights: current.highlights.filter((_, itemIndex) => itemIndex !== index),
                        }))
                      }
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    {locales.map((locale) => (
                      <div key={locale} className="space-y-4 rounded-[1.25rem] border border-border/70 bg-white/85 p-4">
                        <div className="space-y-1">
                          <p className="cms-kicker">{localeLabels[locale]}</p>
                          <p className="text-sm text-muted-foreground">
                            Title and description for the highlight card.
                          </p>
                        </div>

                        <CmsField label="Title">
                          <Input
                            value={highlight.title[locale]}
                            placeholder="Highlight title"
                            onChange={(event) =>
                              setValue((current) => ({
                                ...current,
                                highlights: current.highlights.map((item, itemIndex) =>
                                  itemIndex === index
                                    ? {
                                        ...item,
                                        title: {
                                          ...item.title,
                                          [locale]: event.target.value,
                                        },
                                      }
                                    : item,
                                ),
                              }))
                            }
                            className={cmsControlClassName}
                          />
                        </CmsField>

                        <CmsField label="Description">
                          <Textarea
                            value={highlight.description[locale]}
                            placeholder="Highlight description"
                            onChange={(event) =>
                              setValue((current) => ({
                                ...current,
                                highlights: current.highlights.map((item, itemIndex) =>
                                  itemIndex === index
                                    ? {
                                        ...item,
                                        description: {
                                          ...item.description,
                                          [locale]: event.target.value,
                                        },
                                      }
                                    : item,
                                ),
                              }))
                            }
                            className={cn(cmsTextareaClassName, "min-h-28")}
                          />
                        </CmsField>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CmsSection>

        <CmsSection
          eyebrow="Transport"
          title="Journey options"
          description="Transport cards explain how a visitor can reach the destination or experience. They display in the order shown below."
          action={
            <Button
              type="button"
              variant="outline"
              className="h-11 rounded-xl bg-white/90"
              onClick={() =>
                setValue((current) => ({
                  ...current,
                  transports: [
                    ...current.transports,
                    {
                      sortOrder: current.transports.length,
                      mode: "transfer",
                      title: { en: "", ka: "", ru: "" },
                      description: { en: "", ka: "", ru: "" },
                      ctaLabel: { en: "", ka: "", ru: "" },
                      ctaHref: "#",
                    },
                  ],
                }))
              }
            >
              <Plus className="size-4" />
              Add Journey Option
            </Button>
          }
        >
          {value.transports.length === 0 ? (
            <div className="cms-surface-subtle rounded-[1.5rem] p-5 text-sm leading-6 text-muted-foreground">
              No journey options yet. Add cards for transfers, buses, or hikes when visitors need travel guidance.
            </div>
          ) : (
            <div className="grid gap-4">
              {value.transports.map((transport, index) => (
                <div key={transport.id ?? index} className="cms-surface-subtle rounded-[1.5rem] p-5">
                  <div className="mb-4 flex items-start justify-between gap-4">
                    <div>
                      <p className="cms-kicker">Journey option {index + 1}</p>
                      <h3 className="mt-2 font-heading text-xl text-foreground">Transport card</h3>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      className="rounded-full text-primary"
                      onClick={() =>
                        setValue((current) => ({
                          ...current,
                          transports: current.transports.filter((_, itemIndex) => itemIndex !== index),
                        }))
                      }
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>

                  <div className="grid gap-4 lg:grid-cols-[0.38fr_0.62fr]">
                    <div className="space-y-4 rounded-[1.25rem] border border-border/70 bg-white/85 p-4">
                      <CmsField
                        label="Mode"
                        hint="Used to visually categorize the transport card."
                      >
                        <Select
                          value={transport.mode}
                          onValueChange={(selected) =>
                            setValue((current) => ({
                              ...current,
                              transports: current.transports.map((item, itemIndex) =>
                                itemIndex === index
                                  ? { ...item, mode: selected || item.mode }
                                  : item,
                              ),
                            }))
                          }
                        >
                          <SelectTrigger className={cmsSelectTriggerClassName}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {transportModeOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </CmsField>

                      <CmsField
                        label="CTA Link"
                        hint="Public link opened by the transport card button."
                      >
                        <Input
                          value={transport.ctaHref}
                          onChange={(event) =>
                            setValue((current) => ({
                              ...current,
                              transports: current.transports.map((item, itemIndex) =>
                                itemIndex === index
                                  ? { ...item, ctaHref: event.target.value }
                                  : item,
                              ),
                            }))
                          }
                          className={cmsControlClassName}
                        />
                      </CmsField>
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                      {locales.map((locale) => (
                        <div key={locale} className="space-y-4 rounded-[1.25rem] border border-border/70 bg-white/85 p-4">
                          <div className="space-y-1">
                            <p className="cms-kicker">{localeLabels[locale]}</p>
                            <p className="text-sm text-muted-foreground">
                              Title, summary, and button label for this card.
                            </p>
                          </div>

                          <CmsField label="Title">
                            <Input
                              value={transport.title[locale]}
                              placeholder="Transport title"
                              onChange={(event) =>
                                setValue((current) => ({
                                  ...current,
                                  transports: current.transports.map((item, itemIndex) =>
                                    itemIndex === index
                                      ? {
                                          ...item,
                                          title: {
                                            ...item.title,
                                            [locale]: event.target.value,
                                          },
                                        }
                                      : item,
                                  ),
                                }))
                              }
                              className={cmsControlClassName}
                            />
                          </CmsField>

                          <CmsField label="Description">
                            <Textarea
                              value={transport.description[locale]}
                              placeholder="Transport description"
                              onChange={(event) =>
                                setValue((current) => ({
                                  ...current,
                                  transports: current.transports.map((item, itemIndex) =>
                                    itemIndex === index
                                      ? {
                                          ...item,
                                          description: {
                                            ...item.description,
                                            [locale]: event.target.value,
                                          },
                                        }
                                      : item,
                                  ),
                                }))
                              }
                              className={cn(cmsTextareaClassName, "min-h-28")}
                            />
                          </CmsField>

                          <CmsField label="CTA Label">
                            <Input
                              value={transport.ctaLabel[locale]}
                              placeholder="Button label"
                              onChange={(event) =>
                                setValue((current) => ({
                                  ...current,
                                  transports: current.transports.map((item, itemIndex) =>
                                    itemIndex === index
                                      ? {
                                          ...item,
                                          ctaLabel: {
                                            ...item.ctaLabel,
                                            [locale]: event.target.value,
                                          },
                                        }
                                      : item,
                                  ),
                                }))
                              }
                              className={cmsControlClassName}
                            />
                          </CmsField>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CmsSection>

        <div className="cms-surface sticky bottom-4 z-10 flex flex-col gap-3 rounded-[1.5rem] px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-medium text-foreground">Review complete, then save the entry.</p>
            <p className="text-sm text-muted-foreground">
              Ctrl/Cmd + S also triggers the save action from anywhere in the editor.
            </p>
          </div>
          <Button type="submit" className="cms-primary-button h-11 rounded-xl" disabled={pending}>
            {pending ? "Saving..." : "Save Entry"}
          </Button>
        </div>
      </form>
    </div>
  );
}
