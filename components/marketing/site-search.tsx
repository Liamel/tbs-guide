"use client";

import { startTransition, useDeferredValue, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Loader2, Search, Sparkles } from "lucide-react";

import type { Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type SearchResult = {
  id: string;
  slug: string;
  section: string;
  title: string;
  summary: string;
  eyebrow: string;
  imageUrl: string;
  imageAlt: string;
  regionName: string;
};

const searchCopy: Record<
  Locale,
  {
    placeholder: string;
    results: string;
    minChars: string;
    empty: string;
  }
> = {
  en: {
    placeholder: "Search monasteries, vineyards, workshops...",
    results: "Quick Results",
    minChars: "Type at least 2 characters to search the guide.",
    empty: "No places matched that search.",
  },
  ka: {
    placeholder: "მოძებნე მონასტრები, ვენახები, ვორქშოფები...",
    results: "სწრაფი შედეგები",
    minChars: "ძიებისთვის შეიყვანე მინიმუმ 2 სიმბოლო.",
    empty: "ამ ძიებას შედეგი არ აქვს.",
  },
  ru: {
    placeholder: "Ищите монастыри, виноградники, мастерские...",
    results: "Быстрые результаты",
    minChars: "Введите минимум 2 символа для поиска.",
    empty: "По этому запросу ничего не найдено.",
  },
};

export function SiteSearch({
  locale,
  className,
}: {
  locale: Locale;
  className?: string;
}) {
  const copy = searchCopy[locale];
  const rootRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  useEffect(() => {
    const trimmedQuery = deferredQuery.trim();

    if (trimmedQuery.length < 2) {
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/search?lang=${locale}&q=${encodeURIComponent(trimmedQuery)}`,
          {
            signal: controller.signal,
            cache: "no-store",
          },
        );
        const payload = (await response.json()) as { results?: SearchResult[] };

        startTransition(() => {
          setResults(payload.results ?? []);
        });
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        startTransition(() => {
          setResults([]);
        });
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }, 260);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [deferredQuery, locale]);

  const showPanel = open && (query.trim().length > 0 || loading);

  return (
    <div ref={rootRef} className={cn("relative w-full", className)}>
      <div className="glass-panel-strong flex h-11 items-center gap-3 rounded-full border border-white/30 px-4 shadow-[0_14px_32px_rgba(43,52,55,0.1)]">
        <Search className="size-4 text-muted-foreground" />
        <input
          value={query}
          onChange={(event) => {
            const nextQuery = event.target.value;
            setQuery(nextQuery);
            setOpen(true);

            if (nextQuery.trim().length < 2) {
              setLoading(false);
              setResults([]);
            }
          }}
          onFocus={() => setOpen(true)}
          placeholder={copy.placeholder}
          className="h-full w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground/90"
        />
        {loading ? <Loader2 className="size-4 animate-spin text-muted-foreground" /> : null}
      </div>

      {showPanel ? (
        <div className="bg-white absolute left-0 right-0 top-[calc(100%+0.6rem)] z-50 overflow-hidden rounded-[1.5rem] border border-white/40 p-2 shadow-[0_30px_80px_rgba(43,52,55,0.14)]">
          <div className="flex items-center gap-2 px-3 py-2 text-[0.68rem] font-semibold tracking-[0.22em] uppercase text-primary">
            <Sparkles className="size-3.5" />
            {copy.results}
          </div>

          {query.trim().length < 2 ? (
            <div className="px-3 py-4 text-sm text-muted-foreground">{copy.minChars}</div>
          ) : null}

          {query.trim().length >= 2 && !loading && results.length === 0 ? (
            <div className="px-3 py-4 text-sm text-muted-foreground">{copy.empty}</div>
          ) : null}

          {results.length > 0 ? (
            <div className="max-h-[26rem] space-y-1 overflow-y-auto">
              {results.map((result) => (
                <Link
                  key={result.id}
                  href={`/${locale}/${result.section}/${result.slug}`}
                  className="group flex items-center gap-3 rounded-[1.2rem] px-3 py-3 hover:bg-muted"
                  onClick={() => {
                    setOpen(false);
                    setQuery("");
                  }}
                >
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-[1rem]">
                    <Image
                      src={result.imageUrl}
                      alt={result.imageAlt}
                      fill
                      className="object-cover transition duration-500 group-hover:scale-[1.04]"
                      sizes="64px"
                    />
                  </div>
                  <div className="min-w-0 space-y-1">
                    <p className="truncate text-[0.68rem] font-semibold tracking-[0.18em] uppercase text-primary">
                      {result.eyebrow}
                    </p>
                    <p className="truncate font-heading text-lg leading-tight text-foreground">
                      {result.title}
                    </p>
                    <p className="line-clamp-2 text-sm leading-5 text-muted-foreground">
                      {result.summary}
                    </p>
                    <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                      {result.regionName}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
