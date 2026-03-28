import { headers } from "next/headers";

import { CmsPageHeader, CmsStatusBadge } from "@/components/cms/cms-ui";
import { UserManagementPanel } from "@/components/cms/user-management-panel";
import { auth } from "@/lib/auth/auth";
import { requireCmsSession } from "@/lib/auth/session";

export default async function CmsUsersPage() {
  await requireCmsSession({ ownerOnly: true });

  const result = await auth.api.listUsers({
    headers: await headers(),
    query: {
      limit: 50,
      sortBy: "createdAt",
      sortDirection: "desc",
    },
  });

  const users = (result.users || []).map((rawUser) => {
    const user = rawUser as typeof rawUser & {
      username?: string | null;
      displayUsername?: string | null;
      createdAt: string | Date;
      role?: string | string[] | null;
    };

    const role = Array.isArray(user.role) ? user.role[0] : user.role;

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      username:
        user.username ||
        user.displayUsername ||
        user.email.split("@")[0] ||
        user.name,
      role: (role === "owner" ? "owner" : "moderator") as "owner" | "moderator",
      banned: user.banned,
      createdAt: new Date(user.createdAt).toISOString(),
    };
  });

  return (
    <div className="space-y-6">
      <CmsPageHeader
        eyebrow="Access Control"
        title="Users"
        description="Owners can create moderator accounts, reset passwords, and remove access when a team member no longer needs the CMS."
        meta={
          <>
            <CmsStatusBadge tone="accent">{users.length} total users</CmsStatusBadge>
            <CmsStatusBadge tone="neutral">
              {users.filter((user) => user.role === "moderator").length} moderators
            </CmsStatusBadge>
          </>
        }
      />
      <UserManagementPanel users={users} />
    </div>
  );
}
