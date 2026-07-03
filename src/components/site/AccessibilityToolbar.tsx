import { Type, Sparkles, EyeOff, Eye } from "lucide-react";
import { useAccessibility, type FontScale } from "@/lib/accessibility-store";

const SCALES: { value: FontScale; label: string }[] = [
  { value: 90, label: "A−" },
  { value: 100, label: "A" },
  { value: 115, label: "A+" },
  { value: 130, label: "A++" },
];

export function AccessibilityToolbar() {
  const { sensoryMode, fontScale, dyslexicFont, hydrated, update } = useAccessibility();

  return (
    <div
      className="border-b border-border/60 bg-sage-soft/50 text-sage-deep"
      role="region"
      aria-label="Ustawienia dostępności"
    >
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-2 md:px-8 text-xs">
        <div className="flex items-center gap-2 opacity-80">
          <Sparkles className="size-3.5" aria-hidden />
          <span className="hidden sm:inline">
            Portal zaprojektowany zgodnie z WCAG AAA. Dostosuj widok do swoich potrzeb.
          </span>
          <span className="sm:hidden">Dostępność</span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Sensory mode */}
          <div
            className="inline-flex rounded-full border border-sage/30 bg-background p-0.5"
            role="group"
            aria-label="Tryb sensoryczny"
          >
            <button
              type="button"
              onClick={() => update({ sensoryMode: "standard" })}
              aria-pressed={hydrated && sensoryMode === "standard"}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-medium transition-colors ${
                sensoryMode === "standard"
                  ? "bg-sage-deep text-primary-foreground"
                  : "text-sage-deep hover:bg-sage-soft"
              }`}
            >
              <Eye className="size-3.5" aria-hidden />
              Standard
            </button>
            <button
              type="button"
              onClick={() => update({ sensoryMode: "low-arousal" })}
              aria-pressed={hydrated && sensoryMode === "low-arousal"}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-medium transition-colors ${
                sensoryMode === "low-arousal"
                  ? "bg-sage-deep text-primary-foreground"
                  : "text-sage-deep hover:bg-sage-soft"
              }`}
            >
              <EyeOff className="size-3.5" aria-hidden />
              Low Arousal
            </button>
          </div>

          {/* Font scale */}
          <div
            className="inline-flex rounded-full border border-sage/30 bg-background p-0.5"
            role="group"
            aria-label="Rozmiar tekstu"
          >
            {SCALES.map((s) => (
              <button
                key={s.value}
                type="button"
                onClick={() => update({ fontScale: s.value })}
                aria-pressed={hydrated && fontScale === s.value}
                aria-label={`Rozmiar tekstu ${s.value}%`}
                className={`min-w-9 rounded-full px-2.5 py-1 font-semibold transition-colors ${
                  fontScale === s.value
                    ? "bg-sage-deep text-primary-foreground"
                    : "text-sage-deep hover:bg-sage-soft"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* Dyslexic font */}
          <button
            type="button"
            onClick={() => update({ dyslexicFont: !dyslexicFont })}
            aria-pressed={hydrated && dyslexicFont}
            className={`inline-flex items-center gap-1.5 rounded-full border border-sage/30 px-3 py-1 font-medium transition-colors ${
              dyslexicFont
                ? "bg-sage-deep text-primary-foreground border-sage-deep"
                : "bg-background text-sage-deep hover:bg-sage-soft"
            }`}
          >
            <Type className="size-3.5" aria-hidden />
            OpenDyslexic
          </button>
        </div>
      </div>
    </div>
  );
}
