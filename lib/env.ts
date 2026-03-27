import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().url().optional(),
  BETTER_AUTH_SECRET: z.string().min(32).optional(),
  BETTER_AUTH_URL: z.string().url().optional(),
  NEXT_PUBLIC_SITE_URL: z.string().url().optional(),
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
  CMS_OWNER_NAME: z.string().optional(),
  CMS_OWNER_USERNAME: z.string().optional(),
  CMS_OWNER_PASSWORD: z.string().optional(),
  CMS_OWNER_EMAIL: z.string().email().optional(),
});

const parsed = envSchema.safeParse({
  DATABASE_URL: process.env.DATABASE_URL,
  BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
  BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
  CMS_OWNER_NAME: process.env.CMS_OWNER_NAME,
  CMS_OWNER_USERNAME: process.env.CMS_OWNER_USERNAME,
  CMS_OWNER_PASSWORD: process.env.CMS_OWNER_PASSWORD,
  CMS_OWNER_EMAIL: process.env.CMS_OWNER_EMAIL,
});

if (!parsed.success) {
  throw new Error(`Invalid environment configuration: ${parsed.error.message}`);
}

export const env = parsed.data;

export const runtimeConfig = {
  siteUrl: env.NEXT_PUBLIC_SITE_URL ?? env.BETTER_AUTH_URL ?? "http://localhost:3000",
  authUrl: env.BETTER_AUTH_URL ?? env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  authSecret:
    env.BETTER_AUTH_SECRET ?? "local-development-secret-for-kartli-guide-1234567890",
  hasDatabase: Boolean(env.DATABASE_URL),
  hasCloudinary: Boolean(
    env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET,
  ),
};
