"use client";

import { startTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { KeyRound, Trash2 } from "lucide-react";

import {
  createModeratorAction,
  removeCmsUserAction,
  resetCmsUserPasswordAction,
} from "@/app/CMS/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  CmsField,
  CmsSection,
  CmsStatusBadge,
  cmsControlClassName,
} from "@/components/cms/cms-ui";
import type { CmsUserRecord } from "@/lib/content/types";

export function UserManagementPanel({ users }: { users: CmsUserRecord[] }) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    username: "",
    password: "",
    email: "",
  });
  const [pending, setPending] = useState(false);
  const [resetTarget, setResetTarget] = useState<CmsUserRecord | null>(null);
  const [resetPassword, setResetPassword] = useState("");
  const [resetPending, setResetPending] = useState(false);

  return (
    <>
      <div className="space-y-6">
        <CmsSection
          eyebrow="Owner Controls"
          title="Create moderator account"
          description="Use this form when someone needs editorial access to create, edit, or publish content."
        >
          <form
            className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]"
            onSubmit={(event) => {
              event.preventDefault();

              startTransition(async () => {
                try {
                  setPending(true);
                  await createModeratorAction(form);
                  toast.success("Moderator created.");
                  setForm({
                    name: "",
                    username: "",
                    password: "",
                    email: "",
                  });
                  router.refresh();
                } catch (error) {
                  toast.error(error instanceof Error ? error.message : "Unable to create moderator.");
                } finally {
                  setPending(false);
                }
              });
            }}
          >
            <div className="cms-surface-subtle rounded-[1.5rem] p-5">
              <p className="cms-kicker">Access notes</p>
              <h3 className="mt-2 font-heading text-xl text-foreground">Before you create an account</h3>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-muted-foreground">
                <li>Usernames should stay lowercase and use letters, numbers, or underscores only.</li>
                <li>Passwords need at least eight characters.</li>
                <li>Add email when available so the account is easier to identify later.</li>
              </ul>
            </div>

            <div className="grid gap-4">
              <div className="grid gap-4 md:grid-cols-2">
                <CmsField label="Name" hint="Full name shown in the CMS.">
                  <Input
                    value={form.name}
                    onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                    className={cmsControlClassName}
                  />
                </CmsField>
                <CmsField label="Username" hint="Lowercase login name used during sign-in.">
                  <Input
                    value={form.username}
                    onChange={(event) => setForm((current) => ({ ...current, username: event.target.value }))}
                    className={cmsControlClassName}
                  />
                </CmsField>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <CmsField label="Password" hint="Temporary password for the new moderator.">
                  <Input
                    type="password"
                    value={form.password}
                    onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                    className={cmsControlClassName}
                  />
                </CmsField>
                <CmsField label="Email" hint="Optional, but useful for identifying the account later.">
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                    className={cmsControlClassName}
                  />
                </CmsField>
              </div>

              <div className="flex justify-end">
                <Button type="submit" className="cms-primary-button h-11 rounded-xl" disabled={pending}>
                  {pending ? "Creating..." : "Create Moderator"}
                </Button>
              </div>
            </div>
          </form>
        </CmsSection>

        <CmsSection
          eyebrow="Team Access"
          title="Current users"
          description="Owners can reset moderator passwords or remove moderator access at any time."
        >
          <div className="overflow-hidden rounded-[1.5rem] border border-border/70 bg-white">
            <Table className="min-w-[720px]">
              <TableHeader className="bg-muted/35">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="px-4">User</TableHead>
                  <TableHead className="px-4">Username</TableHead>
                  <TableHead className="px-4">Role</TableHead>
                  <TableHead className="px-4">Created</TableHead>
                  <TableHead className="px-4 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id} className="hover:bg-muted/25">
                    <TableCell className="px-4 py-4 align-top whitespace-normal">
                      <div className="space-y-1">
                        <p className="font-heading text-lg text-foreground">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-4 align-top">@{user.username}</TableCell>
                    <TableCell className="px-4 py-4 align-top">
                      <CmsStatusBadge tone={user.role === "owner" ? "accent" : "neutral"}>
                        {user.role}
                      </CmsStatusBadge>
                    </TableCell>
                    <TableCell className="px-4 py-4 align-top">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="px-4 py-4 text-right align-top">
                      {user.role === "owner" ? null : (
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            className="rounded-xl bg-white/90"
                            onClick={() => {
                              setResetTarget(user);
                              setResetPassword("");
                            }}
                          >
                            <KeyRound className="size-4" />
                            Reset Password
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-full text-primary"
                            onClick={() => {
                              startTransition(async () => {
                                try {
                                  await removeCmsUserAction(user.id);
                                  toast.success("Moderator removed.");
                                  router.refresh();
                                } catch (error) {
                                  toast.error(error instanceof Error ? error.message : "Unable to remove moderator.");
                                }
                              });
                            }}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CmsSection>
      </div>

      <Dialog open={Boolean(resetTarget)} onOpenChange={(open) => !open && setResetTarget(null)}>
        <DialogContent className="cms-surface max-w-md border-0 p-6">
          <DialogHeader>
            <DialogTitle>Reset moderator password</DialogTitle>
            <DialogDescription>
              {resetTarget ? `Set a new password for @${resetTarget.username}.` : "Set a new password."}
            </DialogDescription>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault();

              if (!resetTarget) {
                return;
              }

              startTransition(async () => {
                try {
                  setResetPending(true);
                  await resetCmsUserPasswordAction({
                    userId: resetTarget.id,
                    password: resetPassword,
                  });
                  toast.success("Password reset.");
                  setResetPassword("");
                  setResetTarget(null);
                } catch (error) {
                  toast.error(error instanceof Error ? error.message : "Unable to reset password.");
                } finally {
                  setResetPending(false);
                }
              });
            }}
          >
            <CmsField
              label="New Password"
              hint="Choose a new password with at least eight characters."
              htmlFor="reset-password"
            >
              <Input
                id="reset-password"
                type="password"
                value={resetPassword}
                onChange={(event) => setResetPassword(event.target.value)}
                minLength={8}
                className={cmsControlClassName}
              />
            </CmsField>
            <Button type="submit" className="cms-primary-button h-11 w-full rounded-xl" disabled={resetPending}>
              {resetPending ? "Saving..." : "Update Password"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
