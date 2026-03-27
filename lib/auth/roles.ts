import { createAccessControl } from "better-auth/plugins";

export const cmsAccessControl = createAccessControl({
  user: [
    "create",
    "list",
    "set-role",
    "ban",
    "impersonate",
    "impersonate-admins",
    "delete",
    "set-password",
    "get",
    "update",
  ],
  session: ["list", "revoke", "delete"],
});

export const ownerRole = cmsAccessControl.newRole({
  user: ["create", "list", "set-role", "delete", "set-password", "get", "update"],
  session: ["list", "revoke", "delete"],
});

export const moderatorRole = cmsAccessControl.newRole({});

export const cmsRoles = {
  owner: ownerRole,
  moderator: moderatorRole,
} as const;

export type CmsRole = keyof typeof cmsRoles;

export function isOwner(role: string | null | undefined): role is "owner" {
  return role === "owner";
}
