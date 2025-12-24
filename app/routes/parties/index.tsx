import { Link, useOutletContext } from "react-router";
import type { Route } from "./+types/index";
import { db } from "~/lib/db.server";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { ArrowRight, ExternalLink, Users } from "lucide-react";
import { PARTY_COLORS } from "~/lib/constants";
import type { Translations, Locale } from "~/locales";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Parties - Premtimet" },
    { name: "description", content: "Browse Kosovo political parties" },
  ];
}

export async function loader({}: Route.LoaderArgs) {
  const parties = await db.party.findMany({
    orderBy: { shortName: "asc" },
    include: {
      _count: {
        select: {
          promises: true,
          politicians: true,
        },
      },
    },
  });

  return { parties };
}

export default function PartiesIndex({ loaderData }: Route.ComponentProps) {
  const { parties } = loaderData;
  const { t, locale } = useOutletContext<{
    t: Translations;
    locale: Locale;
  }>();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {t.parties.title}
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          {t.parties.subtitle}
        </p>
      </div>

      {parties.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {parties.map((party) => {
            const color = party.color || PARTY_COLORS[party.shortName] || "#6B7280";
            return (
              <Card
                key={party.id}
                className="hover:shadow-lg transition-shadow overflow-hidden"
              >
                <div className="h-2" style={{ backgroundColor: color }} />
                <CardHeader>
                  <div className="flex items-center gap-4">
                    {party.logoUrl ? (
                      <img
                        src={party.logoUrl}
                        alt={party.name}
                        className="h-16 w-16 object-contain"
                      />
                    ) : (
                      <div
                        className="h-16 w-16 rounded-full flex items-center justify-center text-white text-2xl font-bold"
                        style={{ backgroundColor: color }}
                      >
                        {party.shortName[0]}
                      </div>
                    )}
                    <div>
                      <CardTitle>
                        <Link
                          to={`/parties/${party.slug}`}
                          className="hover:underline"
                        >
                          {party.name}
                        </Link>
                      </CardTitle>
                      <p
                        className="text-lg font-semibold"
                        style={{ color }}
                      >
                        {party.shortName}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {party._count.politicians} {t.parties.members.toLowerCase()}
                    </div>
                    <div>
                      {party._count.promises} {t.nav.promises.toLowerCase()}
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-2">
                    <Button asChild variant="outline" size="sm">
                      <Link to={`/parties/${party.slug}`}>
                        {t.actions.viewDetails}
                        <ArrowRight className="ml-1 h-3 w-3" />
                      </Link>
                    </Button>
                    {party.websiteUrl && (
                      <Button asChild variant="ghost" size="sm">
                        <a
                          href={party.websiteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center text-gray-500">
            {t.parties.noResults}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
