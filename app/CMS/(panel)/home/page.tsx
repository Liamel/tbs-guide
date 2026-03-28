import { HomepageEditor } from "@/components/cms/homepage-editor";
import {
  CmsMetricCard,
  CmsPageHeader,
  CmsStatusBadge,
} from "@/components/cms/cms-ui";
import { getCmsEntriesSnapshot } from "@/lib/content/service";

export default async function CmsHomePage() {
  const snapshot = await getCmsEntriesSnapshot();
  const publishedEntries = snapshot.entries.filter((entry) => entry.isPublished).length;

  return (
    <div className="space-y-6">
      <CmsPageHeader
        eyebrow="Overview"
        title="CMS Dashboard"
        description="Start from the homepage editor, then move into entries, media, or users depending on the task."
        meta={
          <>
            <CmsStatusBadge tone="accent">{snapshot.entries.length} total entries</CmsStatusBadge>
            <CmsStatusBadge tone="success">{publishedEntries} published</CmsStatusBadge>
            <CmsStatusBadge tone="neutral">{snapshot.mediaAssets.length} media assets</CmsStatusBadge>
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <CmsMetricCard
          label="Entries"
          value={snapshot.entries.length}
          description="Structured destination and editorial records across the site."
          tone="accent"
        />
        <CmsMetricCard
          label="Published"
          value={publishedEntries}
          description="Entries currently visible on the public website."
        />
        <CmsMetricCard
          label="Media Assets"
          value={snapshot.mediaAssets.length}
          description="Images available for cards, hero sections, and homepage slots."
        />
      </div>

      <HomepageEditor
        homepage={snapshot.homepage}
        slots={snapshot.homepageSlots}
        entries={snapshot.entries}
      />
    </div>
  );
}
