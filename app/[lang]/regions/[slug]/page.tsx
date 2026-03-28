import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, MapPinned } from "lucide-react";

import { EntryCard } from "@/components/marketing/entry-card";
import { Button } from "@/components/ui/button";
import { getRegionPageView } from "@/lib/content/service";
import { assertLocale, getDictionary } from "@/lib/i18n";

export default async function RegionPage({
  params,
}: PageProps<"/[lang]/regions/[slug]">) {
  const { lang, slug } = await params;
  const locale = assertLocale(lang);
  const dict = getDictionary(locale);
  const region = await getRegionPageView(locale, slug);

  if (!region) {
    notFound();
  }

  const primarySection = region.sectionCounts[0]?.section;
  const primaryHref = primarySection
    ? `/${locale}/${primarySection}?region=${region.slug}`
    : `/${locale}/destinations`;

  return (
    <div className="space-y-14 pb-16 pt-8">
      <section className="editorial-shell">
        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div
            className="relative overflow-hidden rounded-[2.25rem] px-6 py-8 sm:px-10 sm:py-10"
            style={{
              backgroundImage: `linear-gradient(90deg, rgba(14,20,26,0.72), rgba(14,20,26,0.24)), url(${region.imageUrl})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className="max-w-3xl space-y-4 pt-40 text-white sm:pt-56">
              <p className="eyebrow text-white/70">{dict.region.eyebrow}</p>
              <h1 className="section-title max-w-2xl text-white">{region.name}</h1>
              <p className="max-w-2xl text-base leading-7 text-white/80">{region.description}</p>
            </div>
          </div>

          <div className="surface-break flex flex-col justify-between rounded-[2rem] px-6 py-8 sm:px-8">
            <div className="space-y-6">
              <div className="space-y-2">
                <p className="eyebrow">{dict.region.offeringsTitle}</p>
                <h2 className="font-heading text-3xl leading-tight">
                  {region.storyCount > 0 ? region.name : dict.region.noStories}
                </h2>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="glass-panel rounded-[1.4rem] px-4 py-4">
                  <p className="font-heading text-3xl text-foreground">{region.storyCount}</p>
                  <p className="text-sm text-muted-foreground">{dict.region.publishedStories}</p>
                </div>
                <div className="glass-panel rounded-[1.4rem] px-4 py-4">
                  <div className="flex items-start gap-3">
                    <MapPinned className="mt-1 size-4 text-primary" />
                    <div className="space-y-1">
                      <p className="font-heading text-lg text-foreground">{region.slug}</p>
                      <p className="text-sm text-muted-foreground">
                        /{locale}/regions/{region.slug}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {region.sectionCounts.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {region.sectionCounts.map((offer) => (
                    <span
                      key={`${region.id}-${offer.section}`}
                      className="rounded-full bg-primary/10 px-3 py-2 text-sm font-medium text-primary"
                    >
                      {dict.nav[offer.section]} · {offer.count}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm leading-6 text-muted-foreground">{dict.region.noStories}</p>
              )}
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button
                render={<Link href={`/${locale}/destinations`} />}
                variant="outline"
                className="flex-1 rounded-xl bg-white/80"
              >
                {dict.region.browseDestinations}
              </Button>
              <Button
                render={<Link href={primaryHref} />}
                className="velvet-button flex-1 rounded-xl"
              >
                {dict.cta.discoverNow}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {region.entriesBySection.length === 0 ? (
        <section className="editorial-shell">
          <div className="surface-break rounded-[2rem] px-6 py-8 text-center sm:px-8">
            <p className="eyebrow">{dict.region.eyebrow}</p>
            <h2 className="mt-3 font-heading text-3xl">{region.name}</h2>
            <p className="mx-auto mt-3 max-w-2xl text-base leading-7 text-muted-foreground">
              {dict.region.noStories}
            </p>
          </div>
        </section>
      ) : (
        region.entriesBySection.map((group) => (
          <section key={group.section} className="editorial-shell space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div className="space-y-2">
                <p className="eyebrow">{dict.region.offeringsTitle}</p>
                <h2 className="font-heading text-3xl sm:text-4xl">{dict.nav[group.section]}</h2>
              </div>
              <Link
                href={`/${locale}/${group.section}?region=${region.slug}`}
                className="inline-flex items-center gap-2 text-sm font-semibold tracking-[0.16em] uppercase text-primary"
              >
                {dict.region.featuredStories}
                <ArrowRight className="size-4" />
              </Link>
            </div>

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {group.entries.map((entry) => (
                <EntryCard
                  key={entry.id}
                  entry={entry}
                  href={`/${locale}/${entry.section}/${entry.slug}`}
                />
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
