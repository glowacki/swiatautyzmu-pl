import { Phone, Heart } from "lucide-react";

const NUMBERS = [
  { label: "Telefon zaufania dla dorosłych", number: "116 123", note: "codziennie 14:00–22:00" },
  { label: "Telefon zaufania dla dzieci i młodzieży", number: "116 111", note: "24/7, bezpłatnie" },
  {
    label: "Centrum Wsparcia dla osób w kryzysie",
    number: "800 70 2222",
    note: "24/7, bezpłatnie",
  },
];

export function CrisisBar({ variant = "banner" }: { variant?: "banner" | "compact" }) {
  if (variant === "compact") {
    return (
      <a
        href="/pomoc-kryzysowa"
        className="inline-flex items-center gap-2 rounded-full bg-crisis px-4 py-2 text-sm font-semibold text-crisis-foreground shadow-sm transition-transform hover:scale-[1.02] focus-visible:outline-crisis"
      >
        <Heart className="size-4" aria-hidden />
        Pomoc kryzysowa
      </a>
    );
  }

  return (
    <section
      aria-labelledby="crisis-heading"
      className="rounded-3xl bg-accent/60 p-6 md:p-10 ring-1 ring-accent-foreground/10"
    >
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="max-w-xl">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-background/70 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-accent-foreground">
            <Heart className="size-3.5" aria-hidden /> Pomoc kryzysowa
          </div>
          <h2
            id="crisis-heading"
            className="text-2xl md:text-3xl font-semibold text-accent-foreground"
          >
            Potrzebujesz natychmiastowego wsparcia?
          </h2>
          <p className="mt-2 text-accent-foreground/80">
            Jeśli Ty lub bliska osoba jesteście w kryzysie, meltdownie lub myślach samobójczych —
            zadzwoń. Rozmowa jest bezpłatna i anonimowa.
          </p>
        </div>
        <ul className="grid gap-3 min-w-fit">
          {NUMBERS.map((n) => (
            <li key={n.number}>
              <a
                href={`tel:${n.number.replace(/\s/g, "")}`}
                className="flex items-center gap-4 rounded-2xl bg-background px-5 py-3 ring-1 ring-border transition-colors hover:bg-sage-soft/60"
              >
                <Phone className="size-5 shrink-0 text-crisis" aria-hidden />
                <div>
                  <div className="text-lg font-bold text-crisis">{n.number}</div>
                  <div className="text-xs text-muted-foreground">
                    {n.label} · {n.note}
                  </div>
                </div>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
