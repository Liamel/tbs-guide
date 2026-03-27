import { assertLocale } from "@/lib/i18n";
import { listEntriesBySection } from "@/lib/content/service";
import { EntryCard } from "@/components/marketing/entry-card";

export default async function ExperiencesPage({
  params,
}: PageProps<"/[lang]/experiences">) {
  const { lang } = await params;
  const locale = assertLocale(lang);
  const entries = await listEntriesBySection(locale, "experiences");

  return (
    <div className="editorial-shell space-y-8 py-10">
      <div className="space-y-3">
        <p className="eyebrow">LIVING CULTURE</p>
        <h1 className="section-title">Experiences designed around voice, table, and craft.</h1>
        <p className="max-w-3xl text-lg leading-8 text-muted-foreground">
          Cultural routes that foreground atmosphere, hosts, and ritual instead of checklist tourism.
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
