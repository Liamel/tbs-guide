import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { memoryAdapter } from "better-auth/adapters/memory";
import { betterAuth } from "better-auth/minimal";
import { nextCookies } from "better-auth/next-js";
import { admin, username } from "better-auth/plugins";

import { runtimeConfig } from "@/lib/env";
import { cmsAccessControl, cmsRoles } from "@/lib/auth/roles";
import { getDb, hasDatabase } from "@/lib/data/db";
import { schema } from "@/lib/data/schema";

const memoryDb = {
  user: [],
  session: [],
  account: [],
  verification: [],
};

const database = hasDatabase()
  ? drizzleAdapter(getDb(), { provider: "pg", schema })
  : memoryAdapter(memoryDb);

const cmsAdminPlugin = admin({
  ac: cmsAccessControl,
  roles: cmsRoles,
  adminRoles: ["owner"],
  defaultRole: "moderator",
} as never);

export const auth = betterAuth({
  database,
  secret: runtimeConfig.authSecret,
  baseURL: runtimeConfig.authUrl,
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
    requireEmailVerification: false,
  },
  advanced: {
    cookiePrefix: "kartli-guide",
  },
  plugins: [
    nextCookies(),
    username(),
    cmsAdminPlugin,
  ],
});
