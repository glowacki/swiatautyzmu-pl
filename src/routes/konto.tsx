import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/konto")({
  head: () => ({
    meta: [{ title: "Moje konto — swiatautyzmu.pl" }, { name: "robots", content: "noindex" }],
  }),
  component: AccountPage,
});

type Profile = {
  id: string;
  display_name: string | null;
  bio: string | null;
  persona: "in_spectrum" | "close_one" | "professional" | null;
};

function AccountPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [email, setEmail] = useState("");
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    (async () => {
      const { data: userRes } = await supabase.auth.getUser();
      if (!userRes.user) {
        navigate({ to: "/auth" });
        return;
      }
      setEmail(userRes.user.email ?? "");
      const { data } = await supabase
        .from("profiles")
        .select("id, display_name, bio, persona")
        .eq("id", userRes.user.id)
        .maybeSingle();
      setProfile(data as Profile | null);
      setLoading(false);
    })();
  }, [navigate]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!profile) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ display_name: profile.display_name, bio: profile.bio, persona: profile.persona })
      .eq("id", profile.id);
    setSaving(false);
    if (error) toast.error("Nie udało się zapisać", { description: error.message });
    else toast.success("Zapisano");
  }

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16">
        <div className="h-64 rounded-3xl bg-muted animate-pulse" />
      </div>
    );
  }
  if (!profile) return null;

  return (
    <div className="mx-auto max-w-2xl px-4 md:px-8 py-16">
      <header>
        <p className="text-xs font-semibold uppercase tracking-widest text-sage">Ustawienia</p>
        <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight">Moje konto</h1>
        <p className="mt-2 text-sm text-muted-foreground">{email}</p>
      </header>

      <form onSubmit={save} className="mt-10 space-y-5 rounded-3xl bg-card p-6 ring-1 ring-border">
        <div>
          <Label htmlFor="dn">Wyświetlana nazwa</Label>
          <Input
            id="dn"
            value={profile.display_name ?? ""}
            onChange={(e) => setProfile({ ...profile, display_name: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="persona">Kim jesteś w społeczności?</Label>
          <select
            id="persona"
            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={profile.persona ?? ""}
            onChange={(e) =>
              setProfile({ ...profile, persona: (e.target.value || null) as Profile["persona"] })
            }
          >
            <option value="">Wolę nie mówić</option>
            <option value="in_spectrum">Jestem w spektrum</option>
            <option value="close_one">Jestem bliską osobą</option>
            <option value="professional">Pracuję z neuroróżnorodnością</option>
          </select>
        </div>
        <div>
          <Label htmlFor="bio">Krótko o sobie (opcjonalnie)</Label>
          <Textarea
            id="bio"
            rows={4}
            value={profile.bio ?? ""}
            onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
          />
        </div>
        <div className="flex gap-3">
          <Button type="submit" disabled={saving}>
            {saving ? "Zapisuję…" : "Zapisz zmiany"}
          </Button>
          <Button type="button" variant="outline" onClick={signOut}>
            Wyloguj się
          </Button>
        </div>
      </form>
    </div>
  );
}
