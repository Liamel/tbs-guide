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
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
        <Card className="glass-panel-strong border-0 p-0 ring-0">
          <form
            className="grid gap-4 px-6 py-6 lg:grid-cols-2"
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
            <div className="space-y-2">
              <p className="eyebrow">Owner Controls</p>
              <h2 className="font-heading text-3xl">Moderator access</h2>
              <p className="text-sm leading-6 text-muted-foreground">
                Only the owner can add or remove moderator accounts for the CMS.
              </p>
            </div>
            <div className="grid gap-4">
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input
                    value={form.name}
                    onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                    className="h-11 rounded-2xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Username</Label>
                  <Input
                    value={form.username}
                    onChange={(event) => setForm((current) => ({ ...current, username: event.target.value }))}
                    className="h-11 rounded-2xl"
                  />
                </div>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Password</Label>
                  <Input
                    type="password"
                    value={form.password}
                    onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                    className="h-11 rounded-2xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email (optional)</Label>
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                    className="h-11 rounded-2xl"
                  />
                </div>
              </div>
              <Button type="submit" className="velvet-button rounded-xl" disabled={pending}>
                {pending ? "Creating..." : "Create Moderator"}
              </Button>
            </div>
          </form>
        </Card>

        <Card className="glass-panel border-0 p-0 ring-0">
          <div className="px-4 py-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <p className="font-heading">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>@{user.username}</TableCell>
                    <TableCell className="capitalize">{user.role}</TableCell>
                    <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      {user.role === "owner" ? null : (
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            className="rounded-full"
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
        </Card>
      </div>

      <Dialog open={Boolean(resetTarget)} onOpenChange={(open) => !open && setResetTarget(null)}>
        <DialogContent className="glass-panel-strong max-w-md border-0">
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
            <div className="space-y-2">
              <Label htmlFor="reset-password">New Password</Label>
              <Input
                id="reset-password"
                type="password"
                value={resetPassword}
                onChange={(event) => setResetPassword(event.target.value)}
                minLength={8}
                className="h-11 rounded-2xl"
              />
            </div>
            <Button type="submit" className="velvet-button w-full rounded-xl" disabled={resetPending}>
              {resetPending ? "Saving..." : "Update Password"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
