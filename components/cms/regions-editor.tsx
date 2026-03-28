"use client";

import { startTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { saveRegionsAction } from "@/app/CMS/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  CmsField,
  CmsSection,
  cmsControlClassName,
  cmsTextareaClassName,
} from "@/components/cms/cms-ui";
import type { RegionRecord } from "@/lib/content/types";
import {
  createEmptyRegionDraft,
  regionsFormSchema,
  type RegionFormValues,
  type RegionsFormValues,
} from "@/lib/content/validators";
import { localeLabels, locales } from "@/lib/i18n";

function buildInitialValue(regions: RegionRecord[]): RegionsFormValues {
  return regionsFormSchema.parse({
    regions: regions
      .slice()
      .sort((left, right) => left.orderIndex - right.orderIndex)
      .map((region) => ({
        id: region.id,
        slug: region.slug,
        orderIndex: region.orderIndex,
        name: region.name,
        description: region.description,
      })),
  });
}

export function RegionsEditor({ regions }: { regions: RegionRecord[] }) {
  const router = useRouter();
  const [value, setValue] = useState(() => buildInitialValue(regions));
  const [pending, setPending] = useState(false);

  function updateRegion(regionId: string, updater: (region: RegionFormValues) => RegionFormValues) {
    setValue((current) => ({
      regions: current.regions.map((region) =>
        region.id === regionId ? updater(region) : region,
      ),
    }));
  }

  const orderedRegions = value.regions
    .slice()
    .sort((left, right) => left.orderIndex - right.orderIndex || left.slug.localeCompare(right.slug));
  const nextOrderIndex = orderedRegions.reduce(
    (max, region) => Math.max(max, region.orderIndex),
    -1,
  ) + 1;

  return (
    <CmsSection
      eyebrow="Regions"
      title="Regional content model"
      description="Control the labels, descriptions, URL slugs, and display order used by the interactive homepage map and dedicated region pages."
      action={
        <Button
          type="submit"
          form="cms-regions-form"
          data-cms-save="true"
          className="cms-primary-button h-11 rounded-xl"
          disabled={pending}
        >
          {pending ? "Saving..." : "Save Regions"}
        </Button>
      }
    >
      <form
        id="cms-regions-form"
        className="space-y-6"
        onSubmit={(event) => {
          event.preventDefault();

          startTransition(async () => {
            try {
              setPending(true);
              await saveRegionsAction(value);
              toast.success("Regions updated.");
              router.refresh();
            } catch (error) {
              toast.error(error instanceof Error ? error.message : "Unable to save regions.");
            } finally {
              setPending(false);
            }
          });
        }}
      >
        <div className="flex flex-col gap-4 rounded-[1.5rem] border border-border/60 bg-muted/30 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p className="font-medium text-foreground">Map-driven regions</p>
            <p className="text-sm leading-6 text-muted-foreground">
              These records feed the homepage hover panel and the `/regions/[slug]` pages.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            className="rounded-xl bg-white/90"
            onClick={() =>
              setValue((current) => ({
                regions: [
                  ...current.regions,
                  {
                    id: crypto.randomUUID(),
                    ...createEmptyRegionDraft(nextOrderIndex),
                  },
                ],
              }))
            }
          >
            <Plus className="size-4" />
            Add Region
          </Button>
        </div>

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
                  <div className="text-xs text-muted-foreground">Region labels for this locale</div>
                </div>
              </TabsTrigger>
            ))}
          </TabsList>

          {locales.map((locale) => (
            <TabsContent key={locale} value={locale} className="space-y-4">
              {orderedRegions.map((region, index) => (
                <div key={region.id} className="cms-surface-subtle rounded-[1.5rem] p-5">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-2">
                      <p className="cms-kicker">Region {index + 1}</p>
                      <h3 className="font-heading text-2xl text-foreground">
                        {region.name[locale] || region.name.en || `Region ${index + 1}`}
                      </h3>
                      <p className="text-sm leading-6 text-muted-foreground">
                        URL slug: <span className="font-mono text-foreground">/{region.slug || "new-region"}</span>
                      </p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 lg:w-full lg:max-w-md">
                      <CmsField label="Slug" hint="Used in the dedicated region page URL.">
                        <Input
                          value={region.slug}
                          onChange={(event) =>
                            updateRegion(region.id!, (current) => ({
                              ...current,
                              slug: event.target.value.toLowerCase().replace(/\s+/g, "-"),
                            }))
                          }
                          className={cmsControlClassName}
                        />
                      </CmsField>
                      <CmsField label="Order" hint="Controls map and CMS sorting.">
                        <Input
                          type="number"
                          value={region.orderIndex}
                          onChange={(event) =>
                            updateRegion(region.id!, (current) => ({
                              ...current,
                              orderIndex: Number(event.target.value) || 0,
                            }))
                          }
                          className={cmsControlClassName}
                        />
                      </CmsField>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-4 md:grid-cols-2">
                    <CmsField
                      label={`${localeLabels[locale]} Name`}
                      hint="Displayed on the homepage map panel and region page."
                    >
                      <Input
                        value={region.name[locale]}
                        onChange={(event) =>
                          updateRegion(region.id!, (current) => ({
                            ...current,
                            name: {
                              ...current.name,
                              [locale]: event.target.value,
                            },
                          }))
                        }
                        className={cmsControlClassName}
                      />
                    </CmsField>
                    <CmsField
                      label={`${localeLabels[locale]} Description`}
                      hint="Short editorial summary of the region."
                      className="md:col-span-2"
                    >
                      <Textarea
                        value={region.description[locale]}
                        onChange={(event) =>
                          updateRegion(region.id!, (current) => ({
                            ...current,
                            description: {
                              ...current.description,
                              [locale]: event.target.value,
                            },
                          }))
                        }
                        className={cmsTextareaClassName}
                      />
                    </CmsField>
                  </div>
                </div>
              ))}
            </TabsContent>
          ))}
        </Tabs>

        <div className="flex justify-end">
          <Button type="submit" className="cms-primary-button h-11 rounded-xl" disabled={pending}>
            {pending ? "Saving..." : "Save Regions"}
          </Button>
        </div>
      </form>
    </CmsSection>
  );
}
