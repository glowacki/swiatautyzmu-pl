import { Link } from "@tanstack/react-router";

const COLS = [
  {
    title: "Wiedza",
    links: [
      { to: "/baza-wiedzy", label: "Baza wiedzy" },
      { to: "/zycie-codzienne", label: "Życie codzienne" },
      { to: "/etapy-zycia", label: "Etapy życia" },
      { to: "/terapie", label: "Terapie i metody" },
    ],
  },
  {
    title: "Praktyka",
    links: [
      { to: "/prawo-finanse", label: "Prawo i finanse" },
      { to: "/katalog", label: "Katalog placówek" },
      { to: "/slownik", label: "Słownik pojęć" },
      { to: "/pomoc-kryzysowa", label: "Pomoc kryzysowa" },
    ],
  },
  {
    title: "Społeczność",
    links: [
      { to: "/spolecznosc", label: "Forum i historie" },
      { to: "/auth", label: "Załóż konto" },
    ],
  },
] as const;

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border bg-sand-deep">
      <div className="mx-auto max-w-7xl px-4 md:px-8 py-16">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <span className="grid size-9 place-items-center rounded-full bg-sage-soft text-sage-deep font-bold">
                ś
              </span>
              <span className="font-display text-lg font-semibold tracking-tight text-sage-deep">
                swiatautyzmu.pl
              </span>
            </div>
            <p className="text-sm text-muted-foreground max-w-sm">
              Największy polski hub wiedzy o autyzmie i neuroróżnorodności. Tworzony we współpracy
              ze specjalistami i samą społecznością osób w spektrum. Nic o nas bez nas.
            </p>
          </div>
          {COLS.map((col) => (
            <div key={col.title}>
              <h4 className="mb-4 text-xs font-semibold uppercase tracking-widest text-sage-deep">
                {col.title}
              </h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                {col.links.map((l) => (
                  <li key={l.to}>
                    <Link to={l.to} className="hover:text-sage-deep transition-colors">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col gap-3 border-t border-border pt-8 text-xs text-muted-foreground md:flex-row md:justify-between">
          <p>© {new Date().getFullYear()} swiatautyzmu.pl — empatia, wiedza, wspólnota.</p>
          <div className="flex flex-wrap gap-6">
            <Link to="/" className="hover:text-sage-deep">
              Polityka prywatności
            </Link>
            <Link to="/" className="hover:text-sage-deep">
              Deklaracja dostępności (WCAG AAA)
            </Link>
            <Link to="/" className="hover:text-sage-deep">
              Kontakt z redakcją
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
