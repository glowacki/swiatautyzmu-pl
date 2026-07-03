import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Search } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/slownik")({
  head: () => ({
    meta: [
      { title: "Słownik pojęć o autyzmie — swiatautyzmu.pl" },
      {
        name: "description",
        content:
          "Encyklopedia pojęć związanych z autyzmem i neuroróżnorodnością: stimming, meltdown, maskowanie, wypalenie autystyczne i wiele innych.",
      },
    ],
  }),
  component: GlossaryPage,
});

function GlossaryPage() {
  const [q, setQ] = useState("");
  const terms = useQuery({
    queryKey: ["glossary"],
    queryFn: async () => {
      const { data, error } = await supabase.from("glossary_terms").select("*").order("term");
      if (error) throw error;
      return data ?? [];
    },
  });

  const filtered = (terms.data ?? []).filter((t) =>
    q.trim() === "" ? true : t.term.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <div className="mx-auto max-w-4xl px-4 md:px-8 py-16">
      <header>
        <p className="text-xs font-semibold uppercase tracking-widest text-sage">
          Encyklopedia pojęć
        </p>
        <h1 className="mt-3 font-display text-4xl md:text-5xl font-semibold tracking-tight">
          Słownik
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Proste wyjaśnienia trudnych pojęć: od stimowania po wypalenie autystyczne. Bez żargonu
          medycznego.
        </p>
      </header>

      <div className="relative mt-8 max-w-md">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"
          aria-hidden
        />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Szukaj hasła…"
          className="pl-9"
          aria-label="Wyszukaj hasło"
        />
      </div>

      {terms.isLoading ? (
        <div className="mt-12 space-y-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-2xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : (
        <dl className="mt-12 divide-y divide-border">
          {filtered.map((t) => (
            <div key={t.id} className="py-8">
              <dt className="flex flex-wrap items-baseline gap-3">
                <span className="font-display text-2xl font-semibold text-sage-deep italic">
                  {t.term}
                </span>
                {t.pronunciation && (
                  <span className="text-sm text-muted-foreground">{t.pronunciation}</span>
                )}
              </dt>
              <dd className="mt-2 text-foreground/90">
                <p className="font-medium">{t.short_definition}</p>
                {t.long_definition && (
                  <p className="mt-2 text-muted-foreground">{t.long_definition}</p>
                )}
              </dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}
