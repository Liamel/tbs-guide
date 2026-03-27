"use client";

import { startTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { saveHomepageAction } from "@/app/CMS/actions";
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
import type { EntryRecord, HomepageContentRecord, HomepageFeatureSlotRecord } from "@/lib/content/types";
import { homepageFormSchema, type HomepageFormValues } from "@/lib/content/validators";
import { locales } from "@/lib/i18n";

const localizedHomepageFields = [
  ["heroKicker", "Hero Kicker"],
  ["heroLead", "Hero Lead"],
  ["heroAccent", "Hero Accent"],
  ["heroDescription", "Hero Description"],
  ["primaryCtaLabel", "Primary CTA"],
  ["secondaryCtaLabel", "Secondary CTA"],
  ["newsletterTitle", "Newsletter Title"],
  ["newsletterDescription", "Newsletter Description"],
] as const satisfies ReadonlyArray<
  readonly [
    Exclude<keyof HomepageFormValues, "key" | "featuredSlots">,
    string,
  ]
>;

function buildInitialValue(
  homepage: HomepageContentRecord,
  slots: HomepageFeatureSlotRecord[],
): HomepageFormValues {
  return homepageFormSchema.parse({
    ...homepage,
    featuredSlots: Object.fromEntries(slots.map((slot) => [slot.slotKey, slot.entryId])),
  });
}

export function HomepageEditor({
  homepage,
  slots,
  entries,
}: {
  homepage: HomepageContentRecord;
  slots: HomepageFeatureSlotRecord[];
  entries: EntryRecord[];
}) {
  const router = useRouter();
  const [value, setValue] = useState(() => buildInitialValue(homepage, slots));
  const [pending, setPending] = useState(false);

  return (
    <Card className="glass-panel-strong border-0 p-0 ring-0">
      <form
        className="space-y-6 px-6 py-6"
        onSubmit={(event) => {
          event.preventDefault();

          startTransition(async () => {
            try {
              setPending(true);
              await saveHomepageAction(value);
              toast.success("Homepage updated.");
              router.refresh();
            } catch (error) {
              toast.error(error instanceof Error ? error.message : "Unable to save homepage.");
            } finally {
              setPending(false);
            }
          });
        }}
      >
        <div className="space-y-2">
          <p className="eyebrow">Homepage Story</p>
          <h2 className="font-heading text-3xl">Hero and feature slots</h2>
          <p className="text-sm leading-6 text-muted-foreground">
            Control the hero copy, newsletter block, and the featured cards shown on the public home page.
          </p>
        </div>

        <Tabs defaultValue="en">
          <TabsList>
            {locales.map((locale) => (
              <TabsTrigger key={locale} value={locale}>
                {locale.toUpperCase()}
              </TabsTrigger>
            ))}
          </TabsList>
          {locales.map((locale) => (
            <TabsContent key={locale} value={locale}>
              <div className="grid gap-4 lg:grid-cols-2">
                {localizedHomepageFields.map(([field, label]) => (
                  <div key={`${locale}-${field}`} className="space-y-2">
                    <Label>{label}</Label>
                    <Input
                      value={value[field][locale]}
                      onChange={(event) =>
                        setValue((current) => ({
                          ...current,
                          [field]: {
                            ...current[field],
                            [locale]: event.target.value,
                          },
                        }))
                      }
                      className="h-11 rounded-2xl"
                    />
                  </div>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[
            "must-see-1",
            "must-see-2",
            "must-see-3",
            "featured-vineyard",
            "experience-1",
            "experience-2",
            "experience-3",
          ].map((slotKey) => (
            <div key={slotKey} className="space-y-2">
              <Label className="capitalize">{slotKey.replaceAll("-", " ")}</Label>
              <Select
                value={value.featuredSlots[slotKey]}
                onValueChange={(selected) =>
                  setValue((current) => ({
                    ...current,
                    featuredSlots: {
                      ...current.featuredSlots,
                      [slotKey]: selected || current.featuredSlots[slotKey],
                    },
                  }))
                }
              >
                <SelectTrigger className="h-11 w-full rounded-2xl">
                  <SelectValue placeholder="Select entry" />
                </SelectTrigger>
                <SelectContent>
                  {entries.map((entry) => (
                    <SelectItem key={entry.id} value={entry.id}>
                      {entry.translations.en.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>

        <Button type="submit" data-cms-save="true" className="velvet-button rounded-xl" disabled={pending}>
          {pending ? "Saving..." : "Save Homepage"}
        </Button>
      </form>
    </Card>
  );
}
