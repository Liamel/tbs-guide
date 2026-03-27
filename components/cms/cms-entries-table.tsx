"use client";

import Link from "next/link";
import { startTransition, useDeferredValue, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpRight, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { EntryRecord, RegionRecord } from "@/lib/content/types";
import { pickLocaleText } from "@/lib/i18n";

export function CmsEntriesTable({
  entries,
  regions,
}: {
  entries: EntryRecord[];
  regions: RegionRecord[];
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);

  const visibleEntries = useMemo(() => {
    const search = deferredQuery.trim().toLowerCase();

    if (!search) {
      return entries;
    }

    return entries.filter((entry) => {
      const region = regions.find((candidate) => candidate.id === entry.regionId);
      const en = entry.translations.en;

      return [entry.slug, en.title, region?.name.en]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(search));
    });
  }, [deferredQuery, entries, regions]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            data-cms-search="true"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search entries by title, region, or slug"
            className="h-11 rounded-2xl pl-10"
          />
        </div>
        <Button
          className="velvet-button rounded-xl"
          onClick={() => {
            startTransition(() => router.push("/CMS/entries/new"));
          }}
        >
          New Entry
        </Button>
      </div>
      <div className="glass-panel rounded-[1.75rem] px-4 py-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Region</TableHead>
              <TableHead>Status</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {visibleEntries.map((entry) => {
              const region = regions.find((candidate) => candidate.id === entry.regionId);

              return (
                <TableRow key={entry.id}>
                  <TableCell>
                    <div>
                      <p className="font-heading text-base">{entry.translations.en.title}</p>
                      <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                        {entry.slug}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="capitalize">{entry.type}</TableCell>
                  <TableCell>{pickLocaleText(region?.name, "en")}</TableCell>
                  <TableCell>{entry.isPublished ? "Published" : "Draft"}</TableCell>
                  <TableCell>
                    <Link
                      href={`/CMS/entries/${entry.id}`}
                      className="inline-flex items-center gap-2 text-primary"
                    >
                      Edit
                      <ArrowUpRight className="size-4" />
                    </Link>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
