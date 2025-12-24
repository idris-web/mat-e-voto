import { useOutletContext } from "react-router";
import type { Route } from "./+types/methodology";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { PromiseStatusBadge } from "~/components/promises/promise-status-badge";
import { PROMISE_STATUS_CONFIG } from "~/lib/constants";
import type { PromiseStatus } from "@prisma/client";
import type { Translations, Locale } from "~/locales";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Methodology - Premtimet" },
    { name: "description", content: "How we rate political promises" },
  ];
}

export default function Methodology() {
  const { t, locale } = useOutletContext<{
    t: Translations;
    locale: Locale;
  }>();

  const statuses: PromiseStatus[] = [
    "NOT_YET_RATED",
    "IN_THE_WORKS",
    "STALLED",
    "COMPROMISE",
    "PROMISE_KEPT",
    "PROMISE_BROKEN",
  ];

  const statusDescriptions: Record<PromiseStatus, { sq: string; en: string; sr: string }> = {
    NOT_YET_RATED: {
      sq: "Premtimi ende nuk eshte vleresuar per shkak te muneses se desmive te mjaftueshme.",
      en: "The promise has not yet been rated due to insufficient evidence.",
      sr: "Obecanje jos nije ocenjeno zbog nedostatka dovoljno dokaza.",
    },
    IN_THE_WORKS: {
      sq: "Ka deshmi qe qeveria ose politikani po punon aktivisht per te permbushur premtimin.",
      en: "There is evidence that the government or politician is actively working to fulfill the promise.",
      sr: "Postoje dokazi da vlada ili politicar aktivno radi na ispunjavanju obecanja.",
    },
    STALLED: {
      sq: "Puna per premtimin ka ndaluar ose nuk ka pasur progres te konsiderueshem per nje kohe te gjate.",
      en: "Work on the promise has stopped or there has been no significant progress for an extended period.",
      sr: "Rad na obecanju je zaustavljen ili nije bilo znacajnog napretka duze vreme.",
    },
    COMPROMISE: {
      sq: "Premtimi eshte permbushur pjeserisht ose ne nje forme te modifikuar nga premtimi origjinal.",
      en: "The promise has been partially fulfilled or fulfilled in a modified form from the original promise.",
      sr: "Obecanje je delimicno ispunjeno ili ispunjeno u modifikovanom obliku u odnosu na originalno obecanje.",
    },
    PROMISE_KEPT: {
      sq: "Premtimi eshte permbushur plotesisht sic eshte premtuar.",
      en: "The promise has been fully fulfilled as promised.",
      sr: "Obecanje je u potpunosti ispunjeno kako je obecano.",
    },
    PROMISE_BROKEN: {
      sq: "Premtimi nuk eshte permbushur dhe nuk ka me shanse qe te permbushet.",
      en: "The promise has not been fulfilled and there is no longer any chance it will be fulfilled.",
      sr: "Obecanje nije ispunjeno i vise nema sanse da ce biti ispunjeno.",
    },
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          {t.methodology.title}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          {t.methodology.subtitle}
        </p>

        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>{t.methodology.ratingCriteria}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {statuses.map((status) => {
                const config = PROMISE_STATUS_CONFIG[status];
                return (
                  <div key={status} className="flex gap-4">
                    <div className="flex-shrink-0">
                      <PromiseStatusBadge status={status} locale={locale} />
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      {statusDescriptions[status][locale as keyof typeof statusDescriptions["NOT_YET_RATED"]] ||
                        statusDescriptions[status].en}
                    </p>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t.methodology.sourcesTitle}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400">
                {t.methodology.sourcesText}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
