"use client";

import { startTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Image from "next/image";
import { Trash2 } from "lucide-react";

import { deleteMediaAssetAction } from "@/app/CMS/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  CmsField,
  CmsSection,
  CmsStatusBadge,
  cmsControlClassName,
} from "@/components/cms/cms-ui";
import { cn } from "@/lib/utils";
import type { MediaAssetRecord } from "@/lib/content/types";

export function MediaUploadForm({
  assets,
  assetUsage,
  disabled,
}: {
  assets: MediaAssetRecord[];
  assetUsage: Record<string, number>;
  disabled: boolean;
}) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [altEn, setAltEn] = useState("");
  const [altKa, setAltKa] = useState("");
  const [altRu, setAltRu] = useState("");
  const [pending, setPending] = useState(false);
  const [deletingAssetId, setDeletingAssetId] = useState<string | null>(null);
  const mediaLibrary = [...assets].sort(
    (left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
  );

  return (
    <div className="space-y-6">
      <CmsSection
        eyebrow="Upload"
        title="Upload new media"
        description="Add approved images once, then reuse them across entry heroes, homepage modules, and listing cards."
      >
        <form
          className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]"
          onSubmit={(event) => {
            event.preventDefault();

            startTransition(async () => {
              try {
                setPending(true);

                if (!file) {
                  throw new Error("Select an image first.");
                }

                const formData = new FormData();
                formData.append("file", file);
                formData.append("altEn", altEn);
                formData.append("altKa", altKa);
                formData.append("altRu", altRu);

                const response = await fetch("/api/uploads", {
                  method: "POST",
                  body: formData,
                });

                const payload = await response.json();

                if (!response.ok) {
                  throw new Error(payload.message || "Upload failed.");
                }

                toast.success("Media uploaded.");
                setFile(null);
                setAltEn("");
                setAltKa("");
                setAltRu("");
                router.refresh();
              } catch (error) {
                toast.error(error instanceof Error ? error.message : "Upload failed.");
              } finally {
                setPending(false);
              }
            });
          }}
        >
          <div className="cms-surface-subtle rounded-[1.5rem] p-5">
            <p className="cms-kicker">Guidance</p>
            <h3 className="mt-2 font-heading text-xl text-foreground">Before you upload</h3>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-muted-foreground">
              <li>Use the strongest public-facing image available for the entry.</li>
              <li>Add alt text in every supported language whenever possible.</li>
              <li>Prefer wide, high-quality source images for hero sections and cards.</li>
            </ul>
          </div>

          <div className="grid gap-4">
            <CmsField
              label="Image File"
              hint="Upload a single editorial image. JPG, PNG, and other browser-supported image formats work here."
            >
              <Input
                type="file"
                accept="image/*"
                disabled={disabled || pending}
                onChange={(event) => setFile(event.target.files?.[0] ?? null)}
                className={cn(cmsControlClassName, "py-2")}
              />
            </CmsField>

            <div className="grid gap-4 md:grid-cols-3">
              <CmsField label="Alt EN" hint="English alternative text for accessibility.">
                <Input
                  value={altEn}
                  onChange={(event) => setAltEn(event.target.value)}
                  className={cmsControlClassName}
                />
              </CmsField>
              <CmsField label="Alt KA" hint="Georgian alternative text.">
                <Input
                  value={altKa}
                  onChange={(event) => setAltKa(event.target.value)}
                  className={cmsControlClassName}
                />
              </CmsField>
              <CmsField label="Alt RU" hint="Russian alternative text.">
                <Input
                  value={altRu}
                  onChange={(event) => setAltRu(event.target.value)}
                  className={cmsControlClassName}
                />
              </CmsField>
            </div>

            <div className="flex justify-end">
              <Button
                type="submit"
                className="cms-primary-button h-11 rounded-xl"
                disabled={disabled || pending}
              >
                {pending ? "Uploading..." : "Upload Image"}
              </Button>
            </div>
          </div>
        </form>
      </CmsSection>

      <CmsSection
        eyebrow="Library"
        title="Media library"
        description="Recent uploads are listed first. Each card shows basic asset metadata and how many entries currently link to the file."
      >
        {mediaLibrary.length === 0 ? (
          <div className="cms-surface-subtle rounded-[1.5rem] p-5 text-sm leading-6 text-muted-foreground">
            No images have been uploaded yet.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {mediaLibrary.map((asset) => {
              const usageCount = assetUsage[asset.id] ?? 0;

              return (
                <div key={asset.id} className="cms-surface-subtle overflow-hidden rounded-[1.5rem]">
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <Image
                      src={asset.secureUrl}
                      alt={asset.alt.en || asset.publicId}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  </div>

                  <div className="space-y-4 p-4">
                    <div className="space-y-2">
                      <p className="font-heading text-lg text-foreground">{asset.alt.en || asset.publicId}</p>
                      <p className="truncate text-xs uppercase tracking-[0.18em] text-muted-foreground">
                        {asset.publicId}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <CmsStatusBadge tone="neutral">
                        {asset.width} x {asset.height}
                      </CmsStatusBadge>
                      <CmsStatusBadge tone={usageCount > 0 ? "accent" : "neutral"}>
                        {usageCount} linked
                      </CmsStatusBadge>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      className="h-11 w-full rounded-xl bg-white/90"
                      disabled={disabled || deletingAssetId === asset.id}
                      onClick={() => {
                        const message =
                          usageCount > 0
                            ? `Delete this image? ${usageCount} entries currently reference it and they will fall back until you assign new media.`
                            : "Delete this image from the CMS library and Cloudinary?";

                        if (!window.confirm(message)) {
                          return;
                        }

                        startTransition(async () => {
                          try {
                            setDeletingAssetId(asset.id);
                            await deleteMediaAssetAction(asset.id);
                            toast.success("Media deleted.");
                            router.refresh();
                          } catch (error) {
                            toast.error(
                              error instanceof Error ? error.message : "Unable to delete media.",
                            );
                          } finally {
                            setDeletingAssetId(null);
                          }
                        });
                      }}
                    >
                      <Trash2 className="size-4" />
                      {deletingAssetId === asset.id ? "Deleting..." : "Delete Image"}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CmsSection>
    </div>
  );
}
