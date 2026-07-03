# swiatautyzmu.pl

Kompleksowy portal edukacyjny o autyzmie, spektrum autyzmu i neuroróżnorodności: baza wiedzy, praktyczne wsparcie, prawo i finanse, katalog usług, słownik, społeczność i pomoc kryzysowa.

## Stack

- TanStack Start / TanStack Router
- React 19
- Vite
- Nitro SSR
- Cloudflare Pages Functions
- Supabase
- Tailwind CSS

## Lokalnie

```bash
npm install
cp .env.example .env
npm run dev
```

## Build

```bash
npm run build
```

Build dla Cloudflare Pages trafia do `dist/`. Folder `dist/` nie powinien być commitowany.

## Deploy

Instrukcja krok po kroku jest w pliku [`DEPLOY.md`](./DEPLOY.md).

Najważniejsze ustawienia Cloudflare Pages:

- Build command: `npm run build`
- Build output directory: `dist`
- Framework preset: `None`
- Node.js: `22`

## SEO / GEO / AEO

Projekt zawiera:

- meta title i description dla głównych sekcji,
- sitemapę `/sitemap.xml`,
- `robots.txt` z adresem sitemap,
- `llms.txt` dla modeli i agentów AI,
- dostępnościowy UX: low-arousal, skalowanie tekstu, czcionka dyslektyczna, redukcja ruchu.

## Bezpieczeństwo

Nie commituj `.env`. Do repo trafia tylko `.env.example`.
