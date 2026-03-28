"use client";

import { startTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  CmsField,
  CmsSection,
  cmsControlClassName,
} from "@/components/cms/cms-ui";
import { authClient } from "@/lib/auth/client";
import { getDictionary } from "@/lib/i18n";

export function CmsLoginForm({ disabled }: { disabled: boolean }) {
  const dict = getDictionary("en");
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);

  return (
    <CmsSection
      eyebrow={dict.cms.title}
      title={dict.cms.signInTitle}
      description={disabled ? dict.cms.setupRequiredDescription : dict.cms.signInDescription}
    >
      <form
        className="space-y-5"
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
        <div className="space-y-4">
          <CmsField
            label={dict.cms.username}
            hint="Use the CMS username assigned to your admin account."
            htmlFor="cms-username"
          >
            <Input
              id="cms-username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              disabled={pending || disabled}
              autoComplete="username"
              className={cmsControlClassName}
            />
          </CmsField>

          <CmsField
            label={dict.cms.password}
            hint="Passwords are case-sensitive and required on every sign-in."
            htmlFor="cms-password"
          >
            <Input
              id="cms-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              disabled={pending || disabled}
              autoComplete="current-password"
              className={cmsControlClassName}
            />
          </CmsField>
        </div>

        <Button
          type="submit"
          className="cms-primary-button h-11 w-full rounded-xl"
          disabled={pending || disabled}
        >
          {pending ? "Signing in..." : dict.cms.signInTitle}
        </Button>
      </form>
    </CmsSection>
  );
}
