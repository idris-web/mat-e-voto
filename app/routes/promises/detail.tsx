import { Link, useOutletContext } from "react-router";
import type { Route } from "./+types/detail";
import { db } from "~/lib/db.server";
import { PromiseStatusBadge } from "~/components/promises/promise-status-badge";
import { PartyBadge } from "~/components/parties/party-badge";
import { Avatar, AvatarImage, AvatarFallback } from "~/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import {
  Calendar,
  ExternalLink,
  Archive,
  FileText,
  ArrowLeft,
  Clock,
} from "lucide-react";
import { formatDate, getInitials } from "~/lib/utils";
import { SOURCE_TYPE_LABELS, EVIDENCE_TYPE_LABELS } from "~/lib/constants";
import type { Translations, Locale } from "~/locales";
import type { AuthUser } from "~/lib/auth.server";

export function meta({ data }: Route.MetaArgs) {
  if (!data?.promise) {
    return [{ title: "Promise Not Found - Premtimet" }];
  }
  return [
    { title: `${data.promise.summary} - Premtimet` },
    { name: "description", content: data.promise.summary },
  ];
}

export async function loader({ params }: Route.LoaderArgs) {
  const promise = await db.promise.findUnique({
    where: { slug: params.slug },
    include: {
      politician: {
        include: { party: true },
      },
      party: true,
      topic: true,
      evidence: {
        orderBy: { createdAt: "desc" },
        include: {
          addedBy: {
            select: { name: true },
          },
        },
      },
      statusHistory: {
        orderBy: { createdAt: "desc" },
        include: {
          changedBy: {
            select: { name: true },
          },
        },
      },
    },
  });

  if (!promise) {
    throw new Response("Not Found", { status: 404 });
  }

  // Increment view count
  await db.promise.update({
    where: { id: promise.id },
    data: { viewCount: { increment: 1 } },
  });

  return { promise };
}

export default function PromiseDetail({ loaderData }: Route.ComponentProps) {
  const { promise } = loaderData;
  const { t, locale } = useOutletContext<{
    t: Translations;
    locale: Locale;
    user: AuthUser | null;
  }>();

  const sourceTypeLabel =
    SOURCE_TYPE_LABELS[promise.sourceType]?.[locale as keyof typeof SOURCE_TYPE_LABELS["CAMPAIGN_SPEECH"]] ||
    promise.sourceType;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Button */}
      <Button asChild variant="ghost" className="mb-6">
        <Link to="/promises">
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t.actions.back}
        </Link>
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Promise Card */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  {promise.politician && (
                    <Link to={`/politicians/${promise.politician.slug}`}>
                      <Avatar className="h-16 w-16">
                        {promise.politician.photoUrl ? (
                          <AvatarImage
                            src={promise.politician.photoUrl}
                            alt={promise.politician.name}
                          />
                        ) : null}
                        <AvatarFallback className="text-lg">
                          {getInitials(promise.politician.name)}
                        </AvatarFallback>
                      </Avatar>
                    </Link>
                  )}
                  <div>
                    {promise.politician && (
                      <>
                        <Link
                          to={`/politicians/${promise.politician.slug}`}
                          className="text-xl font-semibold hover:underline"
                        >
                          {promise.politician.name}
                        </Link>
                        <div className="flex items-center gap-2 mt-1">
                          {promise.politician.party && (
                            <PartyBadge party={promise.politician.party} />
                          )}
                          {promise.politician.currentPosition && (
                            <span className="text-sm text-gray-500">
                              {promise.politician.currentPosition}
                            </span>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>
                <PromiseStatusBadge
                  status={promise.status}
                  size="lg"
                  locale={locale}
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Summary */}
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {promise.summary}
                </h1>
              </div>

              {/* Original Quote */}
              <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border-l-4 border-gray-300 dark:border-gray-700">
                <p className="text-gray-700 dark:text-gray-300 italic">
                  "{promise.textOriginal}"
                </p>
                {promise.textEnglish && locale === "en" && (
                  <p className="mt-2 text-gray-500 dark:text-gray-400 text-sm">
                    Translation: "{promise.textEnglish}"
                  </p>
                )}
              </div>

              {/* Context */}
              {promise.context && (
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    {t.promises.context}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {promise.context}
                  </p>
                </div>
              )}

              {/* Meta Info */}
              <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {t.promises.datePromised}:{" "}
                  {formatDate(promise.datePromised, locale)}
                </div>
                <div className="flex items-center gap-1">
                  <FileText className="h-4 w-4" />
                  {sourceTypeLabel}
                </div>
              </div>

              {/* Source Links */}
              <div className="flex flex-wrap gap-3">
                <Button asChild variant="outline" size="sm">
                  <a
                    href={promise.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    {t.promises.source}
                  </a>
                </Button>
                {promise.archiveUrl && (
                  <Button asChild variant="outline" size="sm">
                    <a
                      href={promise.archiveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Archive className="h-4 w-4 mr-2" />
                      {t.promises.archiveLink}
                    </a>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Evidence */}
          <Card>
            <CardHeader>
              <CardTitle>{t.promises.evidence}</CardTitle>
            </CardHeader>
            <CardContent>
              {promise.evidence.length > 0 ? (
                <div className="space-y-4">
                  {promise.evidence.map((evidence) => {
                    const evidenceTypeLabel =
                      EVIDENCE_TYPE_LABELS[evidence.type]?.[
                        locale as keyof typeof EVIDENCE_TYPE_LABELS["LEGISLATION"]
                      ] || evidence.type;

                    return (
                      <div
                        key={evidence.id}
                        className="border-b border-gray-100 dark:border-gray-800 pb-4 last:border-0"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-medium">{evidence.title}</h4>
                            <Badge variant="secondary" className="mt-1">
                              {evidenceTypeLabel}
                            </Badge>
                          </div>
                          <span className="text-sm text-gray-500">
                            {formatDate(evidence.createdAt, locale)}
                          </span>
                        </div>
                        <p className="mt-2 text-gray-600 dark:text-gray-400 text-sm">
                          {evidence.description}
                        </p>
                        <a
                          href={evidence.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 mt-2 text-sm text-blue-600 hover:underline"
                        >
                          <ExternalLink className="h-3 w-3" />
                          {t.promises.source}
                        </a>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                  No evidence available yet
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Topic */}
          {promise.topic && (
            <Card>
              <CardContent className="pt-6">
                <Link
                  to={`/topics/${promise.topic.slug}`}
                  className="flex items-center gap-3 hover:text-gray-900 dark:hover:text-white"
                >
                  <span className="text-3xl">{promise.topic.icon}</span>
                  <div>
                    <p className="font-medium">
                      {locale === "en" ? promise.topic.nameEn : promise.topic.name}
                    </p>
                    <p className="text-sm text-gray-500">Topic</p>
                  </div>
                </Link>
              </CardContent>
            </Card>
          )}

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                {t.promises.timeline}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {promise.statusHistory.length > 0 ? (
                <div className="space-y-4">
                  {promise.statusHistory.map((change) => (
                    <div
                      key={change.id}
                      className="relative pl-6 before:absolute before:left-0 before:top-2 before:h-full before:w-px before:bg-gray-200 dark:before:bg-gray-700"
                    >
                      <div className="absolute left-0 top-2 w-2 h-2 rounded-full bg-gray-400 -translate-x-[3px]" />
                      <div className="text-sm">
                        <p className="font-medium">
                          {change.oldStatus} → {change.newStatus}
                        </p>
                        <p className="text-gray-500 text-xs mt-1">
                          {formatDate(change.createdAt, locale)}
                        </p>
                        <p className="text-gray-600 dark:text-gray-400 mt-2">
                          {change.justification}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                  No status changes yet
                </p>
              )}
            </CardContent>
          </Card>

          {/* Last Updated */}
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-gray-500">
                {t.promises.lastUpdated}:{" "}
                <span className="font-medium">
                  {formatDate(promise.updatedAt, locale)}
                </span>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
