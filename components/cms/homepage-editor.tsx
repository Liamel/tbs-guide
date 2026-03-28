"use client";

import { startTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { saveHomepageAction } from "@/app/CMS/actions";
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
  CmsSection,
  cmsControlClassName,
  cmsSelectTriggerClassName,
  cmsTextareaClassName,
} from "@/components/cms/cms-ui";
import type { EntryRecord, HomepageContentRecord, HomepageFeatureSlotRecord } from "@/lib/content/types";
import { homepageFormSchema, type HomepageFormValues } from "@/lib/content/validators";
import { localeLabels, locales, type Locale } from "@/lib/i18n";

const localizedHomepageFields = [
  {
    key: "heroKicker",
    label: "Hero Kicker",
    hint: "Small label above the homepage headline.",
    kind: "input",
  },
  {
    key: "heroLead",
    label: "Hero Lead",
    hint: "Main homepage headline.",
    kind: "input",
  },
  {
    key: "heroAccent",
    label: "Hero Accent",
    hint: "Highlighted word or phrase paired with the hero lead.",
    kind: "input",
  },
  {
    key: "heroDescription",
    label: "Hero Description",
    hint: "Supporting sentence under the homepage headline.",
    kind: "textarea",
  },
  {
    key: "primaryCtaLabel",
    label: "Primary CTA",
    hint: "Main hero button label.",
    kind: "input",
  },
  {
    key: "secondaryCtaLabel",
    label: "Secondary CTA",
    hint: "Secondary hero button label.",
    kind: "input",
  },
  {
    key: "newsletterTitle",
    label: "Newsletter Title",
    hint: "Headline above the newsletter signup section.",
    kind: "input",
  },
  {
    key: "newsletterDescription",
    label: "Newsletter Description",
    hint: "Supporting text above the newsletter form.",
    kind: "textarea",
  },
] as const satisfies ReadonlyArray<{
  key: Exclude<keyof HomepageFormValues, "key" | "featuredSlots">;
  label: string;
  hint: string;
  kind: "input" | "textarea";
}>;

const homepageSlotGroups = [
  {
    title: "Must-see cards",
    description: "Three featured cards near the top of the homepage.",
    slots: [
      { key: "must-see-1", label: "Must-see card 1" },
      { key: "must-see-2", label: "Must-see card 2" },
      { key: "must-see-3", label: "Must-see card 3" },
    ],
  },
  {
    title: "Featured vineyard",
    description: "Large spotlight section for a single vineyard.",
    slots: [{ key: "featured-vineyard", label: "Featured vineyard" }],
  },
  {
    title: "Experience cards",
    description: "Three cards shown in the experiences section.",
    slots: [
      { key: "experience-1", label: "Experience card 1" },
      { key: "experience-2", label: "Experience card 2" },
      { key: "experience-3", label: "Experience card 3" },
    ],
  },
] as const;

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

  function updateLocaleField(
    field: Exclude<keyof HomepageFormValues, "key" | "featuredSlots">,
    locale: Locale,
    nextValue: string,
  ) {
    setValue((current) => ({
      ...current,
      [field]: {
        ...current[field],
        [locale]: nextValue,
      },
    }));
  }

  return (
    <CmsSection
      eyebrow="Homepage"
      title="Homepage content"
      description="Edit the homepage headline, newsletter copy, and featured entry placements without touching the public layout."
      action={
        <Button
          type="submit"
          form="cms-homepage-form"
          data-cms-save="true"
          className="cms-primary-button h-11 rounded-xl"
          disabled={pending}
        >
          {pending ? "Saving..." : "Save Homepage"}
        </Button>
      }
    >
      <form
        id="cms-homepage-form"
        className="space-y-6"
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
                  <div className="text-xs text-muted-foreground">Homepage copy for this locale</div>
                </div>
              </TabsTrigger>
            ))}
          </TabsList>

          {locales.map((locale) => (
            <TabsContent key={locale} value={locale} className="space-y-4">
              <div className="cms-surface-subtle rounded-[1.5rem] p-5">
                <div className="space-y-2">
                  <p className="cms-kicker">{localeLabels[locale]}</p>
                  <h3 className="font-heading text-xl text-foreground">Hero copy</h3>
                  <p className="text-sm leading-6 text-muted-foreground">
                    These fields fill the hero headline, supporting copy, and CTA buttons at the top of the homepage.
                  </p>
                </div>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  {localizedHomepageFields.slice(0, 6).map((field) => (
                    <CmsField
                      key={`${locale}-${field.key}`}
                      label={field.label}
                      hint={field.hint}
                      className={field.kind === "textarea" ? "md:col-span-2" : undefined}
                    >
                      {field.kind === "textarea" ? (
                        <Textarea
                          value={value[field.key][locale]}
                          onChange={(event) => updateLocaleField(field.key, locale, event.target.value)}
                          className={cmsTextareaClassName}
                        />
                      ) : (
                        <Input
                          value={value[field.key][locale]}
                          onChange={(event) => updateLocaleField(field.key, locale, event.target.value)}
                          className={cmsControlClassName}
                        />
                      )}
                    </CmsField>
                  ))}
                </div>
              </div>

              <div className="cms-surface-subtle rounded-[1.5rem] p-5">
                <div className="space-y-2">
                  <p className="cms-kicker">Newsletter section</p>
                  <h3 className="font-heading text-xl text-foreground">Newsletter copy</h3>
                  <p className="text-sm leading-6 text-muted-foreground">
                    This text sits above the newsletter signup form near the bottom of the homepage.
                  </p>
                </div>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  {localizedHomepageFields.slice(6).map((field) => (
                    <CmsField
                      key={`${locale}-${field.key}`}
                      label={field.label}
                      hint={field.hint}
                      className={field.kind === "textarea" ? "md:col-span-2" : undefined}
                    >
                      {field.kind === "textarea" ? (
                        <Textarea
                          value={value[field.key][locale]}
                          onChange={(event) => updateLocaleField(field.key, locale, event.target.value)}
                          className={cmsTextareaClassName}
                        />
                      ) : (
                        <Input
                          value={value[field.key][locale]}
                          onChange={(event) => updateLocaleField(field.key, locale, event.target.value)}
                          className={cmsControlClassName}
                        />
                      )}
                    </CmsField>
                  ))}
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>

        <div className="grid gap-4">
          {homepageSlotGroups.map((group) => (
            <div key={group.title} className="cms-surface-subtle rounded-[1.5rem] p-5">
              <div className="space-y-2">
                <p className="cms-kicker">Homepage placement</p>
                <h3 className="font-heading text-xl text-foreground">{group.title}</h3>
                <p className="text-sm leading-6 text-muted-foreground">{group.description}</p>
              </div>
              <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {group.slots.map((slot) => (
                  <CmsField key={slot.key} label={slot.label} hint="Choose the entry shown in this homepage slot.">
                    <Select
                      value={value.featuredSlots[slot.key]}
                      onValueChange={(selected) =>
                        setValue((current) => ({
                          ...current,
                          featuredSlots: {
                            ...current.featuredSlots,
                            [slot.key]: selected || current.featuredSlots[slot.key],
                          },
                        }))
                      }
                    >
                      <SelectTrigger className={cmsSelectTriggerClassName}>
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
                  </CmsField>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end">
          <Button type="submit" className="cms-primary-button h-11 rounded-xl" disabled={pending}>
            {pending ? "Saving..." : "Save Homepage"}
          </Button>
        </div>
      </form>
    </CmsSection>
  );
}
