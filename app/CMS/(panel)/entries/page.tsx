import { CmsEntriesTable } from "@/components/cms/cms-entries-table";
import { getCmsEntriesSnapshot } from "@/lib/content/service";

export default async function CmsEntriesPage() {
  const snapshot = await getCmsEntriesSnapshot();

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <p className="eyebrow">Content Registry</p>
        <h1 className="font-heading text-4xl">Entries</h1>
        <p className="text-sm leading-6 text-muted-foreground">
          All multilingual destination, vineyard, heritage, and experience records are edited here.
        </p>
      </div>
      <CmsEntriesTable entries={snapshot.entries} regions={snapshot.regions} />
    </div>
  );
}
