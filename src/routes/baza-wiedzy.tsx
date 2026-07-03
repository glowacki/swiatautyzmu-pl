import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Clock, Search } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";

const CATEGORIES = [
  { key: "all", label: "Wszystkie" },
  { key: "baza-wiedzy", label: "Baza wiedzy" },
  { key: "zycie-codzienne", label: "Życie codzienne" },
  { key: "etapy-zycia", label: "Etapy życia" },
  { key: "prawo-finanse", label: "Prawo i finanse" },
  { key: "terapie", label: "Terapie" },
  { key: "historie", label: "Historie" },
] as const;

export const Route = createFileRoute("/baza-wiedzy")({
  head: () => ({
    meta: [
      { title: "Baza wiedzy — swiatautyzmu.pl" },
      {
        name: "description",
        content:
          "Rzetelne artykuły o autyzmie: diagnoza, komorbidność, kobiety w spektrum, dorośli, mity i fakty. Wiedza oparta na neuroróżnorodności.",
      },
      { property: "og:title", content: "Baza wiedzy o autyzmie — swiatautyzmu.pl" },
      { property: "og:description", content: "Encyklopedia neuroróżnorodności po polsku." },
    ],
  }),
  component: KnowledgePage,
});

function KnowledgePage() {
  const [category, setCategory] = useState<string>("all");
  const [q, setQ] = useState("");

  const articles = useQuery({
    queryKey: ["articles", category],
    queryFn: async () => {
      let query = supabase
        .from("articles")
        .select("id, slug, title, excerpt, category, reading_minutes, published_at")
        .eq("status", "published")
        .order("published_at", { ascending: false });
      if (category !== "all") query = query.eq("category", category as never);
      const { data, error } = await query;
      if (error) throw error;
      return data ?? [];
    },
  });

  const filtered = (articles.data ?? []).filter((a) =>
    q.trim() === ""
      ? true
      : a.title.toLowerCase().includes(q.toLowerCase()) ||
        a.excerpt?.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <div className="mx-auto max-w-7xl px-4 md:px-8 py-16">
      <header className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-widest text-sage">Encyklopedia</p>
        <h1 className="mt-3 font-display text-4xl md:text-5xl font-semibold tracking-tight">
          Baza wiedzy o autyzmie i neuroróżnorodności
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Artykuły oparte na aktualnych standardach (ICD-11, DSM-5), neurobiologii oraz paradygmacie
          neuroróżnorodności. Bez „naprawiania”, bez inspiration porn.
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

      {articles.isLoading ? (
        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-64 rounded-3xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="mt-16 rounded-3xl border border-dashed border-border p-12 text-center text-muted-foreground">
          Nie znaleziono artykułów w tej kategorii.
        </div>
      ) : (
        <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((a) => (
            <Link
              key={a.id}
              to="/artykul/$slug"
              params={{ slug: a.slug }}
              className="group flex flex-col rounded-3xl bg-card p-6 ring-1 ring-border hover:ring-sage transition-all"
            >
              <div className="mb-5 aspect-[16/10] rounded-2xl bg-sage-soft" />
              <div className="flex items-center gap-3 text-xs">
                <span className="rounded-md bg-sage-soft px-2 py-1 font-semibold uppercase tracking-wider text-sage-deep">
                  {CATEGORIES.find((c) => c.key === a.category)?.label ?? a.category}
                </span>
                <span className="inline-flex items-center gap-1 text-muted-foreground">
                  <Clock className="size-3.5" aria-hidden />
                  {a.reading_minutes} min
                </span>
              </div>
              <h2 className="mt-3 font-display text-xl font-semibold leading-snug group-hover:text-sage-deep">
                {a.title}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground line-clamp-3 flex-1">{a.excerpt}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
