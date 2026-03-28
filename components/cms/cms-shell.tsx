import Link from "next/link";
import { Keyboard, LogOut, Shield } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CmsHotkeys } from "@/components/cms/cms-hotkeys";
import { CmsShellNav } from "@/components/cms/cms-shell-nav";
import { signOutAction } from "@/app/CMS/actions";

type CmsShellProps = {
  user: {
    name: string;
    role?: string | null;
    username?: string | null;
  };
  children: React.ReactNode;
};

export function CmsShell({ user, children }: CmsShellProps) {
  const canManageUsers = user.role === "owner";

  return (
    <div className="cms-app min-h-screen">
      <div className="editorial-shell grid min-h-screen gap-5 py-5 lg:grid-cols-[292px_minmax(0,1fr)]">
        <CmsHotkeys canManageUsers={canManageUsers} />
        <aside className="cms-sidebar sticky top-5 hidden h-[calc(100vh-2.5rem)] flex-col rounded-[2rem] p-5 lg:flex">
          <div className="space-y-2">
            <Link href="/CMS/home" className="inline-flex items-center gap-3">
              <span className="inline-flex size-10 items-center justify-center rounded-2xl bg-primary/10 font-heading text-primary">
                K
              </span>
              <div>
                <div className="font-heading text-lg tracking-[0.12em] text-foreground">KARTLI CMS</div>
                <p className="text-sm text-muted-foreground">Editorial workspace for admin teams.</p>
              </div>
            </Link>
          </div>

          <div className="mt-8 space-y-3">
            <p className="cms-kicker">Navigation</p>
            <CmsShellNav canManageUsers={canManageUsers} />
          </div>

          <div className="cms-surface-subtle mt-6 rounded-[1.5rem] p-4">
            <p className="cms-kicker">Workflow</p>
            <p className="mt-2 font-heading text-xl text-foreground">Edit, review, publish.</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Entries hold the public stories, media powers every hero image, and the homepage editor manages the landing page copy.
            </p>
            <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-border/70 bg-white/80 px-3 py-1.5 text-xs font-medium text-muted-foreground">
              <Keyboard className="size-3.5" />
              <span>Press ? for shortcuts</span>
            </div>
          </div>

          <div className="cms-surface mt-auto space-y-4 rounded-[1.5rem] p-4">
            <div className="space-y-1">
              <div className="font-heading text-lg text-foreground">{user.name}</div>
              <div className="text-sm text-muted-foreground">@{user.username || "cms-user"}</div>
            </div>
            <Badge className="w-fit rounded-full bg-primary/10 text-primary">
              <Shield className="mr-1 size-3" />
              {user.role || "moderator"}
            </Badge>
            <form action={signOutAction}>
              <Button type="submit" variant="outline" className="w-full rounded-xl bg-white/90">
                <LogOut className="size-4" />
                Log out
              </Button>
            </form>
          </div>
        </aside>

        <div className="min-w-0 space-y-4 lg:space-y-6">
          <div className="cms-sidebar rounded-[1.5rem] p-4 lg:hidden">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="font-heading text-lg tracking-[0.12em] text-foreground">KARTLI CMS</div>
                <div className="text-sm text-muted-foreground">{user.role || "moderator"}</div>
              </div>
              <form action={signOutAction}>
                <Button type="submit" variant="outline" className="rounded-xl bg-white/90">
                  <LogOut className="size-4" />
                </Button>
              </form>
            </div>
            <div className="mt-4">
              <CmsShellNav canManageUsers={canManageUsers} mobile />
            </div>
          </div>

          <main className="space-y-6 pb-10">{children}</main>
        </div>
      </div>
    </div>
  );
}
