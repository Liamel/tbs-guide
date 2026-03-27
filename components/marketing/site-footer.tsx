import Link from "next/link";

import { getDictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";

export function SiteFooter({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);

  return (
    <footer className="surface-break mt-16">
      <div className="editorial-shell flex flex-col gap-6 px-4 py-10 text-sm text-muted-foreground md:flex-row md:items-end md:justify-between">
        <div className="space-y-2">
          <div className="font-heading text-sm font-bold tracking-[0.16em] text-primary">KARTLI</div>
          <p>{dict.footer.description}</p>
        </div>
        <div className="flex flex-wrap gap-5 uppercase tracking-[0.18em] text-[0.68rem]">
          <Link href="#">{dict.footer.privacy}</Link>
          <Link href="#">{dict.footer.terms}</Link>
          <Link href="#">{dict.footer.contact}</Link>
          <Link href="#">{dict.footer.sustainability}</Link>
        </div>
      </div>
    </footer>
  );
}
