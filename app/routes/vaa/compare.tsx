import { Link, useSearchParams, useOutletContext } from "react-router";
import type { Route } from "./+types/compare";
import { db } from "~/lib/db.server";
import { Button } from "~/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { ArrowLeft, Check, Minus, X, SkipForward, Home } from "lucide-react";
import { decodeVAAResults } from "~/lib/vaa-state";
import type { UserAnswer } from "~/lib/vaa-algorithm.server";
import type { Translations, Locale } from "~/locales";
import { cn } from "~/lib/utils";
import { useState } from "react";
import { motion } from "framer-motion";
import { TopicIcon, getTopicColors } from "~/components/topic-icon";

export function meta({}: Route.MetaArgs) {
  return [{ title: "mat-e-voto" }];
}

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const encodedData = url.searchParams.get("data");

  if (!encodedData) {
    return { error: "no_data", statements: [], parties: [], topics: [], userAnswers: {} };
  }

  const decoded = decodeVAAResults(encodedData);
  if (!decoded) {
    return { error: "invalid_data", statements: [], parties: [], topics: [], userAnswers: {} };
  }

  const { answers } = decoded;

  const [statements, parties, positions, topics] = await Promise.all([
    db.statement.findMany({
      where: { isActive: true },
      orderBy: [{ topic: { name: "asc" } }, { order: "asc" }],
      include: { topic: true },
    }),
    db.party.findMany({
      orderBy: { name: "asc" },
    }),
    db.partyPosition.findMany(),
    db.topic.findMany({
      orderBy: { name: "asc" },
    }),
  ]);

  const positionMap: Record<string, Record<string, string>> = {};
  for (const pos of positions) {
    if (!positionMap[pos.statementId]) {
      positionMap[pos.statementId] = {};
    }
    positionMap[pos.statementId][pos.partyId] = pos.position;
  }

  return {
    error: null,
    statements,
    parties,
    topics,
    userAnswers: answers,
    positionMap,
  };
}

const ANSWER_CONFIG: Record<string, { icon: typeof Check; label: Record<string, string> }> = {
  AGREE: {
    icon: Check,
    label: { sq: "Dakord", sr: "Slaze se", en: "Agree" },
  },
  NEUTRAL: {
    icon: Minus,
    label: { sq: "Neutral", sr: "Neutralan", en: "Neutral" },
  },
  DISAGREE: {
    icon: X,
    label: { sq: "Kunder", sr: "Protiv", en: "Disagree" },
  },
  SKIP: {
    icon: SkipForward,
    label: { sq: "Kaluar", sr: "Preskoceno", en: "Skipped" },
  },
};

export default function VAACompare({ loaderData }: Route.ComponentProps) {
  const { error, statements, parties, topics, userAnswers, positionMap } = loaderData;
  const { t, locale } = useOutletContext<{ t: Translations; locale: Locale }>();
  const [searchParams] = useSearchParams();
  const encodedData = searchParams.get("data");

  const [selectedParties, setSelectedParties] = useState<string[]>(
    parties.slice(0, 3).map((p) => p.id)
  );
  const [filterTopic, setFilterTopic] = useState<string>("all");

  const getUserAnswer = (statementId: string): UserAnswer | undefined => {
    if (!userAnswers || typeof userAnswers !== "object") return undefined;
    return (userAnswers as Record<string, UserAnswer>)[statementId];
  };

  const getPartyPosition = (statementId: string, partyId: string): string | undefined => {
    if (!positionMap) return undefined;
    return positionMap[statementId]?.[partyId];
  };

  if (error) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#0A0A0A] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md mx-auto px-4"
        >
          <p className="text-gray-500 mb-4">
            {locale === "sq"
              ? "Nuk ka te dhena per krahasim."
              : locale === "sr"
              ? "Nema podataka za poredjenje."
              : "No data for comparison."}
          </p>
          <Link to="/">
            <Button className="gap-2 bg-gray-900 hover:bg-gray-800 dark:bg-white dark:text-gray-900">
              <Home className="h-4 w-4" />
              {locale === "sq" ? "Kthehu" : locale === "sr" ? "Nazad" : "Go back"}
            </Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  const filteredStatements =
    filterTopic === "all"
      ? statements
      : statements.filter((s) => s.topicId === filterTopic);

  const toggleParty = (partyId: string) => {
    if (selectedParties.includes(partyId)) {
      if (selectedParties.length > 1) {
        setSelectedParties(selectedParties.filter((id) => id !== partyId));
      }
    } else if (selectedParties.length < 4) {
      setSelectedParties([...selectedParties, partyId]);
    }
  };

  const getMatchStatus = (userAnswer: string, partyPosition: string) => {
    if (!partyPosition || userAnswer === "SKIP") return "neutral";
    if (userAnswer === partyPosition) return "match";
    if (userAnswer === "NEUTRAL" || partyPosition === "NEUTRAL") return "partial";
    return "mismatch";
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#0A0A0A]">
      <div className="container mx-auto px-4 py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-6xl mx-auto"
        >
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Link to={`/results?data=${encodedData}`}>
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-gray-100 dark:hover:bg-white/5">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                {locale === "sq"
                  ? "Krahasimi i detajuar"
                  : locale === "sr"
                  ? "Detaljna usporedba"
                  : "Detailed comparison"}
              </h1>
              <p className="text-sm text-gray-500">
                {locale === "sq"
                  ? "Krahasoni pergjigjet tuaja me pozicionet e partive"
                  : locale === "sr"
                  ? "Uporedite vase odgovore sa pozicijama partija"
                  : "Compare your answers with party positions"}
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="p-4 rounded-xl bg-white dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 mb-6">
            <div className="flex flex-wrap items-center gap-6">
              {/* Party Selection */}
              <div className="flex-1 min-w-[200px]">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
                  {locale === "sq"
                    ? "Partite (max 4)"
                    : locale === "sr"
                    ? "Partije (max 4)"
                    : "Parties (max 4)"}
                </p>
                <div className="flex flex-wrap gap-2">
                  {parties.map((party) => (
                    <button
                      key={party.id}
                      onClick={() => toggleParty(party.id)}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                        selectedParties.includes(party.id)
                          ? "text-white"
                          : "bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10"
                      )}
                      style={{
                        backgroundColor: selectedParties.includes(party.id)
                          ? party.color
                          : undefined,
                      }}
                    >
                      {party.shortName}
                    </button>
                  ))}
                </div>
              </div>

              {/* Topic Filter */}
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
                  {locale === "sq"
                    ? "Tema"
                    : locale === "sr"
                    ? "Tema"
                    : "Topic"}
                </p>
                <Select value={filterTopic} onValueChange={setFilterTopic}>
                  <SelectTrigger className="w-[180px] rounded-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      {locale === "sq"
                        ? "Te gjitha"
                        : locale === "sr"
                        ? "Sve"
                        : "All topics"}
                    </SelectItem>
                    {topics.map((topic) => (
                      <SelectItem key={topic.id} value={topic.id}>
                        <div className="flex items-center gap-2">
                          <TopicIcon topic={topic} size="sm" />
                          <span>{locale === "en" && topic.nameEn ? topic.nameEn : topic.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Comparison Table */}
          <div className="rounded-xl bg-white dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-white/5">
                    <th className="text-left p-4 font-medium text-sm text-gray-500 sticky left-0 bg-white dark:bg-[#0A0A0A] min-w-[280px]">
                      {locale === "sq"
                        ? "Deklarata"
                        : locale === "sr"
                        ? "Izjava"
                        : "Statement"}
                    </th>
                    <th className="text-center p-4 font-medium text-sm text-gray-500 min-w-[100px]">
                      {locale === "sq" ? "Ti" : locale === "sr" ? "Vi" : "You"}
                    </th>
                    {selectedParties.map((partyId) => {
                      const party = parties.find((p) => p.id === partyId);
                      return (
                        <th key={partyId} className="text-center p-4 min-w-[100px]">
                          <div className="flex flex-col items-center gap-1">
                            <div
                              className="w-6 h-6 rounded-lg"
                              style={{ backgroundColor: party?.color }}
                            />
                            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                              {party?.shortName}
                            </span>
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                  {filteredStatements.map((statement) => {
                    const userAnswer = getUserAnswer(statement.id);
                    const topicColors = getTopicColors(statement.topic.slug);
                    return (
                      <tr
                        key={statement.id}
                        className="hover:bg-gray-50 dark:hover:bg-white/[0.01]"
                      >
                        <td className="p-4 sticky left-0 bg-white dark:bg-[#0A0A0A]">
                          <div className="flex items-start gap-3">
                            <div className={cn("p-1.5 rounded-lg", topicColors.bg)}>
                              <TopicIcon topic={statement.topic} size="sm" className={topicColors.text} />
                            </div>
                            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                              {locale === "en" && statement.textEn
                                ? statement.textEn
                                : statement.text}
                            </p>
                          </div>
                        </td>
                        <td className="p-4 text-center">
                          {userAnswer && <AnswerBadge answer={userAnswer} locale={locale} />}
                        </td>
                        {selectedParties.map((partyId) => {
                          const partyPosition = getPartyPosition(statement.id, partyId);
                          const matchStatus = getMatchStatus(userAnswer || "", partyPosition || "");
                          return (
                            <td
                              key={partyId}
                              className={cn(
                                "p-4 text-center",
                                matchStatus === "match" && "bg-emerald-50 dark:bg-emerald-900/10",
                                matchStatus === "mismatch" && "bg-rose-50 dark:bg-rose-900/10"
                              )}
                            >
                              {partyPosition ? (
                                <AnswerBadge
                                  answer={partyPosition as UserAnswer}
                                  locale={locale}
                                />
                              ) : (
                                <span className="text-gray-300 text-xs">—</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Legend */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-emerald-100 dark:bg-emerald-900/30" />
              <span>
                {locale === "sq" ? "Perputhet" : locale === "sr" ? "Poklapanje" : "Match"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-rose-100 dark:bg-rose-900/30" />
              <span>
                {locale === "sq" ? "Nuk perputhet" : locale === "sr" ? "Nema poklapanja" : "No match"}
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function AnswerBadge({ answer, locale }: { answer: UserAnswer; locale: string }) {
  const config = ANSWER_CONFIG[answer];
  if (!config) return null;

  const Icon = config.icon;
  const colors = {
    AGREE: "text-emerald-600 dark:text-emerald-400",
    DISAGREE: "text-rose-600 dark:text-rose-400",
    NEUTRAL: "text-amber-600 dark:text-amber-400",
    SKIP: "text-gray-400",
  };

  return (
    <div className={cn("flex items-center justify-center gap-1", colors[answer])}>
      <Icon className="h-4 w-4" />
      <span className="text-xs hidden sm:inline">
        {config.label[locale] || config.label.en}
      </span>
    </div>
  );
}
