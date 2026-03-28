import { CmsEntriesTable } from "@/components/cms/cms-entries-table";
import {
  CmsPageHeader,
  CmsStatusBadge,
} from "@/components/cms/cms-ui";
import { getCmsEntriesSnapshot } from "@/lib/content/service";

export default async function CmsEntriesPage() {
  const snapshot = await getCmsEntriesSnapshot();
  const publishedEntries = snapshot.entries.filter((entry) => entry.isPublished).length;

  return (
    <div className="space-y-6">
      <CmsPageHeader
        eyebrow="Content Registry"
        title="Entries"
        description="This is the main editorial inventory. Open an entry to edit its copy, media, highlights, and publishing state."
        meta={
          <>
            <CmsStatusBadge tone="accent">{snapshot.entries.length} total</CmsStatusBadge>
            <CmsStatusBadge tone="success">{publishedEntries} published</CmsStatusBadge>
            <CmsStatusBadge tone="neutral">{snapshot.regions.length} regions</CmsStatusBadge>
          </>
        }
      />
      <CmsEntriesTable entries={snapshot.entries} regions={snapshot.regions} />
    </div>
  );
}
