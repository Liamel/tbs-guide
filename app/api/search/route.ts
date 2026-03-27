import { NextResponse } from "next/server";

import { searchEntries } from "@/lib/content/service";
import { defaultLocale, isLocale } from "@/lib/i18n";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim() ?? "";
  const localeParam = searchParams.get("lang") ?? "";
  const locale = isLocale(localeParam) ? localeParam : defaultLocale;

  if (query.length < 2) {
    return NextResponse.json({ results: [] });
  }

  const results = await searchEntries(locale, query);
  return NextResponse.json({ results });
}
