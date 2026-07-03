import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Calculator, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/kalkulator")({
  head: () => ({
    meta: [
      { title: "Kalkulator uprawnień — swiatautyzmu.pl" },
      {
        name: "description",
        content:
          "Sprawdź, jakie świadczenia, zasiłki i dofinansowania mogą Ci przysługiwać w Polsce jako osobie w spektrum autyzmu lub jej opiekunowi.",
      },
      { property: "og:title", content: "Kalkulator uprawnień dla osób w spektrum" },
      {
        property: "og:description",
        content: "Świadczenie wspierające, renta socjalna, PFRON, orzeczenia — w kilku pytaniach.",
      },
    ],
  }),
  component: CalculatorPage,
});

type AgeGroup = "child" | "teen" | "adult" | "senior";
type Degree = "none" | "light" | "moderate" | "severe";
type Employment = "none" | "employed" | "student" | "protected";

type Answers = {
  age: AgeGroup | "";
  degree: Degree | "";
  employment: Employment | "";
  hasDiagnosis: boolean;
  hasOrzeczenie: boolean;
  requiresCare: boolean;
};

type Benefit = {
  title: string;
  who: string;
  note: string;
  href?: string;
};

function computeBenefits(a: Answers): Benefit[] {
  const out: Benefit[] = [];

  if (!a.hasDiagnosis) {
    out.push({
      title: "Diagnoza specjalistyczna",
      who: "Warunek wstępny",
      note: "Bez formalnej diagnozy większość świadczeń jest niedostępna. Umów wizytę w poradni zdrowia psychicznego (NFZ) lub prywatnie.",
    });
  }

  if (a.hasDiagnosis && !a.hasOrzeczenie) {
    out.push({
      title: "Orzeczenie o niepełnosprawności",
      who:
        a.age === "child" || a.age === "teen"
          ? "Zespół ds. Orzekania o Niepełnosprawności (do 16 r.ż. bez stopnia)"
          : "Powiatowy Zespół ds. Orzekania o Niepełnosprawności",
      note: "Klucz do większości świadczeń, ulg i dofinansowań. Wniosek składasz w PCPR lub MOPS.",
    });
  }

  if (a.hasOrzeczenie && (a.age === "child" || a.age === "teen")) {
    out.push({
      title: "Zasiłek pielęgnacyjny (215,84 zł/mies.)",
      who: "Dziecko z orzeczeniem o niepełnosprawności",
      note: "Przysługuje bez względu na dochód, składasz w MOPS/GOPS.",
    });
    if (a.requiresCare) {
      out.push({
        title: "Świadczenie pielęgnacyjne dla opiekuna",
        who: "Rodzic/opiekun rezygnujący z pracy dla dziecka z niepełnosprawnością",
        note: "Od 2024 r. można łączyć z pracą zarobkową. Kwota waloryzowana rocznie.",
      });
    }
  }

  if (a.hasOrzeczenie && (a.age === "adult" || a.age === "senior")) {
    out.push({
      title: "Świadczenie wspierające",
      who: "Osoby dorosłe z decyzją WZON o poziomie potrzeby wsparcia (70–100 pkt)",
      note: "Nowe świadczenie (od 2024). Wysokość zależy od punktacji. Wniosek: WZON + ZUS.",
    });
    if (a.degree === "moderate" || a.degree === "severe") {
      out.push({
        title: "Renta socjalna",
        who: "Osoby, u których niepełnosprawność powstała przed 18. r.ż. lub w trakcie nauki",
        note: "Wniosek składasz w ZUS. Można łączyć z pracą do określonych progów.",
      });
    }
  }

  if (a.hasOrzeczenie && a.employment === "employed") {
    out.push({
      title: "Racjonalne usprawnienia w pracy",
      who: "Pracownicy z orzeczeniem",
      note: "Pracodawca ma obowiązek dostosować stanowisko (oświetlenie, słuchawki wygłuszające, elastyczne godziny). Koszty może pokryć PFRON.",
    });
    out.push({
      title: "Dodatkowy urlop i krótszy czas pracy",
      who: "Stopień umiarkowany lub znaczny",
      note: "10 dni dodatkowego urlopu rocznie, skrócony wymiar czasu pracy do 7 h/dobę.",
    });
  }

  if (a.hasOrzeczenie && a.employment === "none" && (a.age === "adult" || a.age === "senior")) {
    out.push({
      title: "Wsparcie PFRON w podjęciu pracy",
      who: "Osoby z orzeczeniem szukające zatrudnienia",
      note: "Dofinansowanie do wynagrodzenia dla pracodawcy oraz szkolenia, staże, doradztwo zawodowe.",
    });
  }

  if (a.hasOrzeczenie) {
    out.push({
      title: 'Program „Aktywny Samorząd" (PFRON)',
      who: "Osoby z orzeczeniem, w tym uczące się",
      note: "Dofinansowanie do sprzętu komputerowego, protez słuchowych, kursów prawa jazdy, opłat za studia.",
    });
    out.push({
      title: "Karta parkingowa i ulgi komunikacyjne",
      who: "Osoby z orzeczeniem znacznie lub umiarkowanie ograniczoną zdolnością samodzielnego poruszania się",
      note: "Kartę parkingową wydaje przewodniczący zespołu ds. orzekania. Ulgi PKP/PKS zależą od stopnia.",
    });
  }

  if (a.hasDiagnosis && (a.age === "child" || a.age === "teen")) {
    out.push({
      title: "Orzeczenie o potrzebie kształcenia specjalnego",
      who: "Uczniowie z autyzmem",
      note: "Wydaje poradnia psychologiczno-pedagogiczna. Otwiera dostęp do WOPFU, IPET, nauczyciela wspomagającego.",
    });
  }

  return out;
}

function CalculatorPage() {
  const [answers, setAnswers] = useState<Answers>({
    age: "",
    degree: "",
    employment: "",
    hasDiagnosis: false,
    hasOrzeczenie: false,
    requiresCare: false,
  });

  const [submitted, setSubmitted] = useState(false);
  const benefits = useMemo(() => computeBenefits(answers), [answers]);
  const canSubmit = answers.age && answers.employment;

  return (
    <div className="mx-auto max-w-4xl px-4 md:px-8 py-16">
      <header className="max-w-2xl">
        <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-sage">
          <Calculator className="size-4" aria-hidden /> Narzędzie
        </p>
        <h1 className="mt-3 font-display text-4xl md:text-5xl font-semibold tracking-tight">
          Kalkulator uprawnień
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Odpowiedz na kilka pytań — pokażemy listę świadczeń, zasiłków i dofinansowań, które mogą
          Ci przysługiwać w polskim systemie. To wskazówka, nie porada prawna.
        </p>
      </header>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          setSubmitted(true);
        }}
        className="mt-10 space-y-6 rounded-3xl bg-card p-6 md:p-8 ring-1 ring-border"
      >
        <Field label="W jakim wieku jest osoba, której dotyczą pytania?">
          <Select
            value={answers.age}
            onChange={(v) => setAnswers({ ...answers, age: v as AgeGroup })}
            options={[
              { v: "child", l: "Dziecko (0–12 lat)" },
              { v: "teen", l: "Nastolatek (13–17 lat)" },
              { v: "adult", l: "Osoba dorosła (18–64)" },
              { v: "senior", l: "Osoba w wieku 65+" },
            ]}
          />
        </Field>

        <Field label="Stopień niepełnosprawności (jeśli znany)">
          <Select
            value={answers.degree}
            onChange={(v) => setAnswers({ ...answers, degree: v as Degree })}
            options={[
              { v: "none", l: "Brak / nie wiem" },
              { v: "light", l: "Lekki" },
              { v: "moderate", l: "Umiarkowany" },
              { v: "severe", l: "Znaczny" },
            ]}
          />
        </Field>

        <Field label="Status zatrudnienia / nauki">
          <Select
            value={answers.employment}
            onChange={(v) => setAnswers({ ...answers, employment: v as Employment })}
            options={[
              { v: "none", l: "Nie pracuję i nie uczę się" },
              { v: "employed", l: "Pracuję" },
              { v: "student", l: "Uczę się / studiuję" },
              { v: "protected", l: "Zakład pracy chronionej" },
            ]}
          />
        </Field>

        <div className="grid gap-3 pt-2">
          <Checkbox
            checked={answers.hasDiagnosis}
            onChange={(v) => setAnswers({ ...answers, hasDiagnosis: v })}
            label="Mam formalną diagnozę zaburzeń ze spektrum autyzmu"
          />
          <Checkbox
            checked={answers.hasOrzeczenie}
            onChange={(v) => setAnswers({ ...answers, hasOrzeczenie: v })}
            label="Mam ważne orzeczenie o niepełnosprawności"
          />
          <Checkbox
            checked={answers.requiresCare}
            onChange={(v) => setAnswers({ ...answers, requiresCare: v })}
            label="Wymagam stałej opieki innej osoby"
          />
        </div>

        <button
          type="submit"
          disabled={!canSubmit}
          className="mt-4 inline-flex items-center gap-2 rounded-full bg-sage-deep px-6 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50"
        >
          Pokaż listę uprawnień
        </button>
      </form>

      {submitted && (
        <section className="mt-12" aria-live="polite">
          <h2 className="font-display text-2xl font-semibold">Twoje potencjalne uprawnienia</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {benefits.length} pozycji dopasowanych do odpowiedzi. Kliknij w tytuł, aby dowiedzieć
            się więcej.
          </p>
          <ul className="mt-6 grid gap-4">
            {benefits.map((b) => (
              <li key={b.title} className="rounded-2xl bg-card p-5 ring-1 ring-border">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-sage" aria-hidden />
                  <div>
                    <h3 className="font-semibold">{b.title}</h3>
                    <p className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">
                      {b.who}
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">{b.note}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-8 rounded-2xl bg-sage-soft p-5 ring-1 ring-border text-sm">
            Pełny przewodnik z wnioskami do pobrania znajdziesz w sekcji{" "}
            <Link to="/prawo-finanse" className="font-semibold text-sage-deep underline">
              Prawo i finanse
            </Link>
            .
          </div>
        </section>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm font-medium">{label}</span>
      <div className="mt-2">{children}</div>
    </label>
  );
}

function Select<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T | "";
  onChange: (v: string) => void;
  options: { v: T; l: string }[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage-deep"
    >
      <option value="">— wybierz —</option>
      {options.map((o) => (
        <option key={o.v} value={o.v}>
          {o.l}
        </option>
      ))}
    </select>
  );
}

function Checkbox({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <label className="flex items-start gap-3 text-sm cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 size-4 rounded border-input text-sage-deep focus-visible:ring-2 focus-visible:ring-sage-deep"
      />
      <span>{label}</span>
    </label>
  );
}
