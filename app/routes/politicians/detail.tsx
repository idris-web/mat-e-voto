import { Link, useOutletContext } from "react-router";
import type { Route } from "./+types/detail";
import { db } from "~/lib/db.server";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "~/components/ui/avatar";
import { PartyBadge } from "~/components/parties/party-badge";
import { PromiseCard } from "~/components/promises/promise-card";
import { Button } from "~/components/ui/button";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { getInitials, calculatePercentage } from "~/lib/utils";
import { Progress } from "~/components/ui/progress";
import type { Translations, Locale } from "~/locales";

export function meta({ data }: Route.MetaArgs) {
  if (!data?.politician) {
    return [{ title: "Politician Not Found - Premtimet" }];
  }
  return [
    { title: `${data.politician.name} - Premtimet` },
    { name: "description", content: `View promises by ${data.politician.name}` },
  ];
}

export async function loader({ params }: Route.LoaderArgs) {
  const politician = await db.politician.findUnique({
    where: { slug: params.slug },
    include: {
      party: true,
      promises: {
        orderBy: { updatedAt: "desc" },
        include: {
          topic: true,
          politician: {
            include: { party: true },
          },
        },
      },
    },
  });

  if (!politician) {
    throw new Response("Not Found", { status: 404 });
  }

  // Calculate stats
  const stats = {
    total: politician.promises.length,
    kept: politician.promises.filter((p) => p.status === "PROMISE_KEPT").length,
    broken: politician.promises.filter((p) => p.status === "PROMISE_BROKEN").length,
    inProgress: politician.promises.filter((p) => p.status === "IN_THE_WORKS").length,
  };

  return { politician, stats };
}

export default function PoliticianDetail({ loaderData }: Route.ComponentProps) {
  const { politician, stats } = loaderData;
  const { t, locale } = useOutletContext<{
    t: Translations;
    locale: Locale;
  }>();

  const keptPercentage = calculatePercentage(stats.kept, stats.total);
  const brokenPercentage = calculatePercentage(stats.broken, stats.total);

  return (
    <div className="container mx-auto px-4 py-8">
      <Button asChild variant="ghost" className="mb-6">
        <Link to="/politicians">
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t.actions.back}
        </Link>
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="pt-6 text-center">
              <Avatar className="h-32 w-32 mx-auto">
                {politician.photoUrl ? (
                  <AvatarImage src={politician.photoUrl} alt={politician.name} />
                ) : null}
                <AvatarFallback className="text-4xl">
                  {getInitials(politician.name)}
                </AvatarFallback>
              </Avatar>
              <h1 className="text-2xl font-bold mt-4">{politician.name}</h1>
              <div className="flex items-center justify-center gap-2 mt-2">
                {politician.party && (
                  <Link to={`/parties/${politician.party.slug}`}>
                    <PartyBadge party={politician.party} />
                  </Link>
                )}
              </div>
              {politician.currentPosition && (
                <p className="text-gray-500 dark:text-gray-400 mt-2">
                  {politician.currentPosition}
                </p>
              )}

              {/* Stats */}
              <div className="mt-6 space-y-4">
                <div className="flex justify-between text-sm">
                  <span>{t.stats.totalPromises}</span>
                  <span className="font-bold">{stats.total}</span>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-green-600">{t.stats.keptPromises}</span>
                    <span>{keptPercentage}%</span>
                  </div>
                  <Progress
                    value={keptPercentage}
                    className="h-2"
                    indicatorClassName="bg-green-500"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-red-600">{t.stats.brokenPromises}</span>
                    <span>{brokenPercentage}%</span>
                  </div>
                  <Progress
                    value={brokenPercentage}
                    className="h-2"
                    indicatorClassName="bg-red-500"
                  />
                </div>
              </div>

              {/* Biography */}
              {politician.bio && (
                <div className="mt-6 text-left">
                  <h3 className="font-semibold mb-2">{t.politicians.biography}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {politician.bio}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Promises */}
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-bold mb-6">
            {t.nav.promises} ({politician.promises.length})
          </h2>
          {politician.promises.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {politician.promises.map((promise) => (
                <PromiseCard key={promise.id} promise={promise} locale={locale} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-gray-500">
                {t.promises.noResults}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
