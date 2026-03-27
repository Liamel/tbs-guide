import { Card } from "@/components/ui/card";
import { MediaUploadForm } from "@/components/cms/media-upload-form";
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
      {!canManageMedia ? (
        <Card className="glass-panel border-0 px-5 py-5 ring-0">
          <p className="font-heading text-2xl">Media storage is not fully configured</p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Add `DATABASE_URL`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and
            `CLOUDINARY_API_SECRET` to enable uploads and deletions.
          </p>
        </Card>
      ) : null}
      <MediaUploadForm
        assets={snapshot.mediaAssets}
        assetUsage={assetUsage}
        disabled={!canManageMedia}
      />
    </div>
  );
}
