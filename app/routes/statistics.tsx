import { useOutletContext } from "react-router";
import type { Route } from "./+types/statistics";
import { db } from "~/lib/db.server";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Progress } from "~/components/ui/progress";
import { StatsOverview } from "~/components/dashboard/stats-overview";
import { calculatePercentage } from "~/lib/utils";
import { PARTY_COLORS } from "~/lib/constants";
import type { Translations, Locale } from "~/locales";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Statistics - Premtimet" },
    { name: "description", content: "Promise tracking statistics" },
  ];
}

export async function loader({}: Route.LoaderArgs) {
  // Overall stats
  const [total, kept, broken, inProgress, stalled, compromise, notRated] =
    await Promise.all([
      db.promise.count(),
      db.promise.count({ where: { status: "PROMISE_KEPT" } }),
      db.promise.count({ where: { status: "PROMISE_BROKEN" } }),
      db.promise.count({ where: { status: "IN_THE_WORKS" } }),
      db.promise.count({ where: { status: "STALLED" } }),
      db.promise.count({ where: { status: "COMPROMISE" } }),
      db.promise.count({ where: { status: "NOT_YET_RATED" } }),
    ]);

  // Stats by party
  const parties = await db.party.findMany({
    include: {
      _count: {
        select: { promises: true },
      },
    },
  });

  const partyStats = await Promise.all(
    parties.map(async (party) => {
      const [kept, broken] = await Promise.all([
        db.promise.count({ where: { partyId: party.id, status: "PROMISE_KEPT" } }),
        db.promise.count({ where: { partyId: party.id, status: "PROMISE_BROKEN" } }),
      ]);
      return {
        ...party,
        stats: {
          total: party._count.promises,
          kept,
          broken,
          keptPercentage: calculatePercentage(kept, party._count.promises),
          brokenPercentage: calculatePercentage(broken, party._count.promises),
        },
      };
    })
  );

  // Stats by topic
  const topics = await db.topic.findMany({
    include: {
      _count: {
        select: { promises: true },
      },
    },
  });

  const topicStats = await Promise.all(
    topics.map(async (topic) => {
      const [kept, broken] = await Promise.all([
        db.promise.count({ where: { topicId: topic.id, status: "PROMISE_KEPT" } }),
        db.promise.count({ where: { topicId: topic.id, status: "PROMISE_BROKEN" } }),
      ]);
      return {
        ...topic,
        stats: {
          total: topic._count.promises,
          kept,
          broken,
          keptPercentage: calculatePercentage(kept, topic._count.promises),
          brokenPercentage: calculatePercentage(broken, topic._count.promises),
        },
      };
    })
  );

  return {
    stats: { total, kept, broken, inProgress, stalled, compromise, notRated },
    partyStats: partyStats.filter((p) => p.stats.total > 0).sort((a, b) => b.stats.total - a.stats.total),
    topicStats: topicStats.filter((t) => t.stats.total > 0).sort((a, b) => b.stats.total - a.stats.total),
  };
}

export default function Statistics({ loaderData }: Route.ComponentProps) {
  const { stats, partyStats, topicStats } = loaderData;
  const { t, locale } = useOutletContext<{
    t: Translations;
    locale: Locale;
  }>();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {t.nav.statistics}
        </h1>
      </div>

      {/* Overall Stats */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">{t.stats.overview}</h2>
        <StatsOverview stats={stats} t={t} />
      </section>

      {/* Stats by Party */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">{t.nav.parties}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {partyStats.map((party) => {
            const color = party.color || PARTY_COLORS[party.shortName] || "#6B7280";
            return (
              <Card key={party.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div
                      className="h-8 w-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
                      style={{ backgroundColor: color }}
                    >
                      {party.shortName[0]}
                    </div>
                    <span>{party.name}</span>
                    <span className="text-sm font-normal text-gray-500 ml-auto">
                      {party.stats.total} {t.nav.promises.toLowerCase()}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-green-600">{t.stats.keptPromises}</span>
                      <span>{party.stats.kept} ({party.stats.keptPercentage}%)</span>
                    </div>
                    <Progress
                      value={party.stats.keptPercentage}
                      className="h-2"
                      indicatorClassName="bg-green-500"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-red-600">{t.stats.brokenPromises}</span>
                      <span>{party.stats.broken} ({party.stats.brokenPercentage}%)</span>
                    </div>
                    <Progress
                      value={party.stats.brokenPercentage}
                      className="h-2"
                      indicatorClassName="bg-red-500"
                    />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Stats by Topic */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">{t.nav.topics}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {topicStats.map((topic) => (
            <Card key={topic.id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {topic.icon && <span className="text-2xl">{topic.icon}</span>}
                  <span>{locale === "en" ? topic.nameEn : topic.name}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500 mb-4">
                  {topic.stats.total} {t.nav.promises.toLowerCase()}
                </p>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-green-600">{t.stats.keptPromises}</span>
                      <span>{topic.stats.keptPercentage}%</span>
                    </div>
                    <Progress
                      value={topic.stats.keptPercentage}
                      className="h-2"
                      indicatorClassName="bg-green-500"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-red-600">{t.stats.brokenPromises}</span>
                      <span>{topic.stats.brokenPercentage}%</span>
                    </div>
                    <Progress
                      value={topic.stats.brokenPercentage}
                      className="h-2"
                      indicatorClassName="bg-red-500"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
