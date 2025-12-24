import { Link, useOutletContext, useSearchParams } from "react-router";
import type { Route } from "./+types/index";
import { db } from "~/lib/db.server";
import { PromiseCard } from "~/components/promises/promise-card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Card, CardContent } from "~/components/ui/card";
import { Search, X } from "lucide-react";
import { PROMISE_STATUS_CONFIG } from "~/lib/constants";
import type { PromiseStatus } from "@prisma/client";
import type { Translations, Locale } from "~/locales";
import type { AuthUser } from "~/lib/auth.server";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Promises - Premtimet" },
    { name: "description", content: "Browse all political promises" },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const status = url.searchParams.get("status") as PromiseStatus | null;
  const topicId = url.searchParams.get("topic");
  const partyId = url.searchParams.get("party");
  const search = url.searchParams.get("q");
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = 12;

  const where: any = {};

  if (status) {
    where.status = status;
  }
  if (topicId) {
    where.topicId = topicId;
  }
  if (partyId) {
    where.partyId = partyId;
  }
  if (search) {
    where.OR = [
      { summary: { contains: search, mode: "insensitive" } },
      { textOriginal: { contains: search, mode: "insensitive" } },
      { politician: { name: { contains: search, mode: "insensitive" } } },
    ];
  }

  const [promises, totalCount, topics, parties] = await Promise.all([
    db.promise.findMany({
      where,
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
    db.promise.count({ where }),
    db.topic.findMany({ orderBy: { name: "asc" } }),
    db.party.findMany({ orderBy: { shortName: "asc" } }),
  ]);

  const totalPages = Math.ceil(totalCount / limit);

  return {
    promises,
    totalCount,
    totalPages,
    currentPage: page,
    topics,
    parties,
    filters: { status, topicId, partyId, search },
  };
}

export default function PromisesIndex({ loaderData }: Route.ComponentProps) {
  const { promises, totalCount, totalPages, currentPage, topics, parties, filters } =
    loaderData;
  const [searchParams, setSearchParams] = useSearchParams();
  const { t, locale } = useOutletContext<{
    t: Translations;
    locale: Locale;
    user: AuthUser | null;
  }>();

  const updateFilter = (key: string, value: string | null) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    newParams.set("page", "1");
    setSearchParams(newParams);
  };

  const clearFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  const hasFilters =
    filters.status || filters.topicId || filters.partyId || filters.search;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {t.promises.title}
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          {t.promises.subtitle}
        </p>
      </div>

      {/* Filters */}
      <div className="mb-8 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="search"
            placeholder={t.promises.searchPlaceholder}
            className="pl-10"
            defaultValue={filters.search || ""}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                updateFilter("q", e.currentTarget.value || null);
              }
            }}
          />
        </div>

        {/* Filter Selects */}
        <div className="flex flex-wrap gap-3">
          {/* Status */}
          <Select
            value={filters.status || ""}
            onValueChange={(v) => updateFilter("status", v || null)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={t.promises.allStatuses} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">{t.promises.allStatuses}</SelectItem>
              {Object.entries(PROMISE_STATUS_CONFIG).map(([key, config]) => (
                <SelectItem key={key} value={key}>
                  {locale === "en" ? config.labelEn : config.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Topic */}
          <Select
            value={filters.topicId || ""}
            onValueChange={(v) => updateFilter("topic", v || null)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={t.promises.allTopics} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">{t.promises.allTopics}</SelectItem>
              {topics.map((topic) => (
                <SelectItem key={topic.id} value={topic.id}>
                  {topic.icon} {locale === "en" ? topic.nameEn : topic.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Party */}
          <Select
            value={filters.partyId || ""}
            onValueChange={(v) => updateFilter("party", v || null)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={t.promises.allParties} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">{t.promises.allParties}</SelectItem>
              {parties.map((party) => (
                <SelectItem key={party.id} value={party.id}>
                  {party.shortName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Clear Filters */}
          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="h-4 w-4 mr-1" />
              {t.actions.clearFilters}
            </Button>
          )}
        </div>
      </div>

      {/* Results count */}
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        {totalCount} {t.stats.totalPromises.toLowerCase()}
      </p>

      {/* Promises Grid */}
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
            onClick={() => updateFilter("page", String(currentPage - 1))}
          >
            {t.actions.previous}
          </Button>
          <span className="flex items-center px-4 text-sm text-gray-600 dark:text-gray-400">
            {currentPage} / {totalPages}
          </span>
          <Button
            variant="outline"
            disabled={currentPage >= totalPages}
            onClick={() => updateFilter("page", String(currentPage + 1))}
          >
            {t.actions.next}
          </Button>
        </div>
      )}
    </div>
  );
}
