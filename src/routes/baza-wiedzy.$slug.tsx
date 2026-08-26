import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Calendar, UserRound } from "lucide-react";
import type { ReactNode } from "react";

type Source = { name: string; url: string };
type FaqItem = { q: string; a: string };

type CmsPost = {
  slug: string;
  title: string;
  excerpt?: string | null;
  body_markdown?: string | null;
  category?: string | null;
  published_at?: string | null;
  updated_at?: string | null;
  cover_image?: string | null;
  cover_alt?: string | null;
  author?: string | null;
  author_url?: string | null;
  author_job_title?: string | null;
  reviewer_name?: string | null;
  reviewer_url?: string | null;
  reviewer_job_title?: string | null;
  reviewed_at?: string | null;
  sources_json?: string | Source[] | null;
  faq_json?: string | FaqItem[] | null;
};

declare global {
  interface Window {
    __CMS_POST__?: CmsPost;
  }
}

export const Route = createFileRoute("/baza-wiedzy/$slug")({
  component: CmsArticlePage,
});

function CmsArticlePage() {
  const { slug } = Route.useParams();
  const post = typeof window !== "undefined" ? window.__CMS_POST__ : undefined;

  if (!post || post.slug !== slug) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <h1 className="font-display text-3xl font-semibold">Ładowanie artykułu…</h1>
        <p className="mt-3 text-muted-foreground">
          Jeśli treść nie pojawi się po chwili, odśwież stronę.
        </p>
        <Link
          to="/baza-wiedzy"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-sage-deep px-6 py-3 text-sm font-semibold text-primary-foreground"
        >
          Wróć do bazy wiedzy
        </Link>
      </div>
    );
  }

  const published = formatDate(post.published_at);
  const reviewed = formatDate(post.reviewed_at);
  const sources = parseArray<Source>(post.sources_json);
  const faq = parseArray<FaqItem>(post.faq_json);

  return (
    <article className="mx-auto max-w-4xl px-4 md:px-8 py-12 md:py-16">
      <Link
        to="/baza-wiedzy"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Wróć do bazy wiedzy
      </Link>

      <header className="mx-auto mt-8 max-w-3xl">
        {post.category ? (
          <p className="text-xs font-semibold uppercase tracking-widest text-sage-deep">
            {categoryLabel(post.category)}
          </p>
        ) : null}
        <h1 className="mt-3 font-display text-4xl md:text-5xl font-semibold tracking-tight leading-tight text-balance">
          {post.title}
        </h1>
        {post.excerpt ? (
          <p className="mt-5 text-lg leading-relaxed text-muted-foreground">{post.excerpt}</p>
        ) : null}
        <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
          {published ? (
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="size-4" aria-hidden />
              {published}
            </span>
          ) : null}
          {post.author ? (
            <span className="inline-flex items-center gap-1.5">
              <UserRound className="size-4" aria-hidden />
              {post.author}
            </span>
          ) : null}
        </div>
      </header>

      {post.cover_image ? (
        <div className="mx-auto mt-10 max-w-3xl overflow-hidden rounded-3xl bg-muted ring-1 ring-border">
          <img
            src={post.cover_image}
            alt={post.cover_alt || post.title}
            className="max-h-[560px] w-full object-cover"
          />
        </div>
      ) : null}

      <div className="mx-auto mt-10 max-w-3xl text-[1.05rem] leading-8 text-foreground">
        {renderMarkdown(post.body_markdown || "")}
      </div>

      {post.author ? (
        <section className="mx-auto mt-14 max-w-3xl rounded-3xl bg-card p-6 ring-1 ring-border">
          <h2 className="font-display text-xl font-semibold">Autor</h2>
          <p className="mt-2">
            <strong>{post.author}</strong>
            {post.author_job_title ? `, ${post.author_job_title}` : ""}
          </p>
          {post.author_url ? (
            <a
              href={post.author_url}
              className="mt-2 inline-block text-sm font-semibold text-sage-deep underline underline-offset-4"
            >
              Profil autora
            </a>
          ) : null}
        </section>
      ) : null}

      {post.reviewer_name || reviewed ? (
        <section className="mx-auto mt-6 max-w-3xl rounded-3xl bg-card p-6 ring-1 ring-border">
          <h2 className="font-display text-xl font-semibold">Weryfikacja merytoryczna</h2>
          {post.reviewer_name ? (
            <p className="mt-2">
              <strong>{post.reviewer_name}</strong>
              {post.reviewer_job_title ? `, ${post.reviewer_job_title}` : ""}
            </p>
          ) : null}
          {reviewed ? <p className="mt-2 text-sm text-muted-foreground">Ostatni przegląd: {reviewed}</p> : null}
          {post.reviewer_url ? (
            <a
              href={post.reviewer_url}
              className="mt-2 inline-block text-sm font-semibold text-sage-deep underline underline-offset-4"
            >
              Profil recenzenta
            </a>
          ) : null}
        </section>
      ) : null}

      {faq.length ? (
        <section className="mx-auto mt-10 max-w-3xl">
          <h2 className="font-display text-2xl font-semibold">Najczęstsze pytania</h2>
          <div className="mt-4 divide-y divide-border rounded-3xl bg-card px-6 ring-1 ring-border">
            {faq.map((item) => (
              <details key={item.q} className="py-5">
                <summary className="cursor-pointer font-semibold">{item.q}</summary>
                <p className="mt-3 leading-7 text-muted-foreground">{item.a}</p>
              </details>
            ))}
          </div>
        </section>
      ) : null}

      {sources.length ? (
        <section className="mx-auto mt-10 max-w-3xl">
          <h2 className="font-display text-2xl font-semibold">Źródła</h2>
          <ol className="mt-4 space-y-3 pl-5 text-sm text-muted-foreground list-decimal">
            {sources.map((source) => (
              <li key={`${source.name}-${source.url}`}>
                <a
                  href={source.url}
                  rel="noopener noreferrer"
                  className="text-sage-deep underline underline-offset-4"
                >
                  {source.name}
                </a>
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      <footer className="mx-auto mt-14 max-w-3xl rounded-3xl bg-sage-soft p-6 ring-1 ring-border">
        <p className="text-sm text-muted-foreground">
          Materiał ma charakter edukacyjny i nie zastępuje indywidualnej diagnozy ani konsultacji ze specjalistą.
        </p>
      </footer>
    </article>
  );
}

function renderMarkdown(markdown: string): ReactNode[] {
  const blocks = markdown.replace(/\r/g, "").split(/\n{2,}/).map((x) => x.trim()).filter(Boolean);
  return blocks.map((block, index) => {
    if (block.startsWith("### ")) {
      return (
        <h3 key={index} className="mt-10 mb-3 font-display text-xl font-semibold leading-tight">
          {block.slice(4)}
        </h3>
      );
    }
    if (block.startsWith("## ")) {
      return (
        <h2 key={index} className="mt-12 mb-4 font-display text-2xl md:text-3xl font-semibold leading-tight">
          {block.slice(3)}
        </h2>
      );
    }
    return (
      <p key={index} className="mb-6 whitespace-pre-line">
        {block}
      </p>
    );
  });
}

function parseArray<T>(value: string | T[] | null | undefined): T[] {
  if (Array.isArray(value)) return value;
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function formatDate(value?: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value.slice(0, 10);
  return date.toLocaleDateString("pl-PL", { year: "numeric", month: "long", day: "numeric" });
}

function categoryLabel(category: string) {
  const map: Record<string, string> = {
    "baza-wiedzy": "Baza wiedzy",
    "zycie-codzienne": "Życie codzienne",
    "etapy-zycia": "Etapy życia",
    "prawo-finanse": "Prawo i finanse",
    terapie: "Terapie",
    historie: "Historie",
  };
  return map[category] ?? category;
}
