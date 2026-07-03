import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, X, Heart } from "lucide-react";

import { AccessibilityToolbar } from "./AccessibilityToolbar";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

const NAV_ITEMS = [
  { label: "Baza wiedzy", to: "/baza-wiedzy" },
  { label: "Życie codzienne", to: "/zycie-codzienne" },
  { label: "Etapy życia", to: "/etapy-zycia" },
  { label: "Prawo i finanse", to: "/prawo-finanse" },
  { label: "Terapie", to: "/terapie" },
  { label: "Katalog", to: "/katalog" },
  { label: "Słownik", to: "/slownik" },
  { label: "Kalkulator", to: "/kalkulator" },
  { label: "Społeczność", to: "/spolecznosc" },
] as const;

export function SiteHeader() {
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const [open, setOpen] = useState(false);
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (mounted) setSignedIn(!!data.session);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED") {
        setSignedIn(!!session);
      }
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-md">
      <AccessibilityToolbar />
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="flex h-16 items-center justify-between gap-6">
          <Link
            to="/"
            className="flex items-center gap-2 shrink-0"
            aria-label="swiatautyzmu.pl — strona główna"
          >
            <span className="grid size-9 place-items-center rounded-full bg-sage-soft text-sage-deep font-bold">
              ś
            </span>
            <span className="font-display text-lg font-semibold tracking-tight text-sage-deep">
              swiatautyzmu<span className="text-muted-foreground">.pl</span>
            </span>
          </Link>

          <nav aria-label="Główna nawigacja" className="hidden lg:flex items-center gap-1">
            {NAV_ITEMS.map((item) => {
              const active = pathname.startsWith(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`rounded-full px-3 py-2 text-sm font-medium transition-colors ${
                    active
                      ? "bg-sage-soft text-sage-deep"
                      : "text-foreground/75 hover:bg-muted hover:text-foreground"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              to="/pomoc-kryzysowa"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-crisis px-4 py-2 text-sm font-semibold text-crisis-foreground shadow-sm transition-transform hover:scale-[1.02]"
            >
              <Heart className="size-4" aria-hidden />
              Pomoc
            </Link>
            {signedIn ? (
              <Button asChild variant="ghost" size="sm" className="hidden md:inline-flex">
                <Link to="/konto">Moje konto</Link>
              </Button>
            ) : (
              <Button asChild variant="ghost" size="sm" className="hidden md:inline-flex">
                <Link to="/auth">Zaloguj się</Link>
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? "Zamknij menu" : "Otwórz menu"}
              aria-expanded={open}
            >
              {open ? <X className="size-5" /> : <Menu className="size-5" />}
            </Button>
          </div>
        </div>

        {open && (
          <nav aria-label="Menu mobilne" className="lg:hidden pb-4">
            <ul className="flex flex-col gap-1">
              {NAV_ITEMS.map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className="block rounded-lg px-4 py-3 text-base font-medium text-foreground hover:bg-muted"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  to={signedIn ? "/konto" : "/auth"}
                  className="block rounded-lg px-4 py-3 text-base font-medium text-sage-deep hover:bg-sage-soft"
                >
                  {signedIn ? "Moje konto" : "Zaloguj się"}
                </Link>
              </li>
            </ul>
          </nav>
        )}
      </div>
    </header>
  );
}
