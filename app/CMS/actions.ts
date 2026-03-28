"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq, inArray } from "drizzle-orm";
import { v2 as cloudinary } from "cloudinary";

import { auth } from "@/lib/auth/auth";
import { requireCmsSession } from "@/lib/auth/session";
import { hasDatabase, getDb } from "@/lib/data/db";
import { env, runtimeConfig } from "@/lib/env";
import {
  categories,
  entries,
  entryCategoryLinks,
  entryHighlights,
  entryTransportOptions,
  entryTranslations,
  homepageContent,
  homepageFeatureSlots,
  mediaAssets,
  regions,
  users,
} from "@/lib/data/schema";
import type { CmsRole } from "@/lib/auth/roles";
import {
  cmsPasswordResetSchema,
  cmsUserCreateSchema,
  ensurePublishableTranslations,
  entryFormSchema,
  homepageFormSchema,
  regionsFormSchema,
  type CmsPasswordResetValues,
  type CmsUserCreateValues,
  type EntryFormValues,
  type HomepageFormValues,
  type RegionsFormValues,
} from "@/lib/content/validators";
import { locales } from "@/lib/i18n";

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
});

function assertDatabase() {
  if (!hasDatabase()) {
    throw new Error("Backend storage is not configured yet.");
  }

  return getDb();
}

function revalidateAllPublicPaths() {
  revalidatePath("/en");
  revalidatePath("/ka");
  revalidatePath("/ru");
  revalidatePath("/en/regions/[slug]", "page");
  revalidatePath("/ka/regions/[slug]", "page");
  revalidatePath("/ru/regions/[slug]", "page");
  revalidatePath("/en/heritage");
  revalidatePath("/ka/heritage");
  revalidatePath("/ru/heritage");
  revalidatePath("/en/destinations");
  revalidatePath("/ka/destinations");
  revalidatePath("/ru/destinations");
  revalidatePath("/en/vineyards");
  revalidatePath("/ka/vineyards");
  revalidatePath("/ru/vineyards");
  revalidatePath("/en/experiences");
  revalidatePath("/ka/experiences");
  revalidatePath("/ru/experiences");
  revalidatePath("/CMS/home");
  revalidatePath("/CMS/entries");
  revalidatePath("/CMS/media");
  revalidatePath("/CMS/regions");
  revalidatePath("/CMS/users");
}

export async function saveEntryAction(payload: EntryFormValues) {
  const session = await requireCmsSession();
  const values = entryFormSchema.parse(payload);
  ensurePublishableTranslations(values);

  const db = assertDatabase();
  const entryId = values.id ?? crypto.randomUUID();

  await db
    .insert(entries)
    .values({
      id: entryId,
      type: values.type,
      slug: values.slug,
      regionId: values.regionId,
      heroMediaId: values.heroMediaId,
      address: values.address,
      latitude: values.latitude.toString(),
      longitude: values.longitude.toString(),
      isPublished: values.isPublished,
      isFeatured: values.isFeatured,
      sortOrder: values.sortOrder,
      updatedByUserId: session.user.id,
      createdByUserId: values.id ? undefined : session.user.id,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: entries.id,
      set: {
        type: values.type,
        slug: values.slug,
        regionId: values.regionId,
        heroMediaId: values.heroMediaId,
        address: values.address,
        latitude: values.latitude.toString(),
        longitude: values.longitude.toString(),
        isPublished: values.isPublished,
        isFeatured: values.isFeatured,
        sortOrder: values.sortOrder,
        updatedByUserId: session.user.id,
        updatedAt: new Date(),
      },
    });

  await Promise.all([
    db.delete(entryTranslations).where(eq(entryTranslations.entryId, entryId)),
    db.delete(entryCategoryLinks).where(eq(entryCategoryLinks.entryId, entryId)),
    db.delete(entryHighlights).where(eq(entryHighlights.entryId, entryId)),
    db.delete(entryTransportOptions).where(eq(entryTransportOptions.entryId, entryId)),
  ]);

  await db.insert(entryTranslations).values(
    locales.map((locale) => ({
      id: crypto.randomUUID(),
      entryId,
      locale,
      ...values.translations[locale],
    })),
  );

  if (values.categoryIds.length > 0) {
    const existingCategories = await db
      .select({ id: categories.id })
      .from(categories)
      .where(inArray(categories.id, values.categoryIds));

    await db.insert(entryCategoryLinks).values(
      existingCategories.map((category) => ({
        entryId,
        categoryId: category.id,
      })),
    );
  }

  if (values.highlights.length > 0) {
    await db.insert(entryHighlights).values(
      values.highlights.map((highlight, index) => ({
        id: highlight.id ?? crypto.randomUUID(),
        entryId,
        sortOrder: highlight.sortOrder ?? index,
        title: highlight.title,
        description: highlight.description,
      })),
    );
  }

  if (values.transports.length > 0) {
    await db.insert(entryTransportOptions).values(
      values.transports.map((transport, index) => ({
        id: transport.id ?? crypto.randomUUID(),
        entryId,
        mode: transport.mode,
        sortOrder: transport.sortOrder ?? index,
        title: transport.title,
        description: transport.description,
        ctaLabel: transport.ctaLabel,
        ctaHref: transport.ctaHref,
      })),
    );
  }

  revalidateAllPublicPaths();

  return { success: true, entryId };
}

export async function saveHomepageAction(payload: HomepageFormValues) {
  await requireCmsSession();
  const values = homepageFormSchema.parse(payload);
  const db = assertDatabase();

  await db
    .insert(homepageContent)
    .values({
      key: values.key,
      heroKicker: values.heroKicker,
      heroLead: values.heroLead,
      heroAccent: values.heroAccent,
      heroDescription: values.heroDescription,
      primaryCtaLabel: values.primaryCtaLabel,
      secondaryCtaLabel: values.secondaryCtaLabel,
      newsletterTitle: values.newsletterTitle,
      newsletterDescription: values.newsletterDescription,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: homepageContent.key,
      set: {
        heroKicker: values.heroKicker,
        heroLead: values.heroLead,
        heroAccent: values.heroAccent,
        heroDescription: values.heroDescription,
        primaryCtaLabel: values.primaryCtaLabel,
        secondaryCtaLabel: values.secondaryCtaLabel,
        newsletterTitle: values.newsletterTitle,
        newsletterDescription: values.newsletterDescription,
        updatedAt: new Date(),
      },
    });

  const slotKeys = Object.keys(values.featuredSlots);
  if (slotKeys.length > 0) {
    await db.delete(homepageFeatureSlots);
    await db.insert(homepageFeatureSlots).values(
      slotKeys.map((slotKey, index) => ({
        id: crypto.randomUUID(),
        slotKey,
        entryId: values.featuredSlots[slotKey]!,
        sortOrder: index,
      })),
    );
  }

  revalidateAllPublicPaths();

  return { success: true };
}

export async function saveRegionsAction(payload: RegionsFormValues) {
  await requireCmsSession();
  const values = regionsFormSchema.parse(payload);
  const db = assertDatabase();

  await Promise.all(
    values.regions.map((region) =>
      db
        .insert(regions)
        .values({
          id: region.id ?? crypto.randomUUID(),
          slug: region.slug.trim().toLowerCase(),
          orderIndex: region.orderIndex,
          name: region.name,
          description: region.description,
        })
        .onConflictDoUpdate({
          target: regions.id,
          set: {
            slug: region.slug.trim().toLowerCase(),
            orderIndex: region.orderIndex,
            name: region.name,
            description: region.description,
          },
        }),
    ),
  );

  revalidateAllPublicPaths();

  return { success: true };
}

export async function deleteMediaAssetAction(assetId: string) {
  await requireCmsSession();
  const db = assertDatabase();
  const [asset] = await db
    .select({
      id: mediaAssets.id,
      publicId: mediaAssets.publicId,
      secureUrl: mediaAssets.secureUrl,
    })
    .from(mediaAssets)
    .where(eq(mediaAssets.id, assetId))
    .limit(1);

  if (!asset) {
    throw new Error("Media asset not found.");
  }

  if (runtimeConfig.hasCloudinary && asset.secureUrl.includes("res.cloudinary.com")) {
    try {
      await cloudinary.uploader.destroy(asset.publicId, {
        resource_type: "image",
        invalidate: true,
      });
    } catch {
      // Keep the CMS record removable even if the upstream asset has already disappeared.
    }
  }

  await db.delete(mediaAssets).where(eq(mediaAssets.id, assetId));
  revalidateAllPublicPaths();

  return { success: true };
}

export async function createModeratorAction(payload: CmsUserCreateValues) {
  const session = await requireCmsSession({ ownerOnly: true });
  const values = cmsUserCreateSchema.parse(payload);
  const requestHeaders = await headers();

  const email =
    values.email && values.email.trim().length > 0
      ? values.email.trim().toLowerCase()
      : `${values.username}@kartli-guide.internal`;

  const createUserBody = {
    email,
    password: values.password,
    name: values.name,
    role: "moderator" as CmsRole,
    data: {
      username: values.username,
      displayUsername: values.username,
    },
  };

  const created = await auth.api.createUser({
    headers: requestHeaders,
    body: createUserBody as never,
  });

  if (!created?.user) {
    throw new Error("Failed to create moderator.");
  }

  revalidatePath("/CMS/users");

  return { success: true, actorId: session.user.id };
}

export async function removeCmsUserAction(userId: string) {
  await requireCmsSession({ ownerOnly: true });
  const db = assertDatabase();
  const requestHeaders = await headers();
  const [targetUser] = await db.select({ role: users.role }).from(users).where(eq(users.id, userId)).limit(1);

  if (targetUser?.role === "owner") {
    throw new Error("The owner account cannot be removed.");
  }

  const result = await auth.api.removeUser({
    headers: requestHeaders,
    body: { userId },
  });

  revalidatePath("/CMS/users");

  return result;
}

export async function resetCmsUserPasswordAction(payload: CmsPasswordResetValues) {
  await requireCmsSession({ ownerOnly: true });
  const values = cmsPasswordResetSchema.parse(payload);
  const db = assertDatabase();
  const requestHeaders = await headers();
  const [targetUser] = await db
    .select({ role: users.role })
    .from(users)
    .where(eq(users.id, values.userId))
    .limit(1);

  if (targetUser?.role === "owner") {
    throw new Error("The owner password must be managed directly.");
  }

  const result = await auth.api.setUserPassword({
    headers: requestHeaders,
    body: {
      userId: values.userId,
      newPassword: values.password,
    },
  });

  return result;
}

export async function signOutAction() {
  const requestHeaders = await headers();

  await auth.api.signOut({
    headers: requestHeaders,
  });

  redirect("/CMS");
}
