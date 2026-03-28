"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ImageIcon, LayoutDashboard, Newspaper, Users } from "lucide-react";

import { cn } from "@/lib/utils";

const links = [
  { href: "/CMS/home", label: "Dashboard", icon: LayoutDashboard, ownerOnly: false },
  { href: "/CMS/entries", label: "Entries", icon: Newspaper, ownerOnly: false },
  { href: "/CMS/media", label: "Media", icon: ImageIcon, ownerOnly: false },
  { href: "/CMS/users", label: "Users", icon: Users, ownerOnly: true },
] as const;

function isActivePath(pathname: string, href: string) {
  if (href === "/CMS/home") {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function CmsShellNav({
  canManageUsers,
  mobile = false,
}: {
  canManageUsers: boolean;
  mobile?: boolean;
}) {
  const pathname = usePathname();
  const visibleLinks = links.filter((link) => !link.ownerOnly || canManageUsers);

  return (
    <nav className={cn("grid gap-2", mobile && "flex overflow-x-auto pb-1")}>
      {visibleLinks.map((link) => {
        const Icon = link.icon;
        const active = isActivePath(pathname, link.href);

        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            data-active={active}
            className={cn("cms-nav-link", mobile && "shrink-0 rounded-full px-4 py-2.5")}
          >
            <Icon className="size-4" />
            <span>{link.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
