import { Link, useOutletContext, useSearchParams } from "react-router";
import type { Route } from "./+types/search";
import { db } from "~/lib/db.server";
import { PromiseCard } from "~/components/promises/promise-card";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "~/components/ui/avatar";
import { PartyBadge } from "~/components/parties/party-badge";
import { Search as SearchIcon } from "lucide-react";
import { getInitials } from "~/lib/utils";
import type { Translations, Locale } from "~/locales";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Search - Premtimet" },
    { name: "description", content: "Search promises, politicians, and parties" },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const query = url.searchParams.get("q");

  if (!query || query.length < 2) {
    return { query, promises: [], politicians: [], parties: [] };
  }

  const [promises, politicians, parties] = await Promise.all([
    db.promise.findMany({
      where: {
        OR: [
          { summary: { contains: query, mode: "insensitive" } },
          { textOriginal: { contains: query, mode: "insensitive" } },
        ],
      },
      take: 8,
      orderBy: { viewCount: "desc" },
      include: {
        politician: {
          include: { party: true },
        },
        topic: true,
      },
    }),
    db.politician.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { currentPosition: { contains: query, mode: "insensitive" } },
        ],
        isActive: true,
      },
      take: 4,
      include: { party: true },
    }),
    db.party.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { shortName: { contains: query, mode: "insensitive" } },
        ],
      },
      take: 4,
    }),
  ]);

  return { query, promises, politicians, parties };
}

export default function Search({ loaderData }: Route.ComponentProps) {
  const { query, promises, politicians, parties } = loaderData;
  const [searchParams, setSearchParams] = useSearchParams();
  const { t, locale } = useOutletContext<{
    t: Translations;
    locale: Locale;
  }>();

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const q = formData.get("q") as string;
    setSearchParams({ q });
  };

  const totalResults = promises.length + politicians.length + parties.length;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {t.nav.search}
        </h1>
      </div>

      {/* Search Form */}
      <form onSubmit={handleSearch} className="mb-8">
        <div className="relative max-w-2xl">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            name="q"
            type="search"
            placeholder={t.promises.searchPlaceholder}
            defaultValue={query || ""}
            className="pl-10 h-12 text-lg"
            autoFocus
          />
        </div>
      </form>

      {query && (
        <p className="text-sm text-gray-500 mb-6">
          {totalResults} results for "{query}"
        </p>
      )}

      {/* Politicians Results */}
      {politicians.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4">{t.nav.politicians}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {politicians.map((politician) => (
              <Link
                key={politician.id}
                to={`/politicians/${politician.slug}`}
                className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
              >
                <Avatar>
                  {politician.photoUrl ? (
                    <AvatarImage src={politician.photoUrl} alt={politician.name} />
                  ) : null}
                  <AvatarFallback>{getInitials(politician.name)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{politician.name}</p>
                  {politician.party && <PartyBadge party={politician.party} size="sm" />}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Parties Results */}
      {parties.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4">{t.nav.parties}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {parties.map((party) => (
              <Link
                key={party.id}
                to={`/parties/${party.slug}`}
                className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
              >
                <div
                  className="h-10 w-10 rounded-full flex items-center justify-center text-white font-bold"
                  style={{ backgroundColor: party.color || "#6B7280" }}
                >
                  {party.shortName[0]}
                </div>
                <div>
                  <p className="font-medium">{party.name}</p>
                  <p className="text-sm text-gray-500">{party.shortName}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Promises Results */}
      {promises.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4">{t.nav.promises}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {promises.map((promise) => (
              <PromiseCard key={promise.id} promise={promise} locale={locale} />
            ))}
          </div>
        </section>
      )}

      {/* No Results */}
      {query && totalResults === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-gray-500">
            {t.promises.noResults}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
