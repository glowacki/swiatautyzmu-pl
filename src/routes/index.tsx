import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  BookOpen,
  HeartHandshake,
  GraduationCap,
  MapPin,
  Clock,
  Sparkles,
} from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { CrisisBar } from "@/components/site/CrisisBar";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "swiatautyzmu.pl — wiedza, wsparcie i akceptacja neuroróżnorodności" },
      {
        name: "description",
        content:
          "Największy polski hub wiedzy o autyzmie. Wybierz swoją ścieżkę: dla osób w spektrum, ich bliskich lub profesjonalistów. Katalog placówek, forum i pomoc kryzysowa.",
      },
    ],
  }),
  component: HomePage,
});

const PERSONAS = [
  {
    key: "in_spectrum",
    icon: Sparkles,
    title: "Jestem w spektrum",
    lead: "Samopoznanie, samorzecznictwo i codzienne strategie od osób, które są tam, gdzie Ty.",
    cta: "Odkryj zasoby",
    to: "/baza-wiedzy",
    tone: "outline",
    chip: "chip-rose",
  },
  {
    key: "close_one",
    icon: HeartHandshake,
    title: "Szukam pomocy dla bliskiego",
    lead: "Pierwsze kroki po diagnozie, terapie oparte na szacunku, orzecznictwo i wsparcie.",
    cta: "Znajdź wsparcie",
    to: "/etapy-zycia",
    tone: "primary",
    chip: "chip-white",
  },
  {
    key: "professional",
    icon: GraduationCap,
    title: "Pracuję z neuroróżnorodnością",
    lead: "Materiały dla nauczycieli, terapeutów, lekarzy i pracodawców. Bez „naprawiania”.",
    cta: "Dla profesjonalistów",
    to: "/terapie",
    tone: "outline",
    chip: "chip-sky",
  },
] as const;

const FEATURED_GUIDES = [
  {
    to: "/baza-wiedzy",
    category: "Baza wiedzy",
    reading_minutes: 8,
    title: "Czym jest autyzm i dlaczego mówimy o spektrum?",
    excerpt: "Krótko o ICD-11, DSM-5, poziomach wsparcia i paradygmacie neuroróżnorodności.",
  },
  {
    to: "/zycie-codzienne",
    category: "Praktyka",
    reading_minutes: 7,
    title: "Meltdown, shutdown i stimming — jak reagować bez przemocy",
    excerpt: "Praktyczne strategie obniżania przeciążenia sensorycznego i wspierania regulacji.",
  },
  {
    to: "/prawo-finanse",
    category: "Prawo",
    reading_minutes: 10,
    title: "Orzeczenie, WOPFU, IPET i świadczenia — pierwsza mapa systemu",
    excerpt: "Najważniejsze kroki dla rodzica, osoby dorosłej i specjalisty pracującego z ASD.",
  },
] as const;

const FALLBACK_WORD = {
  term: "meltdown",
  pronunciation: "ang. przeciążeniowe załamanie regulacji",
  short_definition:
    "Intensywna reakcja układu nerwowego na przeciążenie. To nie jest manipulacja ani „złe zachowanie”.",
  long_definition:
    "Meltdown to stan przeciążenia, w którym osoba może krzyczeć, płakać, uciekać, zastygać albo tracić możliwość komunikacji. Najważniejsze są: ograniczenie bodźców, bezpieczeństwo i brak zawstydzania.",
};

const FALLBACK_FACILITIES = [
  {
    id: "catalog-info-1",
    name: "Katalog diagnostów i terapeutów",
    type: "diagnostyk",
    city: "cała Polska",
    voivodeship: "online",
    description: "Moduł gotowy do zasilenia zweryfikowanymi wpisami.",
  },
  {
    id: "catalog-info-2",
    name: "Miejsca autism-friendly",
    type: "autism_friendly",
    city: "cała Polska",
    voivodeship: "różne",
    description: "Docelowo: restauracje, kliniki, sklepy i instytucje z niskobodźcową obsługą.",
  },
] as const;

function HomePage() {
  const articles = useQuery({
    queryKey: ["home", "articles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("articles")
        .select("id, slug, title, excerpt, category, reading_minutes, published_at")
        .eq("status", "published")
        .order("published_at", { ascending: false })
        .limit(3);
      if (error) throw error;
      return data ?? [];
    },
  });

  const word = useQuery({
    queryKey: ["home", "word-of-day"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("glossary_terms")
        .select("term, slug, pronunciation, short_definition, long_definition")
        .limit(20);
      if (error) throw error;
      if (!data || data.length === 0) return null;
      const day = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
      return data[day % data.length];
    },
  });

  const facilities = useQuery({
    queryKey: ["home", "facilities"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("facilities")
        .select("id, name, type, city, voivodeship, description")
        .eq("is_verified", true)
        .limit(4);
      if (error) throw error;
      return data ?? [];
    },
  });

  const hasArticles = (articles.data?.length ?? 0) > 0;
  const wordOfDay = word.data ?? FALLBACK_WORD;
  const visibleFacilities = facilities.data?.length ? facilities.data : FALLBACK_FACILITIES;

  return (
    <div>
      {/* HERO */}
      <section className="mx-auto max-w-7xl px-4 md:px-8 pt-12 md:pt-20 pb-12">
        <div className="max-w-3xl">
          <p className="mb-5 inline-flex items-center gap-2">
            <span className="eyebrow">Portal wiedzy o neuroróżnorodności</span>
          </p>
          <h1 className="font-display text-4xl md:text-6xl font-semibold tracking-tight leading-[1.05]">
            Wiedza, wsparcie i&nbsp;akceptacja — <span className="ink-underline">wspólnie</span>.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
            Największy polski hub o autyzmie. Rzetelne informacje oparte na paradygmacie
            neuroróżnorodności, katalog zweryfikowanych specjalistów, forum społeczności i pełna
            dostępność WCAG AAA. Wybierz swoją ścieżkę.
          </p>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {PERSONAS.map((p) => {
            const Icon = p.icon;
            const primary = p.tone === "primary";
            return (
              <Link
                key={p.key}
                to={p.to}
                className={`group flex flex-col rounded-3xl p-8 ring-1 transition-all hover:-translate-y-0.5 ${
                  primary
                    ? "bg-sage-deep text-primary-foreground ring-sage-deep hover:bg-sage-deep/95"
                    : "bg-card text-card-foreground ring-border hover:ring-sage"
                }`}
              >
                <div
                  className={`mb-8 grid size-14 place-items-center rounded-[18px] ${
                    primary ? "bg-primary-foreground/15 text-primary-foreground" : p.chip
                  }`}
                >
                  <Icon className="size-6" aria-hidden />
                </div>
                <h2 className="font-display text-2xl font-semibold leading-tight">{p.title}</h2>
                <p
                  className={`mt-3 flex-1 ${primary ? "text-primary-foreground/80" : "text-muted-foreground"}`}
                >
                  {p.lead}
                </p>
                <span className="mt-8 inline-flex items-center gap-2 text-sm font-semibold">
                  {p.cta}
                  <ArrowRight
                    className="size-4 transition-transform group-hover:translate-x-1"
                    aria-hidden
                  />
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* CRISIS */}
      <section className="mx-auto max-w-7xl px-4 md:px-8">
        <CrisisBar />
      </section>

      {/* ARTICLES */}
      <section className="mx-auto max-w-7xl px-4 md:px-8 py-24" aria-labelledby="articles-heading">
        <div className="mb-12 flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="eyebrow" data-brush="sky">
              Baza wiedzy
            </span>
            <h2
              id="articles-heading"
              className="mt-2 font-display text-3xl md:text-4xl font-semibold tracking-tight"
            >
              Najnowsze publikacje
            </h2>
          </div>
          <Link
            to="/baza-wiedzy"
            className="text-sm font-semibold text-sage-deep hover:underline underline-offset-4"
          >
            Wszystkie artykuły →
          </Link>
        </div>

        {articles.isLoading ? (
          <div className="grid gap-8 md:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-72 rounded-3xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : hasArticles ? (
          <div className="grid gap-8 md:grid-cols-3">
            {articles.data?.map((a) => (
              <Link
                key={a.id}
                to="/artykul/$slug"
                params={{ slug: a.slug }}
                className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage-deep rounded-2xl"
              >
                <div className="mb-5 aspect-[16/10] rounded-2xl bg-sage-soft ring-1 ring-border" />
                <div className="flex items-center gap-3 text-xs">
                  <span className="rounded-md bg-sage-soft px-2 py-1 font-semibold uppercase tracking-wider text-sage-deep">
                    {categoryLabel(a.category)}
                  </span>
                  <span className="inline-flex items-center gap-1 text-muted-foreground">
                    <Clock className="size-3.5" aria-hidden />
                    {a.reading_minutes} min
                  </span>
                </div>
                <h3 className="mt-3 font-display text-xl font-semibold leading-snug group-hover:text-sage-deep transition-colors">
                  {a.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground line-clamp-3">{a.excerpt}</p>
              </Link>
            ))}
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-3">
            {FEATURED_GUIDES.map((a) => (
              <Link
                key={a.title}
                to={a.to}
                className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage-deep rounded-2xl"
              >
                <div className="mb-5 aspect-[16/10] rounded-2xl bg-sage-soft ring-1 ring-border" />
                <div className="flex items-center gap-3 text-xs">
                  <span className="rounded-md bg-sage-soft px-2 py-1 font-semibold uppercase tracking-wider text-sage-deep">
                    {a.category}
                  </span>
                  <span className="inline-flex items-center gap-1 text-muted-foreground">
                    <Clock className="size-3.5" aria-hidden />
                    {a.reading_minutes} min
                  </span>
                </div>
                <h3 className="mt-3 font-display text-xl font-semibold leading-snug group-hover:text-sage-deep transition-colors">
                  {a.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground line-clamp-3">{a.excerpt}</p>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* WORD OF DAY + CATALOG TEASER */}
      <section className="bg-sand-deep">
        <div className="mx-auto max-w-7xl px-4 md:px-8 py-24 grid gap-12 lg:grid-cols-2 items-start">
          {wordOfDay && (
            <div className="rounded-3xl bg-card p-10 ring-1 ring-border shadow-sm">
              <span className="eyebrow" data-brush="mint">
                Słowo dnia
              </span>
              <h3 className="mt-4 font-display text-4xl font-semibold italic tracking-tight text-sage-deep">
                {wordOfDay.term}
              </h3>
              {wordOfDay.pronunciation && (
                <p className="mt-1 text-sm text-muted-foreground">{wordOfDay.pronunciation}</p>
              )}
              <p className="mt-6 text-lg leading-relaxed text-foreground/85">
                {wordOfDay.long_definition || wordOfDay.short_definition}
              </p>
              <Link
                to="/slownik"
                className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-sage-deep hover:gap-3 transition-all"
              >
                Odkryj pełny słownik pojęć <ArrowRight className="size-4" aria-hidden />
              </Link>
            </div>
          )}

          <div>
            <span className="eyebrow">Katalog usług</span>
            <h2 className="mt-2 font-display text-3xl md:text-4xl font-semibold tracking-tight">
              Znajdź wsparcie blisko Ciebie
            </h2>
            <p className="mt-4 text-muted-foreground max-w-md">
              Zweryfikowani diagności, terapeuci, ośrodki, szkoły i miejsca autism-friendly w całej
              Polsce.
            </p>

            <ul className="mt-8 space-y-3">
              {visibleFacilities.map((f) => (
                <li
                  key={f.id}
                  className="flex items-start gap-3 rounded-2xl bg-card p-4 ring-1 ring-border"
                >
                  <div className="grid size-9 place-items-center rounded-full bg-sage-soft text-sage-deep">
                    <MapPin className="size-4" aria-hidden />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">{f.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {typeLabel(f.type)} · {f.city}, woj. {f.voivodeship}
                    </p>
                  </div>
                </li>
              ))}
            </ul>

            <Link
              to="/katalog"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-sage-deep px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-sage-deep/90"
            >
              Otwórz pełny katalog <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
        </div>
      </section>

      {/* COMMUNITY */}
      <section className="mx-auto max-w-7xl px-4 md:px-8 py-24">
        <p className="text-center">
          <span className="eyebrow" data-brush="rose">
            Głosy społeczności
          </span>
        </p>
        <div className="mt-12 grid gap-12 md:grid-cols-2">
          <blockquote className="border-l-2 border-sage pl-6">
            <p className="font-display text-2xl leading-snug text-foreground">
              „Zrozumienie własnej neuroatypowości było jak odnalezienie instrukcji obsługi do samej
              siebie po trzydziestu latach życia w chaosie.”
            </p>
            <cite className="mt-4 block not-italic text-sm text-muted-foreground">
              — Anna, zdiagnozowana w wieku 32 lat
            </cite>
          </blockquote>
          <blockquote className="border-l-2 border-sage pl-6">
            <p className="font-display text-2xl leading-snug text-foreground">
              „Nie potrzebujemy naprawy. Potrzebujemy świata, który nie rani nas swoją głośnością i
              brakiem zrozumienia.”
            </p>
            <cite className="mt-4 block not-italic text-sm text-muted-foreground">
              — Marek, samorzecznik autystyczny
            </cite>
          </blockquote>
        </div>
        <div className="mt-12 text-center">
          <Link
            to="/spolecznosc"
            className="inline-flex items-center gap-2 rounded-full border border-sage-deep px-6 py-3 text-sm font-semibold text-sage-deep hover:bg-sage-soft"
          >
            Dołącz do forum społeczności <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
      </section>
    </div>
  );
}

function categoryLabel(c: string) {
  const map: Record<string, string> = {
    "baza-wiedzy": "Baza wiedzy",
    "zycie-codzienne": "Życie codzienne",
    "etapy-zycia": "Etapy życia",
    "prawo-finanse": "Prawo i finanse",
    terapie: "Terapie",
    historie: "Historie",
  };
  return map[c] ?? c;
}

function typeLabel(t: string) {
  const map: Record<string, string> = {
    diagnostyk: "Diagnostyk",
    terapeuta: "Terapeuta",
    osrodek: "Ośrodek",
    szkola: "Szkoła",
    wtz: "WTZ",
    sds: "ŚDS",
    autism_friendly: "Autism-friendly",
  };
  return map[t] ?? t;
}
