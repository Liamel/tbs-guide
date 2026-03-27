import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MapPinned } from "lucide-react";

import { Card } from "@/components/ui/card";
import type { DestinationView } from "@/lib/content/types";
import { getDictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";

type DestinationCardProps = {
  destination: DestinationView;
  href: string;
  locale: Locale;
};

export function DestinationCard({
  destination,
  href,
  locale,
}: DestinationCardProps) {
  const dict = getDictionary(locale);

  return (
    <Card className="glass-panel-strong overflow-hidden border-0 p-0 ring-0">
      <Link href={href} className="group flex h-full flex-col">
        <div className="relative aspect-[5/4] overflow-hidden">
          <Image
            src={destination.imageUrl}
            alt={destination.imageAlt}
            fill
            className="object-cover transition duration-700 group-hover:scale-[1.03]"
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 25vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/18 to-transparent" />
          <div className="absolute inset-x-4 bottom-4 flex items-end justify-between gap-3 text-white">
            <div className="space-y-1">
              <p className="eyebrow text-white/72">REGION</p>
              <h3 className="font-heading text-2xl">{destination.name}</h3>
            </div>
            <div className="glass-panel rounded-full px-3 py-2 text-xs text-white">
              {destination.storyCount}
            </div>
          </div>
        </div>
        <div className="flex flex-1 flex-col gap-4 px-4 py-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPinned className="size-4 text-primary" />
            <span>{destination.description}</span>
          </div>
          <div className="mt-auto flex items-center justify-between gap-3 text-sm text-primary">
            <div className="flex flex-wrap gap-2">
              {destination.sections.slice(0, 3).map((section) => (
                <span
                  key={`${destination.id}-${section}`}
                  className="rounded-full bg-primary/10 px-3 py-1 text-[0.68rem] font-semibold tracking-[0.16em] uppercase text-primary"
                >
                  {dict.nav[section]}
                </span>
              ))}
            </div>
            <ArrowRight className="size-4 shrink-0 transition-transform group-hover:translate-x-1" />
          </div>
        </div>
      </Link>
    </Card>
  );
}
