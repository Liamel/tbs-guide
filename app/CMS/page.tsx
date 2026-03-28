import { redirect } from "next/navigation";
import { FileText, ImageIcon, Languages, ShieldCheck } from "lucide-react";

import { CmsLoginForm } from "@/components/cms/cms-login-form";
import { CmsStatusBadge } from "@/components/cms/cms-ui";
import { getCmsSession, isCmsEnabled } from "@/lib/auth/session";
import { getDictionary } from "@/lib/i18n";

export default async function CmsIndexPage() {
  const session = await getCmsSession();
  const dict = getDictionary("en");

  if (session) {
    redirect("/CMS/home");
  }

  return (
    <div className="cms-app min-h-screen">
      <div className="editorial-shell grid min-h-screen items-center gap-8 py-8 lg:grid-cols-[1.08fr_0.92fr]">
        <div className="space-y-6">
          <div className="space-y-4">
            <p className="cms-kicker">{dict.cms.title}</p>
            <h1 className="max-w-2xl font-heading text-4xl leading-tight tracking-[-0.04em] text-foreground sm:text-5xl">
              A clean workspace for editors, moderators, and publishing reviews.
            </h1>
            <p className="max-w-xl text-base leading-7 text-muted-foreground">
              The CMS keeps public content organized by entry, language, and media asset so non-technical admins can update the guide without guesswork.
            </p>
            <div className="flex flex-wrap gap-2">
              <CmsStatusBadge tone="accent">Protected Access</CmsStatusBadge>
              <CmsStatusBadge tone="neutral">Keyboard Shortcuts</CmsStatusBadge>
              <CmsStatusBadge tone="neutral">English, Georgian, Russian</CmsStatusBadge>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="cms-surface rounded-[1.75rem] p-5">
              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-1 size-5 text-primary" />
                <div>
                  <p className="font-heading text-2xl text-foreground">Owner Controls</p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{dict.cms.ownerOnly}</p>
                </div>
              </div>
            </div>
            <div className="cms-surface rounded-[1.75rem] p-5">
              <div className="flex items-start gap-3">
                <FileText className="mt-1 size-5 text-primary" />
                <div>
                  <p className="font-heading text-2xl text-foreground">Moderator Workflow</p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{dict.cms.moderatorsOnly}</p>
                </div>
              </div>
            </div>
            <div className="cms-surface-subtle rounded-[1.75rem] p-5">
              <div className="flex items-start gap-3">
                <Languages className="mt-1 size-5 text-primary" />
                <div>
                  <p className="font-heading text-2xl text-foreground">Language Coverage</p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    Every entry supports English, Georgian, and Russian with a dedicated publishing workflow for each locale.
                  </p>
                </div>
              </div>
            </div>
            <div className="cms-surface-subtle rounded-[1.75rem] p-5">
              <div className="flex items-start gap-3">
                <ImageIcon className="mt-1 size-5 text-primary" />
                <div>
                  <p className="font-heading text-2xl text-foreground">Media Library</p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    Upload and reuse approved imagery for cards, hero sections, and the homepage story.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:pl-6">
          <CmsLoginForm disabled={!isCmsEnabled()} />
        </div>
      </div>
    </div>
  );
}
