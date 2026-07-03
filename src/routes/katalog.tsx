import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { MapPin, Phone, Globe, CheckCircle2 } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";

const TYPES = [
  { key: "all", label: "Wszystkie" },
  { key: "diagnostyk", label: "Diagnostyk" },
  { key: "terapeuta", label: "Terapeuta" },
  { key: "osrodek", label: "Ośrodek" },
  { key: "szkola", label: "Szkoła" },
  { key: "wtz", label: "WTZ" },
  { key: "sds", label: "ŚDS" },
  { key: "autism_friendly", label: "Autism-friendly" },
] as const;

const VOIVODESHIPS = [
  "wszystkie",
  "dolnośląskie",
  "kujawsko-pomorskie",
  "lubelskie",
  "lubuskie",
  "łódzkie",
  "małopolskie",
  "mazowieckie",
  "opolskie",
  "podkarpackie",
  "podlaskie",
  "pomorskie",
  "śląskie",
  "świętokrzyskie",
  "warmińsko-mazurskie",
  "wielkopolskie",
  "zachodniopomorskie",
];

export const Route = createFileRoute("/katalog")({
  head: () => ({
    meta: [
      { title: "Katalog placówek i specjalistów — swiatautyzmu.pl" },
      {
        name: "description",
        content:
          "Zweryfikowana baza diagnostów, terapeutów, ośrodków, szkół, WTZ, ŚDS i miejsc autism-friendly w całej Polsce. Filtruj po województwie i typie usługi.",
      },
      { property: "og:title", content: "Katalog placówek dla osób w spektrum — cała Polska" },
      { property: "og:description", content: "Znajdź zweryfikowane wsparcie w Twojej okolicy." },
    ],
  }),
  component: CatalogPage,
});

function CatalogPage() {
  const [type, setType] = useState<string>("all");
  const [voivodeship, setVoivodeship] = useState("wszystkie");
  const [q, setQ] = useState("");

  const facilities = useQuery({
    queryKey: ["facilities", type, voivodeship],
    queryFn: async () => {
      let query = supabase.from("facilities").select("*").eq("is_verified", true).order("name");
      if (type !== "all") query = query.eq("type", type as never);
      if (voivodeship !== "wszystkie") query = query.eq("voivodeship", voivodeship);
      const { data, error } = await query;
      if (error) throw error;
      return data ?? [];
    },
  });

  const filtered = (facilities.data ?? []).filter((f) =>
    q.trim() === ""
      ? true
      : f.name.toLowerCase().includes(q.toLowerCase()) ||
        f.city.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <div className="mx-auto max-w-7xl px-4 md:px-8 py-16">
      <header className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-widest text-sage">Katalog usług</p>
        <h1 className="mt-3 font-display text-4xl md:text-5xl font-semibold tracking-tight">
          Znajdź wsparcie w swojej okolicy
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Zweryfikowana przez społeczność baza specjalistów, placówek edukacyjnych, warsztatów
          terapii zajęciowej i miejsc przyjaznych sensorycznie w całej Polsce.
        </p>
      </header>

      <div className="mt-10 grid gap-4 md:grid-cols-[1fr_auto_auto]">
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Nazwa placówki lub miasto…"
          aria-label="Szukaj po nazwie lub mieście"
        />
        <select
          className="rounded-md border border-input bg-background px-3 py-2 text-sm"
          value={voivodeship}
          onChange={(e) => setVoivodeship(e.target.value)}
          aria-label="Województwo"
        >
          {VOIVODESHIPS.map((v) => (
            <option key={v} value={v}>
              {v === "wszystkie" ? "Wszystkie województwa" : `woj. ${v}`}
            </option>
          ))}
        </select>
        <select
          className="rounded-md border border-input bg-background px-3 py-2 text-sm"
          value={type}
          onChange={(e) => setType(e.target.value)}
          aria-label="Typ placówki"
        >
          {TYPES.map((t) => (
            <option key={t.key} value={t.key}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      {facilities.isLoading ? (
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-40 rounded-3xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="mt-16 rounded-3xl border border-dashed border-border p-12 text-center text-muted-foreground">
          Brak placówek spełniających kryteria. Spróbuj poszerzyć filtry.
        </div>
      ) : (
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {filtered.map((f) => (
            <article key={f.id} className="rounded-3xl bg-card p-6 ring-1 ring-border">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-display text-xl font-semibold text-foreground">{f.name}</h2>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-sage-deep">
                    {TYPES.find((t) => t.key === f.type)?.label ?? f.type}
                  </p>
                </div>
                {f.is_verified && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-sage-soft px-2 py-1 text-xs font-semibold text-sage-deep">
                    <CheckCircle2 className="size-3.5" aria-hidden /> Zweryfikowana
                  </span>
                )}
              </div>
              {f.description && (
                <p className="mt-3 text-sm text-muted-foreground">{f.description}</p>
              )}
              <dl className="mt-4 space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <MapPin className="size-4 mt-0.5 text-sage-deep shrink-0" aria-hidden />
                  <span>
                    {f.address}, {f.city}, woj. {f.voivodeship}
                  </span>
                </div>
                {f.phone && (
                  <div className="flex items-start gap-2">
                    <Phone className="size-4 mt-0.5 text-sage-deep shrink-0" aria-hidden />
                    <a href={`tel:${f.phone.replace(/\s/g, "")}`} className="hover:underline">
                      {f.phone}
                    </a>
                  </div>
                )}
                {f.website && (
                  <div className="flex items-start gap-2">
                    <Globe className="size-4 mt-0.5 text-sage-deep shrink-0" aria-hidden />
                    <a
                      href={f.website}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="hover:underline"
                    >
                      Strona
                    </a>
                  </div>
                )}
              </dl>
              {f.services && f.services.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {f.services.map((s) => (
                    <span
                      key={s}
                      className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
