import { Card } from "@/components/ui/card";
import { HomepageEditor } from "@/components/cms/homepage-editor";
import { getCmsEntriesSnapshot } from "@/lib/content/service";

export default async function CmsHomePage() {
  const snapshot = await getCmsEntriesSnapshot();
  const publishedEntries = snapshot.entries.filter((entry) => entry.isPublished).length;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="glass-panel border-0 px-5 py-5 ring-0">
          <p className="eyebrow">Entries</p>
          <p className="mt-3 font-heading text-4xl">{snapshot.entries.length}</p>
          <p className="mt-2 text-sm text-muted-foreground">Structured destination records in the CMS.</p>
        </Card>
        <Card className="glass-panel border-0 px-5 py-5 ring-0">
          <p className="eyebrow">Published</p>
          <p className="mt-3 font-heading text-4xl">{publishedEntries}</p>
          <p className="mt-2 text-sm text-muted-foreground">Entries visible on the public site.</p>
        </Card>
        <Card className="glass-panel border-0 px-5 py-5 ring-0">
          <p className="eyebrow">Media Assets</p>
          <p className="mt-3 font-heading text-4xl">{snapshot.mediaAssets.length}</p>
          <p className="mt-2 text-sm text-muted-foreground">Library items ready for hero and card layouts.</p>
        </Card>
      </div>

      <HomepageEditor
        homepage={snapshot.homepage}
        slots={snapshot.homepageSlots}
        entries={snapshot.entries}
      />
    </div>
  );
}
