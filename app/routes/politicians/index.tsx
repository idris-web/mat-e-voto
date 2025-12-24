import { Link, useOutletContext } from "react-router";
import type { Route } from "./+types/index";
import { db } from "~/lib/db.server";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "~/components/ui/avatar";
import { PartyBadge } from "~/components/parties/party-badge";
import { Button } from "~/components/ui/button";
import { ArrowRight } from "lucide-react";
import { getInitials } from "~/lib/utils";
import type { Translations, Locale } from "~/locales";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Politicians - Premtimet" },
    { name: "description", content: "Browse Kosovo politicians" },
  ];
}

export async function loader({}: Route.LoaderArgs) {
  const politicians = await db.politician.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
    include: {
      party: true,
      _count: {
        select: { promises: true },
      },
    },
  });

  return { politicians };
}

export default function PoliticiansIndex({ loaderData }: Route.ComponentProps) {
  const { politicians } = loaderData;
  const { t, locale } = useOutletContext<{
    t: Translations;
    locale: Locale;
  }>();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {t.politicians.title}
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          {t.politicians.subtitle}
        </p>
      </div>

      {politicians.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {politicians.map((politician) => (
            <Card key={politician.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <Link to={`/politicians/${politician.slug}`}>
                  <Avatar className="h-24 w-24 mx-auto">
                    {politician.photoUrl ? (
                      <AvatarImage src={politician.photoUrl} alt={politician.name} />
                    ) : null}
                    <AvatarFallback className="text-2xl">
                      {getInitials(politician.name)}
                    </AvatarFallback>
                  </Avatar>
                </Link>
                <CardTitle className="mt-4">
                  <Link
                    to={`/politicians/${politician.slug}`}
                    className="hover:underline"
                  >
                    {politician.name}
                  </Link>
                </CardTitle>
                <div className="flex items-center justify-center gap-2 mt-2">
                  {politician.party && <PartyBadge party={politician.party} />}
                </div>
                {politician.currentPosition && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {politician.currentPosition}
                  </p>
                )}
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {politician._count.promises} {t.nav.promises.toLowerCase()}
                </p>
                <Button asChild variant="ghost" size="sm" className="mt-2">
                  <Link to={`/politicians/${politician.slug}`}>
                    {t.politicians.viewPromises}
                    <ArrowRight className="ml-1 h-3 w-3" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center text-gray-500">
            {t.politicians.noResults}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
