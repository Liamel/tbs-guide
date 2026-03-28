import Link from "next/link";
import { ArrowRight, MapPinned } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { EntryCard } from "@/components/marketing/entry-card";
import { getDictionary, assertLocale, pickLocaleText } from "@/lib/i18n";
import { getEntryCategoryOptions, getEntryRegionOptions, listEntriesBySection } from "@/lib/content/service";

export default async function HeritagePage({
  params,
  searchParams,
}: PageProps<"/[lang]/heritage">) {
  const { lang } = await params;
  const locale = assertLocale(lang);
  const query = await searchParams;
  const dict = getDictionary(locale);

  const [entries, categoryOptions, regionOptions] = await Promise.all([
    listEntriesBySection(locale, "heritage", {
      categorySlug: typeof query.category === "string" ? query.category : undefined,
      regionSlug: typeof query.region === "string" ? query.region : undefined,
    }),
    getEntryCategoryOptions("heritage"),
    getEntryRegionOptions("heritage"),
  ]);

  const [featuredPrimary, featuredSecondary, ...rest] = entries;

  return (
    <div className="space-y-14 pb-12 pt-8">
      <section className="editorial-shell space-y-8">
        <div className="space-y-4">
          <p className="eyebrow">{dict.listing.heritageKicker}</p>
          <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="space-y-3">
              <h1 className="section-title">{dict.listing.heritageTitle}</h1>
              <p className="max-w-3xl text-lg leading-8 text-muted-foreground">
                {dict.listing.heritageDescription}
              </p>
            </div>
            <div className="glass-panel rounded-[1.75rem] px-5 py-5 text-sm leading-7 text-muted-foreground">
              This heritage collection follows the supplied art direction closely: tonal section breaks, image-led composition, and no hard divider lines.
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            {categoryOptions.map((category) => (
              <Link
                key={category.id}
                href={`/${locale}/heritage${category.slug === "all-sites" ? "" : `?category=${category.slug}`}`}
              >
                <Badge
                  className={
                    query.category === category.slug || (!query.category && category.slug === "all-sites")
                      ? "rounded-full bg-primary px-4 py-2 text-primary-foreground"
                      : "rounded-full bg-muted px-4 py-2 text-muted-foreground hover:text-foreground"
                  }
                >
                  {pickLocaleText(category.label, locale)}
                </Badge>
              </Link>
            ))}
          </div>
          <div className="glass-panel flex items-center gap-3 rounded-full px-4 py-2 text-sm">
            <span className="text-muted-foreground">{dict.listing.regionLabel}:</span>
            <div className="flex flex-wrap gap-2">
              <Link href={`/${locale}/heritage`} className={!query.region ? "text-primary" : "text-muted-foreground"}>
                {dict.listing.allRegions}
              </Link>
              {regionOptions.map((region) => (
                <Link
                  key={region.id}
                  href={`/${locale}/heritage?region=${region.slug}`}
                  className={query.region === region.slug ? "text-primary" : "text-muted-foreground"}
                >
                  {pickLocaleText(region.name, locale)}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="editorial-shell">
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          {featuredPrimary ? (
            <EntryCard
              entry={featuredPrimary}
              href={`/${locale}/${featuredPrimary.section}/${featuredPrimary.slug}`}
              tall
            />
          ) : null}
          {featuredSecondary ? (
            <div className="grid gap-6">
              <EntryCard
                entry={featuredSecondary}
                href={`/${locale}/${featuredSecondary.section}/${featuredSecondary.slug}`}
              />
              <Link
                href={`/${locale}/${featuredSecondary.section}/${featuredSecondary.slug}`}
                className="surface-break flex min-h-[180px] items-end rounded-[1.8rem] p-6"
              >
                <div className="space-y-3">
                  <p className="eyebrow">{dict.listing.exploreMap}</p>
                  <div className="flex items-center gap-3 text-primary">
                    <MapPinned className="size-5" />
                    <span className="font-heading text-xl">{dict.listing.exploreMap}</span>
                    <ArrowRight className="size-4" />
                  </div>
                </div>
              </Link>
            </div>
          ) : null}
        </div>
      </section>

      <section className="editorial-shell grid gap-6 md:grid-cols-3">
        {rest.map((entry) => (
          <EntryCard
            key={entry.id}
            entry={entry}
            href={`/${locale}/${entry.section}/${entry.slug}`}
          />
        ))}
      </section>

      <section className="editorial-shell">
        <div className="surface-break grid gap-8 rounded-[2rem] p-6 sm:p-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-4">
            <h2 className="font-heading text-3xl">{dict.listing.conservationTitle}</h2>
            <p className="max-w-xl leading-7 text-muted-foreground">{dict.listing.conservationBody}</p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="#"
                className="inline-flex rounded-xl bg-primary px-4 py-3 text-sm text-primary-foreground"
              >
                {dict.listing.mission}
              </Link>
              <Link href="#" className="inline-flex rounded-xl bg-white px-4 py-3 text-sm text-foreground">
                {dict.listing.sustainability}
              </Link>
            </div>
          </div>
          <div className="glass-panel-strong rounded-[1.75rem] bg-[radial-gradient(circle_at_top_left,rgba(161,60,63,0.15),transparent_38%),linear-gradient(135deg,#f4f0eb_0%,#e2d8cb_100%)]" />
        </div>
      </section>
    </div>
  );
}
