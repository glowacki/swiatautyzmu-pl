import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Ear, Wind, HeartHandshake, BatteryLow, Clock } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";

const TOPICS = [
  {
    icon: Ear,
    title: "Integracja sensoryczna (SI)",
    desc: "Przestymulowanie, hipowrażliwość i tworzenie środowisk niskobodźcowych.",
  },
  {
    icon: Wind,
    title: "Meltdown, shutdown, stimming",
    desc: "Zrozumieć reakcje układu nerwowego zamiast je tłumić.",
  },
  {
    icon: HeartHandshake,
    title: "Komunikacja i AAC",
    desc: "Alternatywne metody komunikacji, jasny język, unikanie metafor.",
  },
  {
    icon: BatteryLow,
    title: "Wypalenie autystyczne",
    desc: "Maskowanie, teoria łyżek, planowanie regeneracji.",
  },
];

type PublicArticle = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  category: string;
  published_at: string | null;
  reading_minutes: number | null;
  href?: string;
};

type CmsIndexItem = {
  url?: string;
  title?: string;
  summary?: string;
  date_modified?: string;
  published_at?: string;
  category?: string;
  source?: string;
};

export const Route = createFileRoute("/zycie-codzienne")({
  head: () => ({
    meta: [
      { title: "Życie codzienne w spektrum — swiatautyzmu.pl" },
      {
        name: "description",
        content:
          "Praktyczne wskazówki: integracja sensoryczna, komunikacja, meltdown, stimming, wypalenie autystyczne. Bez terapii naprawczych.",
      },
    ],
  }),
  component: () => (
    <SectionLanding
      eyebrow="Praktyka"
      title="Życie codzienne — praca z układem nerwowym, nie przeciwko niemu"
      lead="Wszystko, co pomaga funkcjonować bez maskowania: sensoryka, komunikacja, regulacja emocji, energia."
      topics={TOPICS}
      categoryKey="zycie-codzienne"
    />
  ),
});

type Topic = { icon: React.ElementType; title: string; desc: string };

function SectionLanding({
  eyebrow,
  title,
  lead,
  topics,
  categoryKey,
}: {
  eyebrow: string;
  title: string;
  lead: string;
  topics: Topic[];
  categoryKey: string;
}) {
  const articles = useQuery({
    queryKey: ["section-articles", categoryKey],
    queryFn: async () => {
      const [legacy, cms] = await Promise.all([
        supabase
          .from("articles")
          .select("id, slug, title, excerpt, category, reading_minutes, published_at")
          .eq("status", "published")
          .eq("category", categoryKey as never)
          .order("published_at", { ascending: false })
          .limit(12),
        fetch("/content-index.json", {
          headers: { Accept: "application/json" },
          cache: "no-store",
        }).catch(() => null),
      ]);

      const items: PublicArticle[] = [];

      if (!legacy.error) {
        for (const article of legacy.data ?? []) {
          items.push({
            id: String(article.id),
            slug: article.slug,
            title: article.title,
            excerpt: article.excerpt,
            category: article.category,
            reading_minutes: article.reading_minutes,
            published_at: article.published_at,
          });
        }
      }

      if (cms?.ok) {
        const payload = (await cms.json()) as { urls?: CmsIndexItem[] };
        for (const item of payload.urls ?? []) {
          if (item?.source !== "editorial-cms" || !item.url || !item.title) continue;
          if ((item.category ?? "baza-wiedzy") !== categoryKey) continue;
          const slug = item.url.split("/").filter(Boolean).pop() ?? item.url;
          items.push({
            id: `cms:${item.url}`,
            slug,
            title: item.title,
            excerpt: item.summary ?? null,
            category: item.category ?? categoryKey,
            reading_minutes: null,
            published_at: item.published_at ?? item.date_modified ?? null,
            href: item.url,
          });
        }
      }

      const seen = new Set<string>();
      return items
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
        })
        .slice(0, 6);
    },
  });

  return (
    <div className="mx-auto max-w-6xl px-4 md:px-8 py-16">
      <header className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-widest text-sage">{eyebrow}</p>
        <h1 className="mt-3 font-display text-4xl md:text-5xl font-semibold tracking-tight">
          {title}
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">{lead}</p>
      </header>

      <div className="mt-12 grid gap-6 md:grid-cols-2">
        {topics.map((t) => {
          const Icon = t.icon;
          return (
            <article key={t.title} className="rounded-3xl bg-card p-6 ring-1 ring-border">
              <div className="mb-4 grid size-12 place-items-center rounded-2xl bg-sage-soft text-sage-deep">
                <Icon className="size-6" aria-hidden />
              </div>
              <h2 className="font-display text-xl font-semibold">{t.title}</h2>
              <p className="mt-2 text-muted-foreground">{t.desc}</p>
            </article>
          );
        })}
      </div>

      <section className="mt-16" aria-labelledby={`${categoryKey}-articles`}>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-sage">Publikacje</p>
            <h2 id={`${categoryKey}-articles`} className="mt-2 font-display text-3xl font-semibold tracking-tight">
              Najnowsze artykuły w tym dziale
            </h2>
          </div>
          <Link
            to="/baza-wiedzy"
            className="text-sm font-semibold text-sage-deep hover:underline underline-offset-4"
          >
            Cała baza wiedzy →
          </Link>
        </div>

        {articles.isLoading ? (
          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-56 rounded-3xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : (articles.data?.length ?? 0) > 0 ? (
          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {articles.data?.map((article) => {
              const card = (
                <>
                  <span className="text-xs font-semibold uppercase tracking-wider text-sage-deep">
                    {eyebrow}
                  </span>
                  <h3 className="mt-3 font-display text-xl font-semibold leading-snug group-hover:text-sage-deep">
                    {article.title}
                  </h3>
                  <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{article.excerpt}</p>
                  {article.reading_minutes ? (
                    <span className="mt-5 inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="size-3.5" aria-hidden />
                      {article.reading_minutes} min
                    </span>
                  ) : null}
                </>
              );

              return article.href ? (
                <a
                  key={article.id}
                  href={article.href}
                  className="group flex min-h-56 flex-col rounded-3xl bg-card p-6 ring-1 ring-border transition-all hover:ring-sage"
                >
                  {card}
                </a>
              ) : (
                <Link
                  key={article.id}
                  to="/artykul/$slug"
                  params={{ slug: article.slug }}
                  className="group flex min-h-56 flex-col rounded-3xl bg-card p-6 ring-1 ring-border transition-all hover:ring-sage"
                >
                  {card}
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="mt-8 rounded-3xl border border-dashed border-border p-8 text-muted-foreground">
            W tym dziale nie ma jeszcze opublikowanych artykułów. Nowe publikacje pojawią się tutaj automatycznie.
          </div>
        )}
      </section>
    </div>
  );
}

export { SectionLanding };
