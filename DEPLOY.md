# Deploy `swiatautyzmu.pl` na Cloudflare Pages przez GitHub

Ta paczka jest przygotowana pod **Cloudflare Pages + GitHub**. Projekt jest aplikacją **TanStack Start + Nitro SSR**, więc nie jest zwykłym statycznym HTML-em. Build generuje folder `dist/` z plikami statycznymi oraz Cloudflare Pages Function `_worker.js`.

## 1. Co wrzucić do GitHub

Wrzucasz kod źródłowy projektu, ale **nie wrzucasz**:

- `.env`
- `node_modules/`
- `dist/`
- `.output/`
- `.wrangler/`
- `.tanstack/`

Te pozycje są już dodane do `.gitignore`.

## 2. Komendy lokalne

```bash
npm install
npm run build
```

Po poprawnym buildzie powinien istnieć folder:

```bash
dist/
```

W środku powinny być m.in.:

```text
dist/_worker.js/
dist/_routes.json
dist/assets/
dist/robots.txt
```

## 3. Ustawienia w Cloudflare Pages

Cloudflare → Workers & Pages → Create application → Pages → Connect to Git → wybierz repozytorium.

Ustaw:

- Framework preset: `None`
- Build command: `npm run build`
- Build output directory: `dist`
- Root directory: `/` jeśli repo zawiera sam projekt
- Node.js: `22` — projekt ma `.node-version`

`wrangler.toml` ma już ustawione:

```toml
pages_build_output_dir = "dist"
compatibility_flags = ["nodejs_compat"]
```

## 4. Zmienne środowiskowe

W Cloudflare Pages → Settings → Environment variables dodaj dla Production i Preview:

```text
VITE_SUPABASE_URL
VITE_SUPABASE_PROJECT_ID
VITE_SUPABASE_PUBLISHABLE_KEY
SUPABASE_URL
SUPABASE_PROJECT_ID
SUPABASE_PUBLISHABLE_KEY
```

Wartości skopiuj z lokalnego `.env`. Nie commituj `.env` do GitHub.

## 5. Najczęstszy błąd

Jeżeli Cloudflare pokaże białą stronę albo błąd ładowania danych, najczęściej brakuje zmiennych Supabase w panelu Cloudflare. Zmienne `VITE_*` są potrzebne w czasie builda, a bez nich klient nie zbuduje poprawnej konfiguracji.

## 6. Direct Upload

Dla tej wersji używaj GitHub/Git integration. Direct Upload ma sens tylko wtedy, gdy lokalnie zbudujesz projekt i wrzucisz sam folder `dist/`, ale przy tym projekcie wygodniejszy i bezpieczniejszy jest GitHub.
