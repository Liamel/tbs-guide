import { notFound } from "next/navigation";
import { CarFront, MapPinned, Mountain, TramFront } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DetailMap } from "@/components/marketing/detail-map";
import { getEntryDetail } from "@/lib/content/service";
import { assertLocale, getDictionary } from "@/lib/i18n";

function iconForMode(mode: string) {
  if (mode === "hike") {
    return Mountain;
  }

  if (mode === "bus") {
    return TramFront;
  }

  return CarFront;
}

export default async function EntryDetailPage({
  params,
}: PageProps<"/[lang]/[section]/[slug]">) {
  const { lang, section, slug } = await params;
  const locale = assertLocale(lang);
  const dict = getDictionary(locale);
  const entry = await getEntryDetail(locale, section, slug);

  if (!entry) {
    notFound();
  }

  return (
    <div className="space-y-14 pb-16 pt-8">
      <section className="editorial-shell">
        <div
          className="relative overflow-hidden rounded-[2rem] px-6 py-8 sm:px-10 sm:py-10"
          style={{
            backgroundImage: `linear-gradient(90deg, rgba(14,20,26,0.62), rgba(14,20,26,0.18)), url(${entry.imageUrl})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="max-w-3xl space-y-4 pt-40 text-white sm:pt-56">
            <Badge className="rounded-full bg-primary text-primary-foreground">{entry.eyebrow}</Badge>
            <h1 className="section-title max-w-2xl text-white">{entry.title}</h1>
            <p className="max-w-xl text-base leading-7 text-white/78">{entry.summary}</p>
          </div>
        </div>
      </section>

      <section className="editorial-shell grid gap-8 lg:grid-cols-[1.08fr_0.92fr]">
        <div className="space-y-6">
          <div className="space-y-3">
            <p className="eyebrow">{entry.eyebrow}</p>
            <h2 className="font-heading text-3xl sm:text-4xl">{entry.title}</h2>
          </div>
          <p className="max-w-3xl whitespace-pre-line text-base leading-8 text-muted-foreground">
            {entry.body}
          </p>
          <blockquote className="glass-panel border-0 rounded-[1.6rem] p-6 font-heading text-xl leading-8 text-muted-foreground">
            “{entry.pullQuote}”
          </blockquote>
        </div>

        <div className="space-y-4">
          <Card className="surface-break border-0 p-0 ring-0">
            <div className="space-y-4 px-6 py-6">
              <p className="eyebrow">{dict.detail.highlightsTitle}</p>
              <div className="space-y-4">
                {entry.highlights.map((highlight, index) => (
                  <div key={highlight.id} className="grid grid-cols-[auto_1fr] gap-3">
                    <div className="font-heading text-sm text-primary">
                      {String(index + 1).padStart(2, "0")}
                    </div>
                    <div>
                      <p className="font-heading text-lg">{highlight.title}</p>
                      <p className="text-sm leading-6 text-muted-foreground">
                        {highlight.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="h-48 rounded-b-[1.5rem] bg-[radial-gradient(circle_at_top_left,rgba(161,60,63,0.24),transparent_35%),linear-gradient(135deg,#c9d6dd_0%,#8ea1ab_100%)]" />
          </Card>
        </div>
      </section>

      <section className="surface-break py-14">
        <div className="editorial-shell space-y-8">
          <div className="text-center">
            <h2 className="font-heading text-3xl sm:text-4xl">{entry.journeyTitle}</h2>
            <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
              {entry.journeySummary}
            </p>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {entry.transports.map((transport) => {
              const Icon = iconForMode(transport.mode);

              return (
                <Card key={transport.id} className="glass-panel-strong border-0 p-0 ring-0">
                  <div className="space-y-4 px-5 py-5">
                    <Icon className="size-5 text-primary" />
                    <div className="space-y-2">
                      <h3 className="font-heading text-2xl">{transport.title}</h3>
                      <p className="text-sm leading-6 text-muted-foreground">
                        {transport.description}
                      </p>
                    </div>
                    <Button
                      render={<a href={transport.ctaHref} target="_blank" rel="noreferrer" />}
                      variant="link"
                      className="px-0 text-primary"
                    >
                      {transport.ctaLabel}
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section className="editorial-shell space-y-8">
        <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <Card className="glass-panel-strong border-0 p-0 ring-0">
            <div className="space-y-4 px-5 py-5">
              <p className="eyebrow">{entry.locationLabel}</p>
              <div className="space-y-2">
                <div className="flex items-start gap-3">
                  <MapPinned className="mt-1 size-4 text-primary" />
                  <p className="text-sm leading-6 text-muted-foreground">{entry.address}</p>
                </div>
              </div>
              <Button
                render={
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${entry.latitude},${entry.longitude}`}
                    target="_blank"
                    rel="noreferrer"
                  />
                }
                className="velvet-button rounded-xl"
              >
                {entry.mapLabel}
              </Button>
            </div>
          </Card>
          <DetailMap latitude={entry.latitude} longitude={entry.longitude} label={entry.mapLabel} />
        </div>
      </section>
    </div>
  );
}
