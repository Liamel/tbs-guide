import { notFound } from "next/navigation";

import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";
import { isLocale } from "@/lib/i18n";

export function generateStaticParams() {
  return [{ lang: "en" }, { lang: "ka" }, { lang: "ru" }];
}

export default async function LocaleLayout({
  children,
  params,
}: LayoutProps<"/[lang]">) {
  const { lang } = await params;

  if (!isLocale(lang)) {
    notFound();
  }

  return (
    <div className="min-h-screen">
      <SiteHeader locale={lang} />
      <main>{children}</main>
      <SiteFooter locale={lang} />
    </div>
  );
}
