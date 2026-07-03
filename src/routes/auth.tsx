import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Logowanie i rejestracja — swiatautyzmu.pl" },
      {
        name: "description",
        content:
          "Dołącz do społeczności swiatautyzmu.pl. Załóż konto, aby brać udział w forum i zapisywać ulubione zasoby.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/" });
    });
  }, [navigate]);

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) {
      toast.error("Nie udało się zalogować", { description: error.message });
      return;
    }
    toast.success("Witaj z powrotem");
    navigate({ to: "/" });
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: { display_name: displayName || email.split("@")[0] },
      },
    });
    setBusy(false);
    if (error) {
      toast.error("Nie udało się utworzyć konta", { description: error.message });
      return;
    }
    toast.success("Konto utworzone. Sprawdź skrzynkę pocztową.");
  }

  async function handleGoogle() {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      toast.error("Nie udało się zalogować przez Google", { description: result.error.message });
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="rounded-3xl bg-card p-8 md:p-10 ring-1 ring-border shadow-sm">
        <div className="mb-8 text-center">
          <h1 className="font-display text-3xl font-semibold tracking-tight">Twoje konto</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Dołącz do forum, zapisuj ulubione artykuły i placówki.
          </p>
        </div>

        <Button variant="outline" className="w-full" onClick={handleGoogle}>
          Kontynuuj przez Google
        </Button>

        <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
          <div className="h-px flex-1 bg-border" />
          lub e-mailem
          <div className="h-px flex-1 bg-border" />
        </div>

        <Tabs defaultValue="signin">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Zaloguj się</TabsTrigger>
            <TabsTrigger value="signup">Utwórz konto</TabsTrigger>
          </TabsList>

          <TabsContent value="signin">
            <form className="space-y-4 mt-4" onSubmit={handleSignIn}>
              <div>
                <Label htmlFor="si-email">E-mail</Label>
                <Input
                  id="si-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="si-pass">Hasło</Label>
                <Input
                  id="si-pass"
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full" disabled={busy}>
                {busy ? "Loguję…" : "Zaloguj się"}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="signup">
            <form className="space-y-4 mt-4" onSubmit={handleSignUp}>
              <div>
                <Label htmlFor="su-name">Jak mamy się do Ciebie zwracać? (opcjonalnie)</Label>
                <Input
                  id="su-name"
                  type="text"
                  autoComplete="nickname"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="su-email">E-mail</Label>
                <Input
                  id="su-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="su-pass">Hasło (min. 6 znaków)</Label>
                <Input
                  id="su-pass"
                  type="password"
                  required
                  minLength={6}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full" disabled={busy}>
                {busy ? "Tworzę konto…" : "Utwórz konto"}
              </Button>
              <p className="text-xs text-muted-foreground">
                Zakładając konto akceptujesz zasady kultury forum i naszą politykę prywatności. Nie
                sprzedajemy Twoich danych.
              </p>
            </form>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
