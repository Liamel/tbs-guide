import { notFound } from "next/navigation";

import { CmsEntryEditor } from "@/components/cms/cms-entry-editor";
import { getCmsEntriesSnapshot } from "@/lib/content/service";

export default async function CmsEntryDetailPage({
  params,
}: PageProps<"/CMS/entries/[id]">) {
  const { id } = await params;
  const snapshot = await getCmsEntriesSnapshot();
  const entry = snapshot.entries.find((candidate) => candidate.id === id);

  if (!entry) {
    notFound();
  }

  return (
    <CmsEntryEditor
      entry={entry}
      regions={snapshot.regions}
      categories={snapshot.categories}
      mediaAssets={snapshot.mediaAssets}
    />
  );
}
