"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Globe2, Landmark, Menu, Shield } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { getDictionary, isLocale, localeLabels } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";

const navOrder = [
  { href: "", key: "destinations" },
  { href: "/heritage", key: "heritage" },
  { href: "/vineyards", key: "vineyards" },
  { href: "/experiences", key: "experiences" },
] as const;

function getLocalizedPath(pathname: string, locale: Locale) {
  const segments = pathname.split("/");

  if (isLocale(segments[1] || "")) {
    segments[1] = locale;
    return segments.join("/") || `/${locale}`;
  }

  return `/${locale}${pathname === "/" ? "" : pathname}`;
}

export function SiteHeader({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  const pathname = usePathname() || `/${locale}`;
  const planTripHref = "mailto:hello@kartli.guide?subject=Plan%20a%20Trip%20in%20Georgia";

  return (
    <header className="sticky top-0 z-40 px-3 pt-3 sm:px-6 sm:pt-6">
      <div className="editorial-shell">
        <div className="glass-panel tonal-ring flex items-center justify-between gap-4 rounded-2xl px-4 py-3">
          <div className="flex items-center gap-6">
            <Link href={`/${locale}`} className="font-heading text-sm font-bold tracking-[0.16em] text-primary">
              KARTLI
            </Link>
            <nav className="hidden items-center gap-5 text-sm text-muted-foreground md:flex">
              {navOrder.map((item) => {
                const href = `/${locale}${item.href}`;
                const active = href === `/${locale}` ? pathname === href : pathname.startsWith(href);
                return (
                  <Link
                    key={item.key}
                    href={href}
                    className={active ? "text-primary" : "hover:text-foreground"}
                  >
                    {dict.nav[item.key]}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="hidden items-center gap-2 md:flex">
            <div className="glass-panel-strong flex items-center gap-1 rounded-full px-2 py-1 text-xs text-muted-foreground">
              <Globe2 className="size-3.5" />
              {Object.entries(localeLabels).map(([key, label]) => (
                <Link
                  key={key}
                  href={getLocalizedPath(pathname, key as Locale)}
                  className={key === locale ? "rounded-full bg-white px-2 py-1 text-foreground" : "px-2 py-1 hover:text-foreground"}
                >
                  {label}
                </Link>
              ))}
            </div>
            <Button render={<a href={planTripHref} />} className="velvet-button rounded-xl px-4 text-sm">
              {dict.cta.planTrip}
            </Button>
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <Sheet>
              <SheetTrigger
                render={
                  <Button variant="ghost" size="icon" className="rounded-full" />
                }
              >
                <Menu className="size-4" />
              </SheetTrigger>
              <SheetContent className="glass-panel-strong border-0 sm:max-w-md">
                <SheetHeader>
                  <SheetTitle className="font-heading tracking-[0.12em] text-primary">
                    KARTLI
                  </SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-6 px-4 pb-6">
                  {navOrder.map((item) => (
                    <Link
                      key={item.key}
                      href={`/${locale}${item.href}`}
                      className="font-heading text-2xl"
                    >
                      {dict.nav[item.key]}
                    </Link>
                  ))}
                  <div className="grid grid-cols-3 gap-2">
                    {Object.entries(localeLabels).map(([key, label]) => (
                      <Link
                        key={key}
                        href={getLocalizedPath(pathname, key as Locale)}
                        className="glass-panel rounded-xl px-3 py-2 text-center text-sm"
                      >
                        {label}
                      </Link>
                    ))}
                  </div>
                  <Button render={<a href={planTripHref} />} className="velvet-button rounded-xl">
                    {dict.cta.planTrip}
                  </Button>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Landmark className="size-4" />
                    Georgia’s editorial tourism guide
                  </div>
                  <Link href="/CMS" className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                    <Shield className="size-4" />
                    {dict.nav.cms}
                  </Link>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
