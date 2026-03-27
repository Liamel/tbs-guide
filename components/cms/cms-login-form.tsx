"use client";

import { startTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth/client";
import { getDictionary } from "@/lib/i18n";

export function CmsLoginForm({ disabled }: { disabled: boolean }) {
  const dict = getDictionary("en");
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);

  return (
    <Card className="glass-panel-strong border-0 p-0 ring-0">
      <form
        className="space-y-5 px-6 py-6"
        onSubmit={(event) => {
          event.preventDefault();

          startTransition(async () => {
            try {
              setPending(true);

              if (disabled) {
                throw new Error("Backend configuration is incomplete.");
              }

              const result = await authClient.signIn.username({
                username,
                password,
              });

              if (result.error) {
                throw new Error(result.error.message || "Sign-in failed.");
              }

              toast.success("Signed in.");
              router.push("/CMS/home");
              router.refresh();
            } catch (error) {
              toast.error(error instanceof Error ? error.message : "Unable to sign in.");
            } finally {
              setPending(false);
            }
          });
        }}
      >
        <div className="space-y-1">
          <p className="eyebrow">{dict.cms.title}</p>
          <h2 className="font-heading text-3xl">{dict.cms.signInTitle}</h2>
          <p className="text-sm leading-6 text-muted-foreground">
            {disabled ? dict.cms.setupRequiredDescription : dict.cms.signInDescription}
          </p>
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cms-username">{dict.cms.username}</Label>
            <Input
              id="cms-username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              disabled={pending || disabled}
              autoComplete="username"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cms-password">{dict.cms.password}</Label>
            <Input
              id="cms-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              disabled={pending || disabled}
              autoComplete="current-password"
            />
          </div>
        </div>
        <Button type="submit" className="velvet-button w-full rounded-xl" disabled={pending || disabled}>
          {pending ? "Signing in..." : dict.cms.signInTitle}
        </Button>
      </form>
    </Card>
  );
}
