import { redirect } from "next/navigation";

import { Card } from "@/components/ui/card";
import { CmsLoginForm } from "@/components/cms/cms-login-form";
import { getCmsSession, isCmsEnabled } from "@/lib/auth/session";
import { getDictionary } from "@/lib/i18n";

export default async function CmsIndexPage() {
  const session = await getCmsSession();
  const dict = getDictionary("en");

  if (session) {
    redirect("/CMS/home");
  }

  return (
    <div className="editorial-shell grid min-h-screen items-center py-10 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="space-y-5">
        <p className="eyebrow">{dict.cms.title}</p>
        <h1 className="section-title max-w-xl">{dict.cms.subtitle}</h1>
        <p className="max-w-lg text-base leading-7 text-muted-foreground">
          The CMS is guarded, keyboard-driven, and designed for editorial moderation across English, Georgian, and Russian.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Card className="glass-panel border-0 px-5 py-5 ring-0">
            <p className="font-heading text-2xl">Owner</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{dict.cms.ownerOnly}</p>
          </Card>
          <Card className="glass-panel border-0 px-5 py-5 ring-0">
            <p className="font-heading text-2xl">Moderators</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{dict.cms.moderatorsOnly}</p>
          </Card>
        </div>
      </div>
      <div className="lg:pl-10">
        <CmsLoginForm disabled={!isCmsEnabled()} />
      </div>
    </div>
  );
}
