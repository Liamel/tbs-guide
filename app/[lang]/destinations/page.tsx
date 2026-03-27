import { DestinationCard } from "@/components/marketing/destination-card";
import { assertLocale, getDictionary } from "@/lib/i18n";
import { getDestinationViews } from "@/lib/content/service";

export default async function DestinationsPage({
  params,
}: PageProps<"/[lang]/destinations">) {
  const { lang } = await params;
  const locale = assertLocale(lang);
  const dict = getDictionary(locale);
  const destinations = await getDestinationViews(locale);

  return (
    <div className="space-y-10 pb-12 pt-8">
      <section className="editorial-shell space-y-6">
        <div className="grid gap-6 lg:grid-cols-[1.12fr_0.88fr]">
          <div className="space-y-3">
            <p className="eyebrow">{dict.nav.destinations}</p>
            <h1 className="section-title">Regions that anchor the editorial guide.</h1>
            <p className="max-w-3xl text-lg leading-8 text-muted-foreground">
              Browse the main Georgian destinations first, then move deeper into the heritage,
              vineyard, and experience stories attached to each landscape.
            </p>
          </div>
          <div className="glass-panel rounded-[1.75rem] px-5 py-5 text-sm leading-7 text-muted-foreground">
            The destinations layer works as the wide-angle view of the guide: regions first,
            stories second, and enough room on the canvas to understand how the content fits
            together.
          </div>
        </div>
      </section>

      <section className="editorial-shell grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {destinations.map((destination) => (
          <div key={destination.id} id={destination.slug} className="scroll-mt-32">
            <DestinationCard
              destination={destination}
              href={`/${locale}/heritage?region=${destination.slug}`}
              locale={locale}
            />
          </div>
        ))}
      </section>
    </div>
  );
}
