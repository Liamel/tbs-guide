"use client";

import Link from "next/link";
import { startTransition, useDeferredValue, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpRight, Plus, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  CmsSection,
  CmsStatusBadge,
  cmsControlClassName,
} from "@/components/cms/cms-ui";
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

  const regionMap = useMemo(
    () => new Map(regions.map((region) => [region.id, region])),
    [regions],
  );

  const visibleEntries = useMemo(() => {
    const search = deferredQuery.trim().toLowerCase();

    if (!search) {
      return entries;
    }

    return entries.filter((entry) => {
      const region = regionMap.get(entry.regionId);
      const en = entry.translations.en;

      return [entry.slug, en.title, region?.name.en]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(search));
    });
  }, [deferredQuery, entries, regionMap]);

  const publishedCount = visibleEntries.filter((entry) => entry.isPublished).length;

  return (
    <CmsSection
      title="Find and open entries"
      description="Search by English title, URL slug, or region. Open an item to manage all three locales, media, highlights, and transport blocks."
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] lg:w-full lg:max-w-2xl">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              data-cms-search="true"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search entries by title, region, or slug"
              className={`${cmsControlClassName} pl-11`}
            />
          </div>
        </div>

        <Button
          className="cms-primary-button h-11 rounded-xl"
          onClick={() => {
            startTransition(() => router.push("/CMS/entries/new"));
          }}
        >
          <Plus className="size-4" />
          New Entry
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        <CmsStatusBadge tone="accent">{visibleEntries.length} shown</CmsStatusBadge>
        <CmsStatusBadge tone="success">{publishedCount} published</CmsStatusBadge>
        {query ? <CmsStatusBadge tone="neutral">Filtered search</CmsStatusBadge> : null}
      </div>

      <div className="overflow-hidden rounded-[1.5rem] border border-border/70 bg-white">
        <Table className="min-w-[760px]">
          <TableHeader className="bg-muted/35">
            <TableRow className="hover:bg-transparent">
              <TableHead className="px-4">Entry</TableHead>
              <TableHead className="px-4">Type</TableHead>
              <TableHead className="px-4">Region</TableHead>
              <TableHead className="px-4">Status</TableHead>
              <TableHead className="px-4 text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visibleEntries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="px-4 py-8 text-center text-sm text-muted-foreground">
                  No entries matched that search.
                </TableCell>
              </TableRow>
            ) : (
              visibleEntries.map((entry) => {
                const region = regionMap.get(entry.regionId);

                return (
                  <TableRow key={entry.id} className="hover:bg-muted/25">
                    <TableCell className="px-4 py-4 align-top whitespace-normal">
                      <div className="space-y-1">
                        <p className="font-heading text-lg text-foreground">{entry.translations.en.title}</p>
                        <p className="text-sm leading-6 text-muted-foreground">
                          {entry.translations.en.summary || "No English summary yet."}
                        </p>
                        <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground">
                          {entry.slug}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-4 align-top capitalize">{entry.type}</TableCell>
                    <TableCell className="px-4 py-4 align-top whitespace-normal">
                      {pickLocaleText(region?.name, "en") || "No region"}
                    </TableCell>
                    <TableCell className="px-4 py-4 align-top">
                      <div className="flex flex-wrap gap-2">
                        <CmsStatusBadge tone={entry.isPublished ? "success" : "warning"}>
                          {entry.isPublished ? "Published" : "Draft"}
                        </CmsStatusBadge>
                        {entry.isFeatured ? (
                          <CmsStatusBadge tone="accent">Featured</CmsStatusBadge>
                        ) : null}
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-4 text-right align-top">
                      <Link
                        href={`/CMS/entries/${entry.id}`}
                        className="inline-flex items-center gap-2 rounded-full border border-border/70 px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted/40"
                      >
                        Edit Entry
                        <ArrowUpRight className="size-4 text-primary" />
                      </Link>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </CmsSection>
  );
}
