import Image from "next/image";
import Link from "next/link";
import { ChevronRight, Compass, Landmark, Wine } from "lucide-react";

import { DestinationCard } from "@/components/marketing/destination-card";
import { EntryCard } from "@/components/marketing/entry-card";
import { Button } from "@/components/ui/button";
import { getDestinationViews, getHomepageView, listEntriesBySection } from "@/lib/content/service";
import { assertLocale, getDictionary } from "@/lib/i18n";

function SectionHeader({
  eyebrow,
  title,
  description,
  href,
}: {
  eyebrow: string;
  title: string;
  description: string;
  href: string;
}) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="space-y-2">
        <p className="eyebrow">{eyebrow}</p>
        <h2 className="font-heading text-3xl sm:text-4xl">{title}</h2>
        <p className="max-w-3xl text-muted-foreground">{description}</p>
      </div>
      <Link
        href={href}
        className="inline-flex items-center gap-1.5 text-sm font-semibold tracking-[0.16em] uppercase text-primary"
      >
        ALL
        <ChevronRight className="size-4" />
      </Link>
    </div>
  );
}

export default async function HomePage({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  const locale = assertLocale(lang);
  const dict = getDictionary(locale);
  const [home, destinations, vineyards] = await Promise.all([
    getHomepageView(locale),
    getDestinationViews(locale),
    listEntriesBySection(locale, "vineyards"),
  ]);
  const vineyardFeature = home.featuredVineyard ?? vineyards[0];

  return (
    <div className="space-y-16 pb-6 pt-6 sm:space-y-24">
      <section id="destinations" className="editorial-shell scroll-mt-32 space-y-8">
        <div className="grid gap-6 lg:grid-cols-[1.18fr_0.82fr]">
          <div className="relative min-h-[560px] overflow-hidden rounded-[2rem] lg:min-h-[680px]">
            <Image
              src={home.hero.featuredImageUrl}
              alt={home.hero.lead}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 64vw"
            />
            <div className="hero-mask absolute inset-0" />
            <div className="relative z-10 flex h-full flex-col justify-between px-6 py-8 sm:px-10 sm:py-10">
              <div className="space-y-5">
                <p className="eyebrow text-white/75">{home.hero.kicker}</p>
                <div className="max-w-xl space-y-2">
                  <h1 className="section-title text-white">
                    {home.hero.lead}{" "}
                    <span className="text-[#ff8f79]">{home.hero.accent}</span>
                  </h1>
                  <p className="max-w-lg text-base leading-7 text-white/78 sm:text-lg">
                    {home.hero.description}
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button
                    render={<Link href={`/${locale}/heritage`} />}
                    className="velvet-button rounded-xl px-5 py-5 text-sm"
                  >
                    {home.hero.primaryCtaLabel}
                  </Button>
                  <Button
                    render={<Link href={`/${locale}/vineyards`} />}
                    variant="outline"
                    className="glass-panel rounded-xl border-white/20 bg-white/10 px-5 py-5 text-sm text-white hover:bg-white/15 hover:text-white"
                  >
                    {home.hero.secondaryCtaLabel}
                  </Button>
                </div>
              </div>
              <div className="flex items-center gap-3 text-white/78">
                <Compass className="size-4" />
                {dict.home.kicker}
              </div>
            </div>
          </div>

          <div className="surface-break flex flex-col justify-between rounded-[2rem] px-6 py-8 sm:px-8">
            <div className="space-y-6">
              <div className="eyebrow">KARTLI EDITION</div>
              <div className="space-y-3">
                <h2 className="font-heading text-3xl leading-tight sm:text-4xl">
                  Discover routes where architecture, wine, and ritual become one story.
                </h2>
                <p className="text-base leading-7 text-muted-foreground">
                  This first edition focuses on heritage landmarks and cultural routes that feel
                  editorial, tactile, and distinctly Georgian.
                </p>
              </div>
            </div>
            <div className="grid gap-3 pt-8 sm:grid-cols-3">
              <div className="glass-panel rounded-[1.4rem] px-4 py-4">
                <Landmark className="mb-3 size-5 text-primary" />
                <p className="font-heading text-lg">60+</p>
                <p className="text-sm text-muted-foreground">historic monuments</p>
              </div>
              <div className="glass-panel rounded-[1.4rem] px-4 py-4">
                <Wine className="mb-3 size-5 text-primary" />
                <p className="font-heading text-lg">8k</p>
                <p className="text-sm text-muted-foreground">years of wine culture</p>
              </div>
              <div className="glass-panel rounded-[1.4rem] px-4 py-4">
                <Compass className="mb-3 size-5 text-primary" />
                <p className="font-heading text-lg">3</p>
                <p className="text-sm text-muted-foreground">languages at launch</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <SectionHeader
            eyebrow={dict.nav.destinations}
            title={dict.nav.destinations}
            description="Start from Georgia’s major regions, then move deeper into the monuments, vineyards, and lived cultural rituals attached to each place."
            href={`/${locale}/destinations`}
          />
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {destinations.map((destination) => (
              <DestinationCard
                key={destination.id}
                destination={destination}
                href={`/${locale}/destinations#${destination.slug}`}
                locale={locale}
              />
            ))}
          </div>
        </div>
      </section>

      <section id="heritage" className="editorial-shell scroll-mt-32 space-y-8">
        <SectionHeader
          eyebrow={dict.nav.heritage}
          title={dict.nav.heritage}
          description={dict.home.mustSeeDescription}
          href={`/${locale}/heritage`}
        />
        <div className="grid gap-6 md:grid-cols-3">
          {home.mustSee.map((entry) => (
            <EntryCard
              key={entry.id}
              entry={entry}
              href={`/${locale}/${entry.section}/${entry.slug}`}
            />
          ))}
        </div>
      </section>

      {vineyardFeature ? (
        <section id="vineyards" className="editorial-shell scroll-mt-32 space-y-8">
          <SectionHeader
            eyebrow={dict.nav.vineyards}
            title={dict.nav.vineyards}
            description="Editorial routes through historic cellars, long vineyard horizons, and the architecture of Georgian wine culture."
            href={`/${locale}/vineyards`}
          />
          <div className="grid gap-8 lg:grid-cols-[0.82fr_1.18fr]">
            <EntryCard
              entry={vineyardFeature}
              href={`/${locale}/${vineyardFeature.section}/${vineyardFeature.slug}`}
              tall
            />
            <div className="surface-break relative overflow-hidden rounded-[2rem] px-6 py-8 sm:px-8">
              <div className="absolute inset-y-0 right-0 hidden w-1/2 bg-[radial-gradient(circle_at_center,rgba(161,60,63,0.16),transparent_56%)] lg:block" />
              <div className="relative z-10 max-w-xl space-y-5">
                <p className="eyebrow">{dict.home.featuredVineyardLabel}</p>
                <h2 className="font-heading text-3xl sm:text-4xl">{vineyardFeature.title}</h2>
                <p className="leading-7 text-muted-foreground">{vineyardFeature.summary}</p>
                <div className="glass-panel-strong max-w-xs rounded-[1.5rem] p-6">
                  <p className="font-heading text-4xl text-primary">8k</p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    Years of recorded viticulture shape the editorial identity of the KARTLI
                    vineyard routes.
                  </p>
                </div>
                <Button
                  render={<Link href={`/${locale}/vineyards`} />}
                  className="velvet-button rounded-xl px-5"
                >
                  {dict.cta.readMore}
                </Button>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      <section id="experiences" className="editorial-shell scroll-mt-32 space-y-8">
        <SectionHeader
          eyebrow={dict.nav.experiences}
          title={dict.nav.experiences}
          description="Culture-first routes focused on table ritual, music, workshops, and atmosphere rather than checklist stops."
          href={`/${locale}/experiences`}
        />
        <div className="grid gap-6 md:grid-cols-3">
          {home.experiences.map((entry) => (
            <EntryCard
              key={entry.id}
              entry={entry}
              href={`/${locale}/${entry.section}/${entry.slug}`}
              compact
            />
          ))}
        </div>
      </section>

      <section id="newsletter" className="bg-[#283135] py-16 text-white">
        <div className="editorial-shell flex flex-col items-center gap-5 text-center">
          <p className="eyebrow text-white/60">{dict.home.newsletterTitle}</p>
          <h2 className="font-heading text-3xl sm:text-4xl">{home.newsletter.title}</h2>
          <p className="max-w-2xl text-base leading-7 text-white/75">
            {home.newsletter.description}
          </p>
          <div className="glass-panel-strong flex w-full max-w-xl flex-col gap-3 rounded-2xl bg-white/10 p-3 sm:flex-row">
            <input
              className="h-12 flex-1 rounded-xl bg-transparent px-4 text-white placeholder:text-white/45 focus:outline-none"
              placeholder="hello@kartli.guide"
            />
            <Button
              render={<a href="mailto:hello@kartli.guide?subject=Plan%20a%20Trip%20in%20Georgia" />}
              className="velvet-button h-12 rounded-xl px-6"
            >
              {dict.cta.planTrip}
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
