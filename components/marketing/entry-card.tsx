import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { EntryCardView } from "@/lib/content/types";

type EntryCardProps = {
  entry: EntryCardView;
  href: string;
  compact?: boolean;
  tall?: boolean;
};

export function EntryCard({ entry, href, compact = false, tall = false }: EntryCardProps) {
  return (
    <Card
      className={cn(
        "glass-panel-strong overflow-hidden border-0 p-0 ring-0",
        tall && "h-full",
      )}
    >
      <Link href={href} className="group flex h-full flex-col">
        <div className={cn("relative overflow-hidden", compact ? "aspect-[4/3]" : "aspect-[5/4]")}>
          <Image
            src={entry.imageUrl}
            alt={entry.imageAlt}
            fill
            className="object-cover transition duration-700 group-hover:scale-[1.03]"
            sizes={compact ? "(max-width: 768px) 100vw, 40vw" : "(max-width: 768px) 100vw, 33vw"}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent" />
          <div className="absolute left-4 bottom-4">
            <Badge className="rounded-full bg-white/85 text-[0.65rem] tracking-[0.18em] text-foreground uppercase">
              {entry.eyebrow}
            </Badge>
          </div>
        </div>
        <div className="flex flex-1 flex-col gap-3 px-4 py-4">
          <div className="space-y-1.5">
            <h3 className={cn("font-heading leading-tight text-foreground", compact ? "text-2xl" : "text-xl")}>
              {entry.title}
            </h3>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              {entry.regionName}
            </p>
          </div>
          <p className="text-sm leading-6 text-muted-foreground">{entry.summary}</p>
          <div className="mt-auto flex items-center justify-between text-sm text-primary">
            <span>{entry.categoryLabels[0] || entry.locationLabel}</span>
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </div>
        </div>
      </Link>
    </Card>
  );
}
