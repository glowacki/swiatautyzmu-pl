import { createFileRoute, Link, notFound, useRouter } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { ArrowLeft, Clock, Calendar } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";

const articleQuery = (slug: string) =>
  queryOptions({
    queryKey: ["article", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("articles")
        .select(
          "id, slug, title, excerpt, content, category, reading_minutes, published_at, cover_image_url",
        )
        .eq("slug", slug)
        .eq("status", "published")
        .maybeSingle();
      if (error) throw error;
      if (!data) throw notFound();
      return data;
    },
  });

export const Route = createFileRoute("/artykul/$slug")({
  loader: ({ context, params }) => context.queryClient.ensureQueryData(articleQuery(params.slug)),
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [
          { title: "Nie znaleziono artykułu — swiatautyzmu.pl" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const desc = loaderData.excerpt ?? "Artykuł na swiatautyzmu.pl";
    return {
      meta: [
        { title: `${loaderData.title} — swiatautyzmu.pl` },
        { name: "description", content: desc },
        { property: "og:title", content: loaderData.title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "article" },
        ...(loaderData.cover_image_url
          ? [{ property: "og:image", content: loaderData.cover_image_url }]
          : []),
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: ArticlePage,
  notFoundComponent: NotFoundArticle,
  errorComponent: ArticleError,
});

function ArticlePage() {
  const { slug } = Route.useParams();
  const { data } = useSuspenseQuery(articleQuery(slug));

  const published = data.published_at
    ? new Date(data.published_at).toLocaleDateString("pl-PL", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  return (
    <article className="mx-auto max-w-3xl px-4 md:px-8 py-16">
      <Link
        to="/baza-wiedzy"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Wróć do bazy wiedzy
      </Link>

      <header className="mt-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-sage">{data.category}</p>
        <h1 className="mt-3 font-display text-4xl md:text-5xl font-semibold tracking-tight text-balance">
          {data.title}
        </h1>
        {data.excerpt && <p className="mt-4 text-lg text-muted-foreground">{data.excerpt}</p>}
        <div className="mt-6 flex flex-wrap gap-4 text-sm text-muted-foreground">
          {published && (
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="size-4" aria-hidden /> {published}
            </span>
          )}
          {data.reading_minutes && (
            <span className="inline-flex items-center gap-1.5">
              <Clock className="size-4" aria-hidden /> {data.reading_minutes} min czytania
            </span>
          )}
        </div>
      </header>

      {data.cover_image_url && (
        <div className="mt-10 aspect-video overflow-hidden rounded-3xl bg-muted">
          <img src={data.cover_image_url} alt="" className="size-full object-cover" />
        </div>
      )}

      <div
        className="prose prose-lg mt-10 max-w-none text-foreground prose-headings:font-display prose-headings:font-semibold prose-a:text-sage-deep prose-strong:text-foreground"
        // Content is authored by editors — kept as basic HTML/markdown-rendered text.
        dangerouslySetInnerHTML={{ __html: renderContent(data.content) }}
      />

      <footer className="mt-16 rounded-3xl bg-sage-soft p-6 ring-1 ring-border">
        <p className="text-sm text-muted-foreground">
          Ten artykuł ma charakter informacyjny i nie zastępuje porady specjalisty. Jeśli
          potrzebujesz wsparcia, zajrzyj do{" "}
          <Link to="/katalog" className="font-semibold text-sage-deep underline">
            katalogu placówek
          </Link>{" "}
          lub{" "}
          <Link to="/pomoc-kryzysowa" className="font-semibold text-sage-deep underline">
            pomocy kryzysowej
          </Link>
          .
        </p>
      </footer>
    </article>
  );
}

function renderContent(content: string): string {
  // Minimal safe renderer: paragraphs from double newlines, otherwise trust HTML from editors.
  if (content.trim().startsWith("<")) return content;
  return content
    .split(/\n{2,}/)
    .map((p) => `<p>${p.replace(/\n/g, "<br/>")}</p>`)
    .join("\n");
}

function NotFoundArticle() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-24 text-center">
      <h1 className="font-display text-3xl font-semibold">Nie znaleźliśmy tego artykułu</h1>
      <p className="mt-3 text-muted-foreground">
        Mógł zostać przeniesiony lub jego adres się zmienił.
      </p>
      <Link
        to="/baza-wiedzy"
        className="mt-8 inline-flex items-center gap-2 rounded-full bg-sage-deep px-6 py-3 text-sm font-semibold text-primary-foreground"
      >
        Przejdź do bazy wiedzy
      </Link>
    </div>
  );
}

function ArticleError({ reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  return (
    <div className="mx-auto max-w-2xl px-4 py-24 text-center">
      <h1 className="font-display text-3xl font-semibold">Coś poszło nie tak</h1>
      <p className="mt-3 text-muted-foreground">Nie udało się załadować artykułu.</p>
      <button
        onClick={() => {
          reset();
          router.invalidate();
        }}
        className="mt-8 inline-flex items-center gap-2 rounded-full bg-sage-deep px-6 py-3 text-sm font-semibold text-primary-foreground"
      >
        Spróbuj ponownie
      </button>
    </div>
  );
}
