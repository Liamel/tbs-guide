import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

import { env, runtimeConfig } from "@/lib/env";
import { schema } from "@/lib/data/schema";

let dbInstance: ReturnType<typeof drizzle<typeof schema>> | null = null;

export function hasDatabase() {
  return runtimeConfig.hasDatabase;
}

export function getDb() {
  if (!env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not configured.");
  }

  if (!dbInstance) {
    dbInstance = drizzle(neon(env.DATABASE_URL), { schema });
  }

  return dbInstance;
}
