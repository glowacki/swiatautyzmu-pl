import { createFileRoute } from "@tanstack/react-router";
import { CrisisBar } from "@/components/site/CrisisBar";

export const Route = createFileRoute("/pomoc-kryzysowa")({
  head: () => ({
    meta: [
      { title: "Pomoc kryzysowa — swiatautyzmu.pl" },
      {
        name: "description",
        content:
          "Bezpłatne telefony zaufania i wsparcie kryzysowe dla osób w spektrum autyzmu i ich bliskich. Dostępne 24/7.",
      },
    ],
  }),
  component: CrisisPage,
});

function CrisisPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 md:px-8 py-16">
      <header className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-widest text-crisis">
          Pomoc kryzysowa
        </p>
        <h1 className="mt-3 font-display text-4xl md:text-5xl font-semibold tracking-tight">
          Nie jesteś sam. Nie jesteś sama.
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Jeśli jesteś w meltdownie, shutdownie, kryzysie emocjonalnym albo masz myśli samobójcze —
          zadzwoń. Rozmowa jest bezpłatna i anonimowa.
        </p>
      </header>

      <div className="mt-10">
        <CrisisBar />
      </div>

      <section className="mt-16 space-y-8">
        <h2 className="font-display text-2xl font-semibold">Co jeszcze może pomóc teraz</h2>
        <ul className="space-y-4 text-foreground/90">
          <li className="rounded-2xl bg-card p-5 ring-1 ring-border">
            <strong>Wyjdź z bodźców.</strong> Jeśli możesz — znajdź ciche, ciemne miejsce. Słuchawki
            wygłuszające, ciężki koc, obniżone światło.
          </li>
          <li className="rounded-2xl bg-card p-5 ring-1 ring-border">
            <strong>Nie tłumacz się teraz.</strong> Meltdown i shutdown to reakcje układu nerwowego,
            nie „złe zachowanie”. Regeneracja przed rozmową o przyczynach.
          </li>
          <li className="rounded-2xl bg-card p-5 ring-1 ring-border">
            <strong>Poproś jedną osobę.</strong> Napisz krótko: „potrzebuję ciszy” lub „potrzebuję
            obecności bez pytań”. Krótkie, konkretne komunikaty.
          </li>
        </ul>
      </section>
    </div>
  );
}
