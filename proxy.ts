import { match } from "@formatjs/intl-localematcher";
import { getSessionCookie } from "better-auth/cookies";
import Negotiator from "negotiator";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { defaultLocale, locales } from "@/lib/i18n";

function getLocale(request: NextRequest) {
  const negotiatorHeaders = {
    "accept-language": request.headers.get("accept-language") || defaultLocale,
  };
  const languages = new Negotiator({ headers: negotiatorHeaders }).languages();
  return match(languages, locales, defaultLocale);
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/CMS") && pathname !== "/CMS") {
    const hasSession = Boolean(getSessionCookie(request, { cookiePrefix: "kartli-guide" }));

    if (!hasSession) {
      return NextResponse.redirect(new URL("/CMS", request.url));
    }
  }

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/CMS") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const hasLocale = locales.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
  );

  if (!hasLocale) {
    const locale = pathname === "/" ? defaultLocale : getLocale(request);
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}${pathname}`;
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
