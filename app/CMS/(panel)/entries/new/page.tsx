import { CmsEntryEditor } from "@/components/cms/cms-entry-editor";
import { getCmsEntriesSnapshot } from "@/lib/content/service";

export default async function CmsNewEntryPage() {
  const snapshot = await getCmsEntriesSnapshot();

  return (
    <CmsEntryEditor
      regions={snapshot.regions}
      categories={snapshot.categories}
      mediaAssets={snapshot.mediaAssets}
    />
  );
}
