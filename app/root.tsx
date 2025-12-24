import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "react-router";
import type { Route } from "./+types/root";
import "./app.css";
import { Header } from "~/components/layout/header";
import { Footer } from "~/components/layout/footer";
import { getUser } from "~/lib/auth.server";
import { getTranslations, type Locale } from "~/locales";
import { DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES } from "~/lib/constants";

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

export async function loader({ request }: Route.LoaderArgs) {
  const user = await getUser(request);

  // Get locale from cookie or default
  const cookieHeader = request.headers.get("Cookie");
  let locale: Locale = DEFAULT_LANGUAGE;

  if (cookieHeader) {
    const match = cookieHeader.match(/__matevoto_locale=([^;]+)/);
    if (match && SUPPORTED_LANGUAGES.includes(match[1] as Locale)) {
      locale = match[1] as Locale;
    }
  }

  const t = getTranslations(locale);

  return { user, locale, t };
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sq" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="Track and verify Kosovo politicians' promises" />
        <Meta />
        <Links />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                    document.documentElement.classList.add('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-screen bg-white dark:bg-gray-950 antialiased">
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  const { user, locale, t } = useLoaderData<typeof loader>();

  return (
    <div className="flex min-h-screen flex-col">
      <Header t={t} user={user} locale={locale} />
      <main className="flex-1">
        <Outlet context={{ user, locale, t }} />
      </main>
      <Footer t={t} />
    </div>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900 dark:text-white">{message}</h1>
        <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">{details}</p>
        {stack && (
          <pre className="mt-8 max-w-2xl mx-auto p-4 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-x-auto text-left text-sm">
            <code>{stack}</code>
          </pre>
        )}
        <a
          href="/"
          className="mt-8 inline-block px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
        >
          Go to homepage
        </a>
      </div>
    </main>
  );
}
