import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";

const SITE_URL = "https://swiatautyzmu.pl";

const SITE_JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: "swiatautyzmu.pl",
      url: SITE_URL,
      logo: `${SITE_URL}/favicon.ico`,
      sameAs: [],
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: "swiatautyzmu.pl",
      inLanguage: "pl-PL",
      publisher: { "@id": `${SITE_URL}/#organization` },
      potentialAction: {
        "@type": "SearchAction",
        target: `${SITE_URL}/baza-wiedzy?q={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "MedicalWebPage",
      "@id": `${SITE_URL}/#medical-web-page`,
      url: SITE_URL,
      name: "Portal wiedzy o autyzmie, spektrum autyzmu i neuroróżnorodności",
      description:
        "Polski portal edukacyjny o autyzmie: diagnoza, codzienne wsparcie, prawo, finanse, terapie, katalog usług, społeczność i pomoc kryzysowa.",
      inLanguage: "pl-PL",
      isPartOf: { "@id": `${SITE_URL}/#website` },
      about: [
        { "@type": "Thing", name: "autyzm" },
        { "@type": "Thing", name: "spektrum autyzmu" },
        { "@type": "Thing", name: "neuroróżnorodność" },
        { "@type": "Thing", name: "AuDHD" },
      ],
      audience: [
        { "@type": "Audience", audienceType: "osoby w spektrum autyzmu" },
        { "@type": "Audience", audienceType: "rodzice i opiekunowie" },
        { "@type": "Audience", audienceType: "specjaliści, nauczyciele i pracodawcy" },
      ],
      medicalAudience: ["Patient", "Caregiver", "Clinician"],
      lastReviewed: "2026-07-02",
    },
  ],
};

function NotFoundComponent() {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="flex-1 grid place-items-center px-4 py-24">
        <div className="max-w-lg text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-sage">Błąd 404</p>
          <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-foreground">
            Nie znaleźliśmy tej strony
          </h1>
          <p className="mt-3 text-muted-foreground">
            Strona mogła zostać przeniesiona lub link jest niepełny. Wróć na stronę główną i wybierz
            swoją ścieżkę.
          </p>
          <div className="mt-8">
            <Link
              to="/"
              className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-sage-deep/90"
            >
              Wróć na stronę główną
            </Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
          Ta strona się nie załadowała
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Coś poszło nie tak po naszej stronie. Spróbuj odświeżyć lub wróć na stronę główną.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground"
          >
            Spróbuj ponownie
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-full border border-input bg-background px-5 py-2.5 text-sm font-medium"
          >
            Strona główna
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "theme-color", content: "#f0f1eb" },
      {
        name: "robots",
        content: "index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1",
      },
      { name: "application-name", content: "swiatautyzmu.pl" },
      { name: "author", content: "swiatautyzmu.pl" },
      { title: "swiatautyzmu.pl — wiedza, wsparcie i akceptacja neuroróżnorodności" },
      {
        name: "description",
        content:
          "Największy polski hub wiedzy o autyzmie. Rzetelne informacje, katalog placówek, forum społeczności i pomoc kryzysowa. Portal dostępny WCAG AAA z trybem sensorycznym.",
      },
      {
        property: "og:title",
        content: "swiatautyzmu.pl — hub wiedzy o autyzmie i neuroróżnorodności",
      },
      {
        property: "og:description",
        content:
          "Encyklopedia, katalog placówek, prawo, terapie i społeczność — wszystko w jednym miejscu, po polsku, z pełną dostępnością.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: SITE_URL },
      { property: "og:locale", content: "pl_PL" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      {
        rel: "preconnect",
        href: "https://fonts.googleapis.com",
      },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&display=swap",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.cdnfonts.com/css/opendyslexic",
      },
      { rel: "canonical", href: SITE_URL },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="pl">
      <head>
        <HeadContent />
        <script
          type="application/ld+json"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: JSON.stringify(SITE_JSON_LD) }}
        />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
      >
        Przejdź do treści
      </a>
      <div className="flex min-h-dvh flex-col bg-background text-foreground">
        <SiteHeader />
        <main id="main-content" className="flex-1">
          <Outlet />
        </main>
        <SiteFooter />
      </div>
    </QueryClientProvider>
  );
}
