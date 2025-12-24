import { Link, useOutletContext, useSearchParams } from "react-router";
import type { Route } from "./+types/detail";
import { db } from "~/lib/db.server";
import { PromiseCard } from "~/components/promises/promise-card";
import { Card, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { calculatePercentage } from "~/lib/utils";
import { Progress } from "~/components/ui/progress";
import type { Translations, Locale } from "~/locales";

export function meta({ data }: Route.MetaArgs) {
  if (!data?.topic) {
    return [{ title: "Topic Not Found - Premtimet" }];
  }
  return [
    { title: `${data.topic.name} - Premtimet` },
    { name: "description", content: `Browse promises about ${data.topic.name}` },
  ];
}

export async function loader({ params, request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = 12;

  const topic = await db.topic.findUnique({
    where: { slug: params.slug },
  });

  if (!topic) {
    throw new Response("Not Found", { status: 404 });
  }

  const [promises, totalCount, kept, broken, inProgress] = await Promise.all([
    db.promise.findMany({
      where: { topicId: topic.id },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { updatedAt: "desc" },
      include: {
        politician: {
          include: { party: true },
        },
        topic: true,
      },
    }),
    db.promise.count({ where: { topicId: topic.id } }),
    db.promise.count({ where: { topicId: topic.id, status: "PROMISE_KEPT" } }),
    db.promise.count({ where: { topicId: topic.id, status: "PROMISE_BROKEN" } }),
    db.promise.count({ where: { topicId: topic.id, status: "IN_THE_WORKS" } }),
  ]);

  const totalPages = Math.ceil(totalCount / limit);
  const stats = { total: totalCount, kept, broken, inProgress };

  return { topic, promises, totalCount, totalPages, currentPage: page, stats };
}

export default function TopicDetail({ loaderData }: Route.ComponentProps) {
  const { topic, promises, totalCount, totalPages, currentPage, stats } = loaderData;
  const [searchParams, setSearchParams] = useSearchParams();
  const { t, locale } = useOutletContext<{
    t: Translations;
    locale: Locale;
  }>();

  const keptPercentage = calculatePercentage(stats.kept, stats.total);
  const brokenPercentage = calculatePercentage(stats.broken, stats.total);

  const updatePage = (page: number) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("page", String(page));
    setSearchParams(newParams);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Button asChild variant="ghost" className="mb-6">
        <Link to="/topics">
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t.actions.back}
        </Link>
      </Button>

      {/* Topic Header */}
      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            {topic.icon && (
              <span className="text-6xl">{topic.icon}</span>
            )}
            <div className="text-center md:text-left">
              <h1 className="text-3xl font-bold">
                {locale === "en" ? topic.nameEn : topic.name}
              </h1>
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

      {/* Promises */}
      <h2 className="text-2xl font-bold mb-6">
        {t.nav.promises} ({totalCount})
      </h2>

      {promises.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {promises.map((promise) => (
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex justify-center gap-2">
          <Button
            variant="outline"
            disabled={currentPage <= 1}
            onClick={() => updatePage(currentPage - 1)}
          >
            {t.actions.previous}
          </Button>
          <span className="flex items-center px-4 text-sm text-gray-600 dark:text-gray-400">
            {currentPage} / {totalPages}
          </span>
          <Button
            variant="outline"
            disabled={currentPage >= totalPages}
            onClick={() => updatePage(currentPage + 1)}
          >
            {t.actions.next}
          </Button>
        </div>
      )}
    </div>
  );
}
