import { Link, useOutletContext } from "react-router";
import type { Route } from "./+types/home";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { StatsOverview } from "~/components/dashboard/stats-overview";
import { PromiseCard } from "~/components/promises/promise-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { db } from "~/lib/db.server";
import { ArrowRight, Send } from "lucide-react";
import type { Translations, Locale } from "~/locales";
import type { AuthUser } from "~/lib/auth.server";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Premtimet - Kosovo Political Promise Tracker" },
    {
      name: "description",
      content: "Track and verify Kosovo politicians' promises",
    },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  // Get statistics
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

  // Get recent promises by status
  const [keptPromises, brokenPromises, inProgressPromises] = await Promise.all([
    db.promise.findMany({
      where: { status: "PROMISE_KEPT" },
      take: 4,
      orderBy: { updatedAt: "desc" },
      include: {
        politician: {
          include: { party: true },
        },
        topic: true,
      },
    }),
    db.promise.findMany({
      where: { status: "PROMISE_BROKEN" },
      take: 4,
      orderBy: { updatedAt: "desc" },
      include: {
        politician: {
          include: { party: true },
        },
        topic: true,
      },
    }),
    db.promise.findMany({
      where: { status: "IN_THE_WORKS" },
      take: 4,
      orderBy: { updatedAt: "desc" },
      include: {
        politician: {
          include: { party: true },
        },
        topic: true,
      },
    }),
  ]);

  return {
    stats: { total, kept, broken, inProgress, stalled, compromise, notRated },
    keptPromises,
    brokenPromises,
    inProgressPromises,
  };
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const { stats, keptPromises, brokenPromises, inProgressPromises } = loaderData;
  const { t, locale } = useOutletContext<{
    t: Translations;
    locale: Locale;
    user: AuthUser | null;
  }>();

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-gray-100 to-white dark:from-gray-900 dark:to-gray-950 py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-gray-900 dark:text-white">
            {t.home.heroTitle}
          </h1>
          <p className="mt-6 text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            {t.home.heroSubtitle}
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Button asChild size="lg">
              <Link to="/promises">
                {t.home.browsePromises}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/submit-tip">
                <Send className="mr-2 h-4 w-4" />
                {t.home.submitTip}
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Statistics Overview */}
      <section className="py-12 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            {t.stats.overview}
          </h2>
          <StatsOverview stats={stats} t={t} />
        </div>
      </section>

      {/* Featured Promises by Status */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {t.home.featuredPromises}
            </h2>
            <Button asChild variant="ghost">
              <Link to="/promises">
                {t.home.viewAll}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <Tabs defaultValue="kept" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="kept">{t.status.PROMISE_KEPT}</TabsTrigger>
              <TabsTrigger value="broken">{t.status.PROMISE_BROKEN}</TabsTrigger>
              <TabsTrigger value="progress">{t.status.IN_THE_WORKS}</TabsTrigger>
            </TabsList>

            <TabsContent value="kept">
              {keptPromises.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {keptPromises.map((promise) => (
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
            </TabsContent>

            <TabsContent value="broken">
              {brokenPromises.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {brokenPromises.map((promise) => (
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
            </TabsContent>

            <TabsContent value="progress">
              {inProgressPromises.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {inProgressPromises.map((promise) => (
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
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gray-900 dark:bg-gray-800">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            {t.tip.title}
          </h2>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            {t.tip.subtitle}
          </p>
          <Button asChild size="lg" variant="secondary">
            <Link to="/submit-tip">
              <Send className="mr-2 h-4 w-4" />
              {t.home.submitTip}
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
