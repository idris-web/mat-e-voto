import { Link, useOutletContext } from "react-router";
import type { Route } from "./+types/index";
import { db } from "~/lib/db.server";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { ArrowRight } from "lucide-react";
import type { Translations, Locale } from "~/locales";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Topics - Premtimet" },
    { name: "description", content: "Browse promises by topic" },
  ];
}

export async function loader({}: Route.LoaderArgs) {
  const topics = await db.topic.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: { promises: true },
      },
    },
  });

  return { topics };
}

export default function TopicsIndex({ loaderData }: Route.ComponentProps) {
  const { topics } = loaderData;
  const { t, locale } = useOutletContext<{
    t: Translations;
    locale: Locale;
  }>();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {t.topics.title}
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          {t.topics.subtitle}
        </p>
      </div>

      {topics.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {topics.map((topic) => (
            <Card
              key={topic.id}
              className="hover:shadow-lg transition-shadow"
            >
              <CardHeader className="text-center">
                {topic.icon && (
                  <span className="text-5xl mb-2">{topic.icon}</span>
                )}
                <CardTitle>
                  <Link
                    to={`/topics/${topic.slug}`}
                    className="hover:underline"
                  >
                    {locale === "en" ? topic.nameEn : topic.name}
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {topic._count.promises}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t.nav.promises.toLowerCase()}
                </p>
                <Button asChild variant="ghost" size="sm" className="mt-4">
                  <Link to={`/topics/${topic.slug}`}>
                    {t.actions.viewDetails}
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
            {t.topics.noResults}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
