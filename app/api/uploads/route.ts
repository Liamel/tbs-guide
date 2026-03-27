import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

import { getCmsSession } from "@/lib/auth/session";
import { env, runtimeConfig } from "@/lib/env";
import { getDb, hasDatabase } from "@/lib/data/db";
import { mediaAssets } from "@/lib/data/schema";

export const runtime = "nodejs";

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
});

export async function POST(request: Request) {
  const session = await getCmsSession();

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  if (!runtimeConfig.hasCloudinary || !hasDatabase()) {
    return NextResponse.json(
      { message: "Cloudinary and database configuration are required." },
      { status: 503 },
    );
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ message: "File is required." }, { status: 400 });
  }

  const alt = {
    en: String(formData.get("altEn") || ""),
    ka: String(formData.get("altKa") || ""),
    ru: String(formData.get("altRu") || ""),
  };

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const uploaded = await new Promise<{
    public_id: string;
    secure_url: string;
    width: number;
    height: number;
  }>((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder: "kartli-guide",
          resource_type: "image",
        },
        (error, result) => {
          if (error || !result) {
            reject(error ?? new Error("Upload failed."));
            return;
          }

          resolve({
            public_id: result.public_id,
            secure_url: result.secure_url,
            width: result.width,
            height: result.height,
          });
        },
      )
      .end(buffer);
  });

  const db = getDb();
  const [asset] = await db
    .insert(mediaAssets)
    .values({
      publicId: uploaded.public_id,
      secureUrl: uploaded.secure_url,
      width: uploaded.width,
      height: uploaded.height,
      alt,
      kind: "photo",
      updatedAt: new Date(),
    })
    .returning();

  return NextResponse.json({ asset });
}
