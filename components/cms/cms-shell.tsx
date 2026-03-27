import Link from "next/link";
import { ImageIcon, LayoutDashboard, LogOut, Newspaper, Shield, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CmsHotkeys } from "@/components/cms/cms-hotkeys";
import { signOutAction } from "@/app/CMS/actions";

type CmsShellProps = {
  user: {
    name: string;
    role?: string | null;
    username?: string | null;
  };
  children: React.ReactNode;
};

const links = [
  { href: "/CMS/home", label: "Dashboard", icon: LayoutDashboard, ownerOnly: false },
  { href: "/CMS/entries", label: "Entries", icon: Newspaper, ownerOnly: false },
  { href: "/CMS/media", label: "Media", icon: ImageIcon, ownerOnly: false },
  { href: "/CMS/users", label: "Users", icon: Users, ownerOnly: true },
] as const;

export function CmsShell({ user, children }: CmsShellProps) {
  const canManageUsers = user.role === "owner";
  const visibleLinks = links.filter((link) => !link.ownerOnly || canManageUsers);

  return (
    <div className="editorial-shell grid min-h-screen gap-6 py-6 lg:grid-cols-[280px_1fr]">
      <CmsHotkeys canManageUsers={canManageUsers} />
      <aside className="glass-panel sticky top-6 hidden h-[calc(100vh-3rem)] flex-col rounded-[2rem] p-5 lg:flex">
        <div className="space-y-1">
          <div className="font-heading text-lg font-bold tracking-[0.12em] text-primary">KARTLI CMS</div>
          <p className="text-sm text-muted-foreground">Guarded editorial tools for the Georgia guide.</p>
        </div>
        <nav className="mt-8 grid gap-2">
          {visibleLinks.map((link) => {
            const Icon = link.icon;

            return (
              <Link
                key={link.href}
                href={link.href}
                className="glass-panel-strong flex items-center gap-3 rounded-2xl px-4 py-3 text-sm text-foreground hover:text-primary"
              >
                <Icon className="size-4" />
                {link.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto space-y-4 rounded-[1.5rem] bg-white/70 p-4">
          <div className="space-y-1">
            <div className="font-heading text-lg">{user.name}</div>
            <div className="text-sm text-muted-foreground">@{user.username || "cms-user"}</div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="rounded-full bg-primary/12 text-primary">
              <Shield className="mr-1 size-3" />
              {user.role || "moderator"}
            </Badge>
          </div>
          <form action={signOutAction}>
            <Button type="submit" variant="outline" className="w-full rounded-xl">
              <LogOut className="size-4" />
              Log out
            </Button>
          </form>
        </div>
      </aside>
      <div className="space-y-6">
        <div className="glass-panel flex items-center justify-between rounded-[1.75rem] px-5 py-4 lg:hidden">
          <div>
            <div className="font-heading text-lg text-primary">KARTLI CMS</div>
            <div className="text-sm text-muted-foreground">{user.role || "moderator"}</div>
          </div>
          <form action={signOutAction}>
            <Button type="submit" variant="outline" className="rounded-xl">
              <LogOut className="size-4" />
            </Button>
          </form>
        </div>
        <nav className="flex gap-2 overflow-x-auto pb-1 lg:hidden">
          {visibleLinks.map((link) => {
            const Icon = link.icon;

            return (
              <Link
                key={link.href}
                href={link.href}
                className="glass-panel inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm text-foreground"
              >
                <Icon className="size-4 text-primary" />
                {link.label}
              </Link>
            );
          })}
        </nav>
        {children}
      </div>
    </div>
  );
}
