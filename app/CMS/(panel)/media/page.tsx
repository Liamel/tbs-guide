import { Card } from "@/components/ui/card";
import { MediaUploadForm } from "@/components/cms/media-upload-form";
import { getCmsEntriesSnapshot } from "@/lib/content/service";
import { runtimeConfig } from "@/lib/env";

export default async function CmsMediaPage() {
  const snapshot = await getCmsEntriesSnapshot();

  return (
    <div className="space-y-6">
      {!runtimeConfig.hasCloudinary ? (
        <Card className="glass-panel border-0 px-5 py-5 ring-0">
          <p className="font-heading text-2xl">Cloudinary not configured</p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Add `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` to enable uploads.
          </p>
        </Card>
      ) : null}
      <MediaUploadForm assets={snapshot.mediaAssets} disabled={!runtimeConfig.hasCloudinary} />
    </div>
  );
}
