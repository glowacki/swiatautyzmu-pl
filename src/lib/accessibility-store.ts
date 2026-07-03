import { useEffect, useState, useCallback } from "react";

export type SensoryMode = "standard" | "low-arousal";
export type FontScale = 90 | 100 | 115 | 130;

const STORAGE_KEY = "sa-accessibility-v1";

type AccessibilityState = {
  sensoryMode: SensoryMode;
  fontScale: FontScale;
  dyslexicFont: boolean;
};

const DEFAULT_STATE: AccessibilityState = {
  sensoryMode: "standard",
  fontScale: 100,
  dyslexicFont: false,
};

function readStored(): AccessibilityState {
  if (typeof window === "undefined") return DEFAULT_STATE;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw) as Partial<AccessibilityState>;
    return { ...DEFAULT_STATE, ...parsed };
  } catch {
    return DEFAULT_STATE;
  }
}

function applyToDocument(state: AccessibilityState) {
  if (typeof document === "undefined") return;
  const html = document.documentElement;
  html.classList.toggle("low-arousal", state.sensoryMode === "low-arousal");
  html.classList.remove("font-scale-90", "font-scale-115", "font-scale-130");
  if (state.fontScale !== 100) html.classList.add(`font-scale-${state.fontScale}`);
  html.classList.toggle("font-dyslexic", state.dyslexicFont);
}

export function useAccessibility() {
  const [state, setState] = useState<AccessibilityState>(DEFAULT_STATE);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const initial = readStored();
    setState(initial);
    applyToDocument(initial);
    setHydrated(true);
  }, []);

  const update = useCallback((patch: Partial<AccessibilityState>) => {
    setState((prev) => {
      const next = { ...prev, ...patch };
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        /* noop */
      }
      applyToDocument(next);
      return next;
    });
  }, []);

  return { ...state, hydrated, update };
}
