import { redirect } from "next/navigation";

import { CmsShell } from "@/components/cms/cms-shell";
import { isCmsEnabled, requireCmsSession } from "@/lib/auth/session";

export default async function CmsPanelLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  if (!isCmsEnabled()) {
    redirect("/CMS");
  }

  const session = await requireCmsSession();

  return (
    <CmsShell
      user={{
        name: session.user.name,
        role: session.user.role,
        username: session.user.username,
      }}
    >
      {children}
    </CmsShell>
  );
}
