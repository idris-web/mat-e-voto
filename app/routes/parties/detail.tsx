import { Link, useOutletContext } from "react-router";
import type { Route } from "./+types/detail";
import { db } from "~/lib/db.server";
import { Card, CardContent } from "~/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "~/components/ui/avatar";
import { PromiseCard } from "~/components/promises/promise-card";
import { Button } from "~/components/ui/button";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { getInitials, calculatePercentage } from "~/lib/utils";
import { Progress } from "~/components/ui/progress";
import { PARTY_COLORS } from "~/lib/constants";
import type { Translations, Locale } from "~/locales";

export function meta({ data }: Route.MetaArgs) {
  if (!data?.party) {
    return [{ title: "Party Not Found - Premtimet" }];
  }
  return [
    { title: `${data.party.name} - Premtimet` },
    { name: "description", content: `View promises by ${data.party.name}` },
  ];
}

export async function loader({ params }: Route.LoaderArgs) {
  const party = await db.party.findUnique({
    where: { slug: params.slug },
    include: {
      politicians: {
        where: { isActive: true },
        orderBy: { name: "asc" },
      },
      promises: {
        orderBy: { updatedAt: "desc" },
        take: 12,
        include: {
          topic: true,
          politician: {
            include: { party: true },
          },
        },
      },
      _count: {
        select: { promises: true },
      },
    },
  });

  if (!party) {
    throw new Response("Not Found", { status: 404 });
  }

  // Get promise stats for the party
  const [kept, broken, inProgress] = await Promise.all([
    db.promise.count({ where: { partyId: party.id, status: "PROMISE_KEPT" } }),
    db.promise.count({ where: { partyId: party.id, status: "PROMISE_BROKEN" } }),
    db.promise.count({ where: { partyId: party.id, status: "IN_THE_WORKS" } }),
  ]);

  const stats = {
    total: party._count.promises,
    kept,
    broken,
    inProgress,
  };

  return { party, stats };
}

export default function PartyDetail({ loaderData }: Route.ComponentProps) {
  const { party, stats } = loaderData;
  const { t, locale } = useOutletContext<{
    t: Translations;
    locale: Locale;
  }>();

  const color = party.color || PARTY_COLORS[party.shortName] || "#6B7280";
  const keptPercentage = calculatePercentage(stats.kept, stats.total);
  const brokenPercentage = calculatePercentage(stats.broken, stats.total);

  return (
    <div className="container mx-auto px-4 py-8">
      <Button asChild variant="ghost" className="mb-6">
        <Link to="/parties">
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t.actions.back}
        </Link>
      </Button>

      {/* Party Header */}
      <Card className="mb-8 overflow-hidden">
        <div className="h-2" style={{ backgroundColor: color }} />
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            {party.logoUrl ? (
              <img
                src={party.logoUrl}
                alt={party.name}
                className="h-24 w-24 object-contain"
              />
            ) : (
              <div
                className="h-24 w-24 rounded-full flex items-center justify-center text-white text-4xl font-bold"
                style={{ backgroundColor: color }}
              >
                {party.shortName[0]}
              </div>
            )}
            <div className="text-center md:text-left">
              <h1 className="text-3xl font-bold">{party.name}</h1>
              <p className="text-xl font-semibold mt-1" style={{ color }}>
                {party.shortName}
              </p>
              {party.websiteUrl && (
                <a
                  href={party.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 mt-2 text-sm text-blue-600 hover:underline"
                >
                  <ExternalLink className="h-3 w-3" />
                  {t.parties.website}
                </a>
              )}
            </div>
            <div className="flex-1" />
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-gray-500">{t.stats.totalPromises}</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">{keptPercentage}%</p>
                <p className="text-sm text-gray-500">{t.stats.keptPromises}</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600">{brokenPercentage}%</p>
                <p className="text-sm text-gray-500">{t.stats.brokenPromises}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Members */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-xl font-bold mb-4">
                {t.parties.members} ({party.politicians.length})
              </h2>
              <div className="space-y-3">
                {party.politicians.map((politician) => (
                  <Link
                    key={politician.id}
                    to={`/politicians/${politician.slug}`}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <Avatar className="h-10 w-10">
                      {politician.photoUrl ? (
                        <AvatarImage
                          src={politician.photoUrl}
                          alt={politician.name}
                        />
                      ) : null}
                      <AvatarFallback>
                        {getInitials(politician.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{politician.name}</p>
                      {politician.currentPosition && (
                        <p className="text-sm text-gray-500">
                          {politician.currentPosition}
                        </p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Promises */}
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-bold mb-6">
            {t.nav.promises} ({stats.total})
          </h2>
          {party.promises.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {party.promises.map((promise) => (
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
