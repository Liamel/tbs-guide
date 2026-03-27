"use client";

import { startTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Image from "next/image";
import { Trash2 } from "lucide-react";

import { deleteMediaAssetAction } from "@/app/CMS/actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
      <Card className="glass-panel-strong border-0 p-0 ring-0">
        <form
          className="grid gap-4 px-6 py-6 lg:grid-cols-[1fr_1fr]"
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
          <div className="space-y-2">
            <p className="eyebrow">Media Upload</p>
            <h2 className="font-heading text-3xl">Cloudinary asset library</h2>
            <p className="text-sm leading-6 text-muted-foreground">
              Upload editorial imagery for cards, heroes, and detail pages.
            </p>
          </div>
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label>Image File</Label>
              <Input
                type="file"
                accept="image/*"
                disabled={disabled || pending}
                onChange={(event) => setFile(event.target.files?.[0] ?? null)}
                className="h-11 rounded-2xl"
              />
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              <div className="space-y-2">
                <Label>Alt EN</Label>
                <Input value={altEn} onChange={(event) => setAltEn(event.target.value)} className="h-11 rounded-2xl" />
              </div>
              <div className="space-y-2">
                <Label>Alt KA</Label>
                <Input value={altKa} onChange={(event) => setAltKa(event.target.value)} className="h-11 rounded-2xl" />
              </div>
              <div className="space-y-2">
                <Label>Alt RU</Label>
                <Input value={altRu} onChange={(event) => setAltRu(event.target.value)} className="h-11 rounded-2xl" />
              </div>
            </div>
            <Button type="submit" className="velvet-button rounded-xl" disabled={disabled || pending}>
              {pending ? "Uploading..." : "Upload Image"}
            </Button>
          </div>
        </form>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {mediaLibrary.map((asset) => {
          const usageCount = assetUsage[asset.id] ?? 0;

          return (
            <Card key={asset.id} className="glass-panel border-0 p-0 ring-0">
              <div className="relative aspect-[4/3] overflow-hidden rounded-t-[1.25rem]">
                <Image
                  src={asset.secureUrl}
                  alt={asset.alt.en || asset.publicId}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
              <div className="space-y-3 px-4 py-4">
                <p className="font-heading text-lg">{asset.alt.en || asset.publicId}</p>
                <p className="truncate text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  {asset.publicId}
                </p>
                <div className="flex items-center justify-between gap-3 text-sm text-muted-foreground">
                  <span>
                    {asset.width} x {asset.height}
                  </span>
                  <span>{usageCount} linked</span>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full rounded-xl"
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
            </Card>
          );
        })}
      </div>
    </div>
  );
}
