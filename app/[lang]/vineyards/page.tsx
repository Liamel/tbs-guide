import { assertLocale } from "@/lib/i18n";
import { listEntriesBySection } from "@/lib/content/service";
import { EntryCard } from "@/components/marketing/entry-card";

export default async function VineyardsPage({ params }: PageProps<"/[lang]/vineyards">) {
  const { lang } = await params;
  const locale = assertLocale(lang);
  const entries = await listEntriesBySection(locale, "vineyards");

  return (
    <div className="editorial-shell space-y-8 py-10">
      <div className="space-y-3">
        <p className="eyebrow">CURATED VITICULTURE</p>
        <h1 className="section-title">Historic vineyards and cellar routes.</h1>
        <p className="max-w-3xl text-lg leading-8 text-muted-foreground">
          Image-first journeys through Kakheti, qvevri traditions, and the editorial landscapes of Georgian wine.
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {entries.map((entry) => (
          <EntryCard
            key={entry.id}
            entry={entry}
            href={`/${locale}/${entry.section}/${entry.slug}`}
          />
        ))}
      </div>
    </div>
  );
}
