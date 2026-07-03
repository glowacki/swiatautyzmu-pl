import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { MessageCircle, Plus } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const CATEGORIES = [
  "Ogólne",
  "Dorośli w spektrum",
  "Rodzice i opiekunowie",
  "Edukacja",
  "Praca",
  "Diagnoza",
];

export const Route = createFileRoute("/spolecznosc")({
  head: () => ({
    meta: [
      { title: "Społeczność i forum — swiatautyzmu.pl" },
      {
        name: "description",
        content:
          "Forum osób w spektrum, ich bliskich i profesjonalistów. Moderowana przestrzeń wymiany doświadczeń, pytań i wsparcia.",
      },
      { property: "og:title", content: "Forum społeczności swiatautyzmu.pl" },
      {
        property: "og:description",
        content: "Nic o nas bez nas — moderowana społeczność neuroróżnorodna.",
      },
    ],
  }),
  component: CommunityPage,
});

function CommunityPage() {
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSignedIn(!!data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT") setSignedIn(!!session);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const threads = useQuery({
    queryKey: ["threads"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("forum_threads")
        .select("id, title, slug, body, category, is_pinned, is_locked, created_at, author_id")
        .order("is_pinned", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data ?? [];
    },
  });

  async function createThread(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { data: userRes } = await supabase.auth.getUser();
    if (!userRes.user) {
      setBusy(false);
      toast.error("Zaloguj się, aby założyć wątek");
      return;
    }
    const slug =
      title
        .toLowerCase()
        .replace(/[^a-z0-9ąćęłńóśźż\s-]/g, "")
        .replace(/\s+/g, "-")
        .slice(0, 60) +
      "-" +
      Date.now().toString(36);
    const { error } = await supabase.from("forum_threads").insert({
      title,
      slug,
      body,
      category,
      author_id: userRes.user.id,
    });
    setBusy(false);
    if (error) {
      toast.error("Nie udało się utworzyć wątku", { description: error.message });
      return;
    }
    toast.success("Wątek utworzony");
    setTitle("");
    setBody("");
    setShowNew(false);
    threads.refetch();
  }

  return (
    <div className="mx-auto max-w-5xl px-4 md:px-8 py-16">
      <header className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-widest text-sage">Społeczność</p>
        <h1 className="mt-3 font-display text-4xl md:text-5xl font-semibold tracking-tight">
          Forum: nic o nas bez nas
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Moderowana przestrzeń wymiany doświadczeń. Rozmawiamy z szacunkiem, bez oceniania i bez
          porad medycznych. Reguły widoczne przy zakładaniu wątku.
        </p>
      </header>

      <div className="mt-10 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{threads.data?.length ?? 0} wątków</p>
        {signedIn ? (
          <Button onClick={() => setShowNew((v) => !v)}>
            <Plus className="size-4 mr-1" /> {showNew ? "Anuluj" : "Nowy wątek"}
          </Button>
        ) : (
          <Button asChild variant="outline">
            <Link to="/auth">Zaloguj się, aby zabrać głos</Link>
          </Button>
        )}
      </div>

      {showNew && signedIn && (
        <form
          onSubmit={createThread}
          className="mt-6 rounded-3xl bg-card p-6 ring-1 ring-border space-y-4"
        >
          <div>
            <Label htmlFor="t-title">Temat</Label>
            <Input
              id="t-title"
              required
              maxLength={140}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="t-cat">Kategoria</Label>
            <select
              id="t-cat"
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="t-body">Treść</Label>
            <Textarea
              id="t-body"
              required
              rows={6}
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
          </div>
          <Button type="submit" disabled={busy}>
            {busy ? "Publikuję…" : "Opublikuj wątek"}
          </Button>
        </form>
      )}

      <div className="mt-8 space-y-4">
        {threads.isLoading ? (
          [0, 1, 2].map((i) => <div key={i} className="h-24 rounded-2xl bg-muted animate-pulse" />)
        ) : threads.data?.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border p-12 text-center text-muted-foreground">
            Bądź pierwszą osobą, która zabierze tu głos.
          </div>
        ) : (
          threads.data?.map((t) => (
            <article key={t.id} className="rounded-2xl bg-card p-5 ring-1 ring-border">
              <div className="flex flex-wrap items-baseline gap-3">
                {t.is_pinned && (
                  <span className="rounded-full bg-accent px-2 py-0.5 text-xs font-semibold text-accent-foreground">
                    Przypięty
                  </span>
                )}
                <span className="rounded-md bg-sage-soft px-2 py-0.5 text-xs font-semibold text-sage-deep">
                  {t.category}
                </span>
                <time className="text-xs text-muted-foreground">
                  {new Date(t.created_at).toLocaleDateString("pl-PL", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </time>
              </div>
              <h2 className="mt-2 font-display text-xl font-semibold text-foreground">{t.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{t.body}</p>
              <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                <MessageCircle className="size-3.5" aria-hidden /> Otwórz wątek
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
