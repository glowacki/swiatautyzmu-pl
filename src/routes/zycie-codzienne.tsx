import { createFileRoute, Link } from "@tanstack/react-router";
import { Ear, Wind, HeartHandshake, BatteryLow } from "lucide-react";

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
    />
  ),
});

type Topic = { icon: React.ElementType; title: string; desc: string };

function SectionLanding({
  eyebrow,
  title,
  lead,
  topics,
}: {
  eyebrow: string;
  title: string;
  lead: string;
  topics: Topic[];
}) {
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
      <div className="mt-12">
        <Link
          to="/baza-wiedzy"
          className="inline-flex items-center gap-2 rounded-full bg-sage-deep px-6 py-3 text-sm font-semibold text-primary-foreground"
        >
          Przejdź do artykułów →
        </Link>
      </div>
    </div>
  );
}

export { SectionLanding };
