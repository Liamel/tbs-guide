"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Compass, MapPinned } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { georgiaRegionMapAreas, georgiaMapViewBox } from "@/lib/content/regions";
import type { HomepageView, RegionSummaryView } from "@/lib/content/types";
import { getDictionary, type Locale } from "@/lib/i18n";

type RegionsHeroProps = {
  hero: HomepageView["hero"];
  regions: RegionSummaryView[];
  locale: Locale;
};

export function RegionsHero({ hero, regions, locale }: RegionsHeroProps) {
  const router = useRouter();
  const clipPathIdPrefix = useId().replace(/:/g, "");
  const dict = getDictionary(locale);
  const [hoveredSlug, setHoveredSlug] = useState<string | null>(null);

  const defaultRegion = regions.find((region) => region.storyCount > 0) ?? regions[0];
  const activeRegion =
    regions.find((region) => region.slug === hoveredSlug) ?? defaultRegion;

  if (!defaultRegion || !activeRegion) {
    return null;
  }

  const profileCard = (
    <div className="space-y-5">
      <div className="space-y-2">
        <p className="eyebrow">{dict.region.eyebrow}</p>
        <div className="space-y-2">
          <h2 className="font-heading text-2xl sm:text-3xl">{activeRegion.name}</h2>
          <p className="text-sm leading-6 text-muted-foreground">{activeRegion.description}</p>
        </div>
      </div>

      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="font-heading text-4xl text-foreground">{activeRegion.storyCount}</p>
          <p className="text-sm text-muted-foreground">{dict.region.publishedStories}</p>
        </div>
        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-muted-foreground">
          <MapPinned className="size-3.5 text-primary" />
          <span>{activeRegion.slug}</span>
        </div>
      </div>

      {activeRegion.sectionCounts.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {activeRegion.sectionCounts.map((offer) => (
            <span
              key={`${activeRegion.id}-${offer.section}`}
              className="rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-primary"
            >
              {dict.nav[offer.section]} · {offer.count}
            </span>
          ))}
        </div>
      ) : (
        <p className="text-sm leading-6 text-muted-foreground">{dict.region.noStories}</p>
      )}

      {activeRegion.featuredStories.length > 0 ? (
        <div className="space-y-2">
          <p className="eyebrow">{dict.region.featuredStories}</p>
          <div className="space-y-2">
            {activeRegion.featuredStories.slice(0, 2).map((story) => (
              <Link
                key={story.id}
                href={`/${locale}/${story.section}/${story.slug}`}
                className="group flex items-center justify-between gap-3 rounded-[1.1rem] border border-border/60 bg-white/80 px-4 py-3 transition-colors hover:bg-white"
              >
                <div className="space-y-1">
                  <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-primary">
                    {dict.nav[story.section]}
                  </p>
                  <p className="text-sm font-medium text-foreground">{story.title}</p>
                </div>
                <ArrowRight className="size-4 shrink-0 text-primary transition-transform group-hover:translate-x-1" />
              </Link>
            ))}
          </div>
        </div>
      ) : null}

      <div className="flex flex-col gap-2 sm:flex-row">
        <Button
          render={<Link href={`/${locale}/regions/${activeRegion.slug}`} />}
          className="velvet-button flex-1 rounded-xl"
        >
          {dict.region.exploreRegion}
        </Button>
        <Button
          render={<Link href={`/${locale}/destinations`} />}
          variant="outline"
          className="flex-1 rounded-xl bg-white/80"
        >
          {dict.region.browseDestinations}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <section className="grid gap-5 lg:grid-cols-[1.08fr_0.92fr] lg:items-end">
        <div className="space-y-4">
          <p className="eyebrow">{hero.kicker}</p>
          <div className="space-y-3">
            <h1 className="section-title">
              {hero.lead} <span className="text-primary">{hero.accent}</span>
            </h1>
            <p className="max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
              {hero.description}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
          <Button
            render={<Link href={`/${locale}/destinations`} />}
            variant="outline"
            className="rounded-xl bg-white/80 px-5 py-5 text-sm"
          >
            {dict.cta.exploreCollection}
          </Button>
          <Button
            render={<Link href={`/${locale}/regions/${activeRegion.slug}`} />}
            className="velvet-button rounded-xl px-5 py-5 text-sm"
          >
            {dict.cta.discoverNow}
          </Button>
        </div>
      </section>

      <section className="surface-break overflow-hidden rounded-[2.8rem] p-3 sm:p-4">
        <div
          className="relative min-h-[760px] overflow-hidden rounded-[2.3rem] bg-[#0b1012] shadow-[0_40px_100px_rgba(8,12,14,0.28)] lg:min-h-[880px]"
          onMouseLeave={() => setHoveredSlug(null)}
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.14),transparent_26%),radial-gradient(circle_at_bottom_right,rgba(161,60,63,0.14),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0))]" />

          <div className="absolute inset-0 px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8 xl:px-10 xl:py-10">
            <svg
              viewBox={`0 0 ${georgiaMapViewBox.width} ${georgiaMapViewBox.height}`}
              className="relative z-10 h-full w-full"
              role="img"
              aria-label="Interactive regions of Georgia map"
            >
              <title>Regions of Georgia</title>
              <image
                href="/media/regions-of-georgia-map.png"
                x="0"
                y="0"
                width={georgiaMapViewBox.width}
                height={georgiaMapViewBox.height}
                preserveAspectRatio="none"
                style={{ filter: "grayscale(1) contrast(1.02) brightness(0.9)" }}
              />

              {georgiaRegionMapAreas.map((area) => {
                const region = regions.find((candidate) => candidate.slug === area.slug);
                if (!region) {
                  return null;
                }

                const clipPathId = `${clipPathIdPrefix}-${area.slug}`;
                const isActive = hoveredSlug === area.slug;
                const href = `/${locale}/regions/${region.slug}`;

                return (
                  <g key={area.slug}>
                    <defs>
                      <clipPath id={clipPathId}>
                        <polygon points={area.points} />
                      </clipPath>
                    </defs>

                    <g
                      clipPath={`url(#${clipPathId})`}
                      className={cn(
                        "pointer-events-none transition-opacity duration-300",
                        isActive ? "opacity-100" : "opacity-0",
                      )}
                    >
                      <image
                        href="/media/regions-of-georgia-map.png"
                        x="0"
                        y="0"
                        width={georgiaMapViewBox.width}
                        height={georgiaMapViewBox.height}
                        preserveAspectRatio="none"
                      />
                    </g>

                    <polygon
                      points={area.points}
                      fill={isActive ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.01)"}
                      stroke={isActive ? "#f7d68d" : "rgba(255,255,255,0.18)"}
                      strokeWidth={isActive ? 0.5 : 0.24}
                      strokeLinejoin="round"
                      className="cursor-pointer transition-[fill,stroke,stroke-width] duration-300"
                      style={{ outline: "none" }}
                      onMouseEnter={() => setHoveredSlug(area.slug)}
                      onMouseDown={(event) => {
                        event.preventDefault();
                      }}
                      onFocus={() => setHoveredSlug(area.slug)}
                      onBlur={() => setHoveredSlug(null)}
                      onClick={() => router.push(href)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          router.push(href);
                        }
                      }}
                      role="link"
                      tabIndex={0}
                      aria-label={`${dict.region.exploreRegion}: ${region.name}`}
                    />
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="absolute bottom-4 left-4 z-20 hidden items-center gap-2 rounded-full border border-white/10 bg-black/40 px-4 py-2 text-sm text-white/70 backdrop-blur-sm lg:inline-flex lg:left-6 lg:bottom-6">
            <Compass className="size-4 text-[#ff9e7b]" />
            <span>{dict.home.regionsMapHint}</span>
          </div>

          <aside className="absolute bottom-6 right-6 z-20 hidden w-[360px] rounded-[1.8rem] border border-white/10 bg-[#f5efe6]/95 p-5 shadow-[0_24px_70px_rgba(0,0,0,0.22)] backdrop-blur-sm lg:block">
            {profileCard}
          </aside>
        </div>

        <div className="space-y-4 px-1 pt-4 lg:hidden">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Compass className="size-4 text-primary" />
            <span>{dict.home.regionsMapHint}</span>
          </div>
          <div className="rounded-[1.8rem] border border-border/60 bg-white/90 p-5">
            {profileCard}
          </div>
        </div>
      </section>
    </div>
  );
}
