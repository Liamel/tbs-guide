import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth/auth";
import { isOwner } from "@/lib/auth/roles";
import { runtimeConfig } from "@/lib/env";

export async function getCmsSession() {
  try {
    return await auth.api.getSession({
      headers: await headers(),
    });
  } catch {
    return null;
  }
}

export async function requireCmsSession(options?: { ownerOnly?: boolean }) {
  const session = await getCmsSession();

  if (!session) {
    redirect("/CMS");
  }

  if (options?.ownerOnly && !isOwner(session.user.role)) {
    redirect("/CMS/home");
  }

  return session;
}

export function isCmsEnabled() {
  return runtimeConfig.hasDatabase;
}
