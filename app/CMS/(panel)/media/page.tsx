import { MediaUploadForm } from "@/components/cms/media-upload-form";
import {
  CmsPageHeader,
  CmsSection,
  CmsStatusBadge,
} from "@/components/cms/cms-ui";
import { getCmsEntriesSnapshot } from "@/lib/content/service";
import { runtimeConfig } from "@/lib/env";

export default async function CmsMediaPage() {
  const snapshot = await getCmsEntriesSnapshot();
  const canManageMedia = runtimeConfig.hasCloudinary && runtimeConfig.hasDatabase;
  const assetUsage = snapshot.entries.reduce<Record<string, number>>((usage, entry) => {
    if (!entry.heroMediaId) {
      return usage;
    }

    usage[entry.heroMediaId] = (usage[entry.heroMediaId] ?? 0) + 1;
    return usage;
  }, {});

  assetUsage["media-home-hero"] = (assetUsage["media-home-hero"] ?? 0) + 1;

  return (
    <div className="space-y-6">
      <CmsPageHeader
        eyebrow="Asset Library"
        title="Media"
        description="Upload approved imagery once, then reuse it across entries and the homepage."
        meta={
          <>
            <CmsStatusBadge tone={canManageMedia ? "success" : "warning"}>
              {canManageMedia ? "Uploads enabled" : "Uploads unavailable"}
            </CmsStatusBadge>
            <CmsStatusBadge tone="neutral">{snapshot.mediaAssets.length} assets</CmsStatusBadge>
          </>
        }
      />
      {!canManageMedia ? (
        <CmsSection title="Media storage is not fully configured" tone="muted">
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Add `DATABASE_URL`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and
            `CLOUDINARY_API_SECRET` to enable uploads and deletions.
          </p>
        </CmsSection>
      ) : null}
      <MediaUploadForm
        assets={snapshot.mediaAssets}
        assetUsage={assetUsage}
        disabled={!canManageMedia}
      />
    </div>
  );
}
