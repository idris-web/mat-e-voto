import { Link } from "react-router";
import { Calendar, ExternalLink } from "lucide-react";
import { Card, CardHeader, CardContent, CardFooter } from "~/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "~/components/ui/avatar";
import { PromiseStatusBadge } from "./promise-status-badge";
import { PartyBadge } from "~/components/parties/party-badge";
import { formatShortDate, getInitials, truncate } from "~/lib/utils";
import type { PromiseStatus, SourceType } from "@prisma/client";

interface PromiseCardProps {
  promise: {
    id: string;
    slug: string;
    summary: string;
    status: PromiseStatus;
    datePromised: string | Date;
    sourceType: SourceType;
    politician?: {
      name: string;
      slug: string;
      photoUrl?: string | null;
      position?: string | null;
      party?: {
        shortName: string;
        color?: string | null;
      } | null;
    } | null;
    topic?: {
      name: string;
      slug: string;
      icon?: string | null;
    } | null;
  };
  locale?: string;
}

export function PromiseCard({ promise, locale = "sq" }: PromiseCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow h-full flex flex-col">
      <CardHeader className="flex flex-row items-start gap-4 pb-3">
        {promise.politician && (
          <Link to={`/politicians/${promise.politician.slug}`}>
            <Avatar className="h-12 w-12">
              {promise.politician.photoUrl ? (
                <AvatarImage
                  src={promise.politician.photoUrl}
                  alt={promise.politician.name}
                />
              ) : null}
              <AvatarFallback>
                {getInitials(promise.politician.name)}
              </AvatarFallback>
            </Avatar>
          </Link>
        )}
        <div className="flex-1 min-w-0">
          {promise.politician && (
            <>
              <Link
                to={`/politicians/${promise.politician.slug}`}
                className="font-semibold text-gray-900 dark:text-white hover:underline block truncate"
              >
                {promise.politician.name}
              </Link>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                {promise.politician.party && (
                  <PartyBadge party={promise.politician.party} size="sm" />
                )}
                {promise.politician.position && (
                  <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {promise.politician.position}
                  </span>
                )}
              </div>
            </>
          )}
        </div>
        <PromiseStatusBadge status={promise.status} size="sm" locale={locale} />
      </CardHeader>

      <CardContent className="flex-1">
        <Link to={`/promises/${promise.slug}`}>
          <p className="text-gray-700 dark:text-gray-300 line-clamp-3 hover:text-gray-900 dark:hover:text-white transition-colors">
            {truncate(promise.summary, 150)}
          </p>
        </Link>
      </CardContent>

      <CardFooter className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400 pt-3 border-t border-gray-100 dark:border-gray-800">
        {promise.topic && (
          <Link
            to={`/topics/${promise.topic.slug}`}
            className="flex items-center gap-1 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            {promise.topic.icon && <span>{promise.topic.icon}</span>}
            <span className="truncate max-w-[120px]">{promise.topic.name}</span>
          </Link>
        )}
        <div className="flex items-center gap-1">
          <Calendar className="h-3.5 w-3.5" />
          <time dateTime={new Date(promise.datePromised).toISOString()}>
            {formatShortDate(promise.datePromised, locale)}
          </time>
        </div>
      </CardFooter>
    </Card>
  );
}
