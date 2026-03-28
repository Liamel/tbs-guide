import { RegionsEditor } from "@/components/cms/regions-editor";
import {
  CmsMetricCard,
  CmsPageHeader,
  CmsStatusBadge,
} from "@/components/cms/cms-ui";
import { getCmsEntriesSnapshot } from "@/lib/content/service";

export default async function CmsRegionsPage() {
  const snapshot = await getCmsEntriesSnapshot();
  const regionsWithStories = snapshot.regions.filter((region) =>
    snapshot.entries.some((entry) => entry.isPublished && entry.regionId === region.id),
  ).length;

  return (
    <div className="space-y-6">
      <CmsPageHeader
        eyebrow="Regional Taxonomy"
        title="Regions"
        description="Manage the region labels and summaries used by the homepage map, destination routing, and dedicated regional landing pages."
        meta={
          <>
            <CmsStatusBadge tone="accent">{snapshot.regions.length} total regions</CmsStatusBadge>
            <CmsStatusBadge tone="success">{regionsWithStories} with stories</CmsStatusBadge>
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <CmsMetricCard
          label="Regions"
          value={snapshot.regions.length}
          description="Region records available for the homepage map and destination pages."
          tone="accent"
        />
        <CmsMetricCard
          label="Active"
          value={regionsWithStories}
          description="Regions that currently have at least one published story attached."
        />
        <CmsMetricCard
          label="Unfilled"
          value={snapshot.regions.length - regionsWithStories}
          description="Regions ready for CMS copy, slugs, and future entries."
        />
      </div>

      <RegionsEditor regions={snapshot.regions} />
    </div>
  );
}
