"use client";

import { startTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";

import { saveEntryAction } from "@/app/CMS/actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import type { CategoryRecord, EntryRecord, MediaAssetRecord, RegionRecord } from "@/lib/content/types";
import { createEmptyEntryDraft, type EntryFormValues } from "@/lib/content/validators";
import { locales, pickLocaleText } from "@/lib/i18n";

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

  const categoryOptions = categories.filter((category) => category.type === value.type);

  return (
    <form
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
      <Card className="glass-panel-strong border-0 p-0 ring-0">
        <div className="grid gap-4 px-6 py-6 lg:grid-cols-2">
          <div className="space-y-2">
            <p className="eyebrow">Structured Entry</p>
            <h1 className="font-heading text-3xl">
              {entry ? entry.translations.en.title : "Create a new entry"}
            </h1>
            <p className="text-sm leading-6 text-muted-foreground">
              Editorial content is stored as structured fields so the public site stays consistent across all languages.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Type</Label>
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
                <SelectTrigger className="h-11 w-full rounded-2xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="heritage">Heritage</SelectItem>
                  <SelectItem value="vineyard">Vineyard</SelectItem>
                  <SelectItem value="experience">Experience</SelectItem>
                  <SelectItem value="destination">Destination</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Slug</Label>
              <Input
                value={value.slug}
                onChange={(event) => setValue((current) => ({ ...current, slug: event.target.value }))}
                className="h-11 rounded-2xl"
              />
            </div>
            <div className="space-y-2">
              <Label>Region</Label>
              <Select
                value={value.regionId}
                onValueChange={(selected) =>
                  setValue((current) => ({ ...current, regionId: selected || current.regionId }))
                }
              >
                <SelectTrigger className="h-11 w-full rounded-2xl">
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
            </div>
            <div className="space-y-2">
              <Label>Hero Media</Label>
              <Select
                value={value.heroMediaId}
                onValueChange={(selected) =>
                  setValue((current) => ({ ...current, heroMediaId: selected || current.heroMediaId }))
                }
              >
                <SelectTrigger className="h-11 w-full rounded-2xl">
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
            </div>
            <div className="space-y-2">
              <Label>Latitude</Label>
              <Input
                type="number"
                value={value.latitude}
                onChange={(event) =>
                  setValue((current) => ({ ...current, latitude: Number(event.target.value) }))
                }
                className="h-11 rounded-2xl"
              />
            </div>
            <div className="space-y-2">
              <Label>Longitude</Label>
              <Input
                type="number"
                value={value.longitude}
                onChange={(event) =>
                  setValue((current) => ({ ...current, longitude: Number(event.target.value) }))
                }
                className="h-11 rounded-2xl"
              />
            </div>
            <div className="space-y-2">
              <Label>Sort Order</Label>
              <Input
                type="number"
                value={value.sortOrder}
                onChange={(event) =>
                  setValue((current) => ({ ...current, sortOrder: Number(event.target.value) }))
                }
                className="h-11 rounded-2xl"
              />
            </div>
          </div>
        </div>
      </Card>

      <Card className="glass-panel border-0 p-0 ring-0">
        <div className="space-y-4 px-6 py-6">
          <div className="space-y-2">
            <Label>Feature Flags</Label>
            <div className="flex flex-wrap gap-3">
              <Button
                type="button"
                variant={value.isPublished ? "default" : "outline"}
                className={value.isPublished ? "velvet-button rounded-xl" : "rounded-xl"}
                onClick={() => setValue((current) => ({ ...current, isPublished: !current.isPublished }))}
              >
                {value.isPublished ? "Published" : "Draft"}
              </Button>
              <Button
                type="button"
                variant={value.isFeatured ? "default" : "outline"}
                className={value.isFeatured ? "velvet-button rounded-xl" : "rounded-xl"}
                onClick={() => setValue((current) => ({ ...current, isFeatured: !current.isFeatured }))}
              >
                {value.isFeatured ? "Featured" : "Standard"}
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Categories</Label>
            <div className="flex flex-wrap gap-2">
              {categoryOptions.map((category) => {
                const selected = value.categoryIds.includes(category.id);

                return (
                  <Button
                    key={category.id}
                    type="button"
                    variant={selected ? "default" : "outline"}
                    className={selected ? "velvet-button rounded-full px-4" : "rounded-full px-4"}
                    onClick={() =>
                      setValue((current) => ({
                        ...current,
                        categoryIds: selected
                          ? current.categoryIds.filter((item) => item !== category.id)
                          : [...current.categoryIds, category.id],
                      }))
                    }
                  >
                    {pickLocaleText(category.label, "en")}
                  </Button>
                );
              })}
            </div>
          </div>
        </div>
      </Card>

      <Card className="glass-panel-strong border-0 p-0 ring-0">
        <div className="space-y-6 px-6 py-6">
          <Tabs defaultValue="en">
            <TabsList>
              {locales.map((locale) => (
                <TabsTrigger key={locale} value={locale}>
                  {locale.toUpperCase()}
                </TabsTrigger>
              ))}
            </TabsList>
            {locales.map((locale) => (
              <TabsContent key={locale} value={locale} className="space-y-5">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2 md:col-span-2">
                    <Label>Address</Label>
                    <Input
                      value={value.address[locale]}
                      onChange={(event) =>
                        setValue((current) => ({
                          ...current,
                          address: {
                            ...current.address,
                            [locale]: event.target.value,
                          },
                        }))
                      }
                      className="h-11 rounded-2xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Eyebrow</Label>
                    <Input
                      value={value.translations[locale].eyebrow}
                      onChange={(event) =>
                        setValue((current) => ({
                          ...current,
                          translations: {
                            ...current.translations,
                            [locale]: {
                              ...current.translations[locale],
                              eyebrow: event.target.value,
                            },
                          },
                        }))
                      }
                      className="h-11 rounded-2xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Title</Label>
                    <Input
                      value={value.translations[locale].title}
                      onChange={(event) =>
                        setValue((current) => ({
                          ...current,
                          translations: {
                            ...current.translations,
                            [locale]: {
                              ...current.translations[locale],
                              title: event.target.value,
                            },
                          },
                        }))
                      }
                      className="h-11 rounded-2xl"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Summary</Label>
                    <Textarea
                      value={value.translations[locale].summary}
                      onChange={(event) =>
                        setValue((current) => ({
                          ...current,
                          translations: {
                            ...current.translations,
                            [locale]: {
                              ...current.translations[locale],
                              summary: event.target.value,
                            },
                          },
                        }))
                      }
                      className="min-h-28 rounded-2xl"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Body</Label>
                    <Textarea
                      value={value.translations[locale].body}
                      onChange={(event) =>
                        setValue((current) => ({
                          ...current,
                          translations: {
                            ...current.translations,
                            [locale]: {
                              ...current.translations[locale],
                              body: event.target.value,
                            },
                          },
                        }))
                      }
                      className="min-h-48 rounded-2xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>SEO Title</Label>
                    <Input
                      value={value.translations[locale].seoTitle}
                      onChange={(event) =>
                        setValue((current) => ({
                          ...current,
                          translations: {
                            ...current.translations,
                            [locale]: {
                              ...current.translations[locale],
                              seoTitle: event.target.value,
                            },
                          },
                        }))
                      }
                      className="h-11 rounded-2xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>SEO Description</Label>
                    <Input
                      value={value.translations[locale].seoDescription}
                      onChange={(event) =>
                        setValue((current) => ({
                          ...current,
                          translations: {
                            ...current.translations,
                            [locale]: {
                              ...current.translations[locale],
                              seoDescription: event.target.value,
                            },
                          },
                        }))
                      }
                      className="h-11 rounded-2xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Pull Quote</Label>
                    <Textarea
                      value={value.translations[locale].pullQuote}
                      onChange={(event) =>
                        setValue((current) => ({
                          ...current,
                          translations: {
                            ...current.translations,
                            [locale]: {
                              ...current.translations[locale],
                              pullQuote: event.target.value,
                            },
                          },
                        }))
                      }
                      className="min-h-24 rounded-2xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Journey Title</Label>
                    <Input
                      value={value.translations[locale].journeyTitle}
                      onChange={(event) =>
                        setValue((current) => ({
                          ...current,
                          translations: {
                            ...current.translations,
                            [locale]: {
                              ...current.translations[locale],
                              journeyTitle: event.target.value,
                            },
                          },
                        }))
                      }
                      className="h-11 rounded-2xl"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Journey Summary</Label>
                    <Textarea
                      value={value.translations[locale].journeySummary}
                      onChange={(event) =>
                        setValue((current) => ({
                          ...current,
                          translations: {
                            ...current.translations,
                            [locale]: {
                              ...current.translations[locale],
                              journeySummary: event.target.value,
                            },
                          },
                        }))
                      }
                      className="min-h-24 rounded-2xl"
                    />
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </Card>

      <Card className="glass-panel border-0 p-0 ring-0">
        <div className="space-y-4 px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="eyebrow">Highlights</p>
              <h2 className="font-heading text-2xl">Architectural highlights</h2>
            </div>
            <Button
              type="button"
              variant="outline"
              className="rounded-xl"
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
          </div>
          <div className="grid gap-4">
            {value.highlights.map((highlight, index) => (
              <div key={highlight.id ?? index} className="rounded-[1.5rem] bg-white/70 p-4">
                <div className="mb-4 flex items-center justify-between">
                  <p className="font-heading text-xl">Highlight {index + 1}</p>
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
                    <div key={locale} className="space-y-3">
                      <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                        {locale.toUpperCase()}
                      </p>
                      <Input
                        value={highlight.title[locale]}
                        placeholder="Title"
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
                        className="h-11 rounded-2xl"
                      />
                      <Textarea
                        value={highlight.description[locale]}
                        placeholder="Description"
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
                        className="min-h-24 rounded-2xl"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <Card className="glass-panel-strong border-0 p-0 ring-0">
        <div className="space-y-4 px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="eyebrow">Transport</p>
              <h2 className="font-heading text-2xl">Journey options</h2>
            </div>
            <Button
              type="button"
              variant="outline"
              className="rounded-xl"
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
              Add Transport
            </Button>
          </div>
          <div className="grid gap-4">
            {value.transports.map((transport, index) => (
              <div key={transport.id ?? index} className="rounded-[1.5rem] bg-white/70 p-4">
                <div className="mb-4 flex items-center justify-between">
                  <p className="font-heading text-xl">Transport {index + 1}</p>
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
                <div className="grid gap-4">
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label>Mode</Label>
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
                        <SelectTrigger className="h-11 w-full rounded-2xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="transfer">Transfer</SelectItem>
                          <SelectItem value="bus">Bus</SelectItem>
                          <SelectItem value="hike">Hike</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label>CTA Link</Label>
                      <Input
                        value={transport.ctaHref}
                        onChange={(event) =>
                          setValue((current) => ({
                            ...current,
                            transports: current.transports.map((item, itemIndex) =>
                              itemIndex === index ? { ...item, ctaHref: event.target.value } : item,
                            ),
                          }))
                        }
                        className="h-11 rounded-2xl"
                      />
                    </div>
                  </div>
                  <div className="grid gap-4 md:grid-cols-3">
                    {locales.map((locale) => (
                      <div key={locale} className="space-y-3">
                        <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                          {locale.toUpperCase()}
                        </p>
                        <Input
                          value={transport.title[locale]}
                          placeholder="Title"
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
                          className="h-11 rounded-2xl"
                        />
                        <Textarea
                          value={transport.description[locale]}
                          placeholder="Description"
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
                          className="min-h-24 rounded-2xl"
                        />
                        <Input
                          value={transport.ctaLabel[locale]}
                          placeholder="CTA Label"
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
                          className="h-11 rounded-2xl"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <Button type="submit" data-cms-save="true" className="velvet-button rounded-xl" disabled={pending}>
        {pending ? "Saving..." : "Save Entry"}
      </Button>
    </form>
  );
}
