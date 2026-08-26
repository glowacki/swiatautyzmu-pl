import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { BookOpen, Clock, Search } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { CmsArticleView } from "./baza-wiedzy.$slug";

const CATEGORIES = [
  { key: "all", label: "Wszystkie" },
  { key: "baza-wiedzy", label: "Baza wiedzy" },
  { key: "zycie-codzienne", label: "Życie codzienne" },
  { key: "etapy-zycia", label: "Etapy życia" },
  { key: "prawo-finanse", label: "Prawo i finanse" },
  { key: "terapie", label: "Terapie" },
  { key: "historie", label: "Historie" },
] as const;

type ArticleCard = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  category: string;
  reading_minutes: number | null;
  published_at: string | null;
  href?: string;
  cover_image?: string | null;
};

type CmsIndexItem = {
  url?: string;
  title?: string;
  summary?: string;
  date_modified?: string;
  published_at?: string;
  category?: string;
  cover_image?: string | null;
  source?: string;
};

export const Route = createFileRoute("/baza-wiedzy")({
  head: () => ({
    meta: [
      { title: "Baza wiedzy — swiatautyzmu.pl" },
      {
        name: "description",
        content:
          "Rzetelne artykuły o autyzmie: diagnoza, współwystępowanie, kobiety w spektrum, dorośli, mity i fakty. Wiedza oparta na neuroróżnorodności.",
      },
      { property: "og:title", content: "Baza wiedzy o autyzmie — swiatautyzmu.pl" },
      { property: "og:description", content: "Encyklopedia neuroróżnorodności po polsku." },
    ],
  }),
  component: KnowledgePage,
});

function KnowledgePage() {
  if (typeof window !== "undefined") {
    const match = window.location.pathname.match(/^\/baza-wiedzy\/([a-z0-9-]+)\/?$/);
    const post = window.__CMS_POST__;
    if (match && post && post.slug === match[1]) {
      return <CmsArticleView post={post} />;
    }
  }

  return <KnowledgeIndexPage />;
}

function KnowledgeIndexPage() {
  const [category, setCategory] = useState<string>("all");
  const [q, setQ] = useState("");

  const legacyArticles = useQuery({
    queryKey: ["articles", "supabase"],
    retry: false,
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("articles")
        .select("id, slug, title, excerpt, category, reading_minutes, published_at")
        .eq("status", "published")
        .order("published_at", { ascending: false });
      if (error) throw error;
      return (data ?? []).map(
        (a): ArticleCard => ({
          id: String(a.id),
          slug: a.slug,
          title: a.title,
          excerpt: a.excerpt,
          category: a.category,
          reading_minutes: a.reading_minutes,
          published_at: a.published_at,
        }),
      );
    },
  });

  const cmsArticles = useQuery({
    queryKey: ["articles", "cloudflare-cms"],
    retry: 1,
    staleTime: 60 * 1000,
    queryFn: async () => {
      const response = await fetch("/content-index.json", {
        headers: { Accept: "application/json" },
        cache: "no-store",
      });
      if (!response.ok) return [] as ArticleCard[];

      const payload = (await response.json()) as { urls?: CmsIndexItem[] };
      return (payload.urls ?? [])
        .filter((item) => item?.source === "editorial-cms" && item.url && item.title)
        .map((item): ArticleCard => {
          const href = item.url as string;
          const slug = href.split("/").filter(Boolean).pop() ?? href;
          return {
            id: `cms:${href}`,
            slug,
            title: item.title as string,
            excerpt: item.summary ?? null,
            category: item.category ?? "baza-wiedzy",
            reading_minutes: null,
            published_at: item.published_at ?? item.date_modified ?? null,
            href,
            cover_image: item.cover_image ?? null,
          };
        });
    },
  });

  const allArticles = useMemo(() => {
    const seen = new Set<string>();
    return [...(cmsArticles.data ?? []), ...(legacyArticles.data ?? [])]
      .filter((article) => {
        const key = `${article.slug}:${article.title}`.toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .sort((a, b) => {
        const aDate = a.published_at ? new Date(a.published_at).getTime() : 0;
        const bDate = b.published_at ? new Date(b.published_at).getTime() : 0;
        return bDate - aDate;
      });
  }, [cmsArticles.data, legacyArticles.data]);

  const filtered = allArticles.filter((a) => {
    if (category !== "all" && a.category !== category) return false;
    if (q.trim() === "") return true;
    const needle = q.toLowerCase();
    return a.title.toLowerCase().includes(needle) || a.excerpt?.toLowerCase().includes(needle);
  });

  // Cloudflare CMS jest źródłem głównym. Stare Supabase nie może blokować widoku.
  const isLoading = cmsArticles.isLoading && !legacyArticles.data;

  return (
    <div className="mx-auto max-w-7xl px-4 md:px-8 py-16">
      <header className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-widest text-sage">Encyklopedia</p>
        <h1 className="mt-3 font-display text-4xl md:text-5xl font-semibold tracking-tight">
          Baza wiedzy o autyzmie i neuroróżnorodności
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Rzetelna wiedza o spektrum autyzmu, codziennym funkcjonowaniu, relacjach, pracy,
          diagnozie i wsparciu. Artykuły redakcyjne i materiały eksperckie w jednym miejscu.
        </p>
      </header>

      <div className="mt-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative max-w-md w-full">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"
            aria-hidden
          />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Szukaj w bazie wiedzy…"
            className="pl-9"
            aria-label="Wyszukaj w bazie wiedzy"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c.key}
              onClick={() => setCategory(c.key)}
              aria-pressed={category === c.key}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                category === c.key
                  ? "bg-sage-deep text-primary-foreground"
                  : "bg-muted text-foreground hover:bg-sage-soft"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3" aria-live="polite">
          {[0, 1, 2].map((i) => (
            <div key={i} className="rounded-3xl bg-card p-6 ring-1 ring-border">
              <div className="h-32 rounded-2xl bg-muted animate-pulse" />
              <div className="mt-5 h-4 w-24 rounded bg-muted animate-pulse" />
              <div className="mt-4 h-6 w-5/6 rounded bg-muted animate-pulse" />
              <div className="mt-3 h-4 w-full rounded bg-muted animate-pulse" />
              <div className="mt-2 h-4 w-3/4 rounded bg-muted animate-pulse" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="mt-16 rounded-3xl border border-dashed border-border p-12 text-center text-muted-foreground">
          Nie znaleziono artykułów w tej kategorii.
        </div>
      ) : (
        <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((a) => {
            const content = <ArticleCardContent article={a} />;
            return a.href ? (
              <a
                key={a.id}
                href={a.href}
                className="group flex flex-col rounded-3xl bg-card p-6 ring-1 ring-border hover:ring-sage transition-all"
              >
                {content}
              </a>
            ) : (
              <Link
                key={a.id}
                to="/artykul/$slug"
                params={{ slug: a.slug }}
                className="group flex flex-col rounded-3xl bg-card p-6 ring-1 ring-border hover:ring-sage transition-all"
              >
                {content}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ArticleCardContent({ article }: { article: ArticleCard }) {
  const categoryLabel = CATEGORIES.find((c) => c.key === article.category)?.label ?? article.category;

  return (
    <>
      {article.cover_image ? (
        <div className="mb-5 aspect-[16/10] overflow-hidden rounded-2xl bg-sage-soft">
          <img
            src={article.cover_image}
            alt=""
            className="h-full w-full object-cover"
            loading="lazy"
          />
        </div>
      ) : (
        <div className="mb-5 flex min-h-36 items-center justify-center rounded-2xl bg-sage-soft px-6 text-center text-sage-deep">
          <div>
            <BookOpen className="mx-auto size-7" aria-hidden />
            <p className="mt-3 text-xs font-semibold uppercase tracking-widest">Artykuł redakcyjny</p>
          </div>
        </div>
      )}
      <div className="flex items-center gap-3 text-xs">
        <span className="rounded-md bg-sage-soft px-2 py-1 font-semibold uppercase tracking-wider text-sage-deep">
          {categoryLabel}
        </span>
        {article.reading_minutes ? (
          <span className="inline-flex items-center gap-1 text-muted-foreground">
            <Clock className="size-3.5" aria-hidden />
            {article.reading_minutes} min
          </span>
        ) : null}
      </div>
      <h2 className="mt-3 font-display text-xl font-semibold leading-snug group-hover:text-sage-deep">
        {article.title}
      </h2>
      {article.excerpt ? (
        <p className="mt-2 text-sm text-muted-foreground line-clamp-3 flex-1">{article.excerpt}</p>
      ) : null}
    </>
  );
}
