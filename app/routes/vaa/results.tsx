import { Link, useSearchParams, useOutletContext } from "react-router";
import type { Route } from "./+types/results";
import { statements as allStatements, parties, topics, getAllPositions } from "~/lib/data";
import { Button } from "~/components/ui/button";
import {
  RefreshCw,
  ArrowRight,
  Trophy,
  Home,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  calculateMatches,
  prepareCalculationInput,
  type UserAnswer,
} from "~/lib/vaa-algorithm.server";
import { decodeVAAResults, clearVAAState } from "~/lib/vaa-state";
import type { Translations, Locale } from "~/locales";
import { cn } from "~/lib/utils";
import { motion } from "framer-motion";
import { useState } from "react";
import { TopicIcon, getTopicColors } from "~/components/topic-icon";

export function meta({}: Route.MetaArgs) {
  return [{ title: "mat-e-voto" }];
}

export function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const encodedData = url.searchParams.get("data");

  if (!encodedData) {
    return { error: "no_data", results: null, parties: [], topics: [] };
  }

  const decoded = decodeVAAResults(encodedData);
  if (!decoded) {
    return { error: "invalid_data", results: null, parties: [], topics: [] };
  }

  const { answers, topicImportance } = decoded;

  const statements = allStatements.filter(s => s.isActive).map(s => ({ id: s.id, topicId: s.topicId }));
  const positions = getAllPositions();

  const input = prepareCalculationInput(
    answers as Record<string, UserAnswer>,
    topicImportance,
    statements,
    positions
  );

  const results = calculateMatches(input);

  const enrichedResults = results.map((result) => {
    const party = parties.find((p) => p.id === result.partyId);
    const topicBreakdown = Array.from(result.topicBreakdown.entries()).map(
      ([topicId, score]) => {
        const topic = topics.find((t) => t.id === topicId);
        return {
          topicId,
          topicSlug: topic?.slug || "",
          topicName: topic?.name || "",
          topicNameEn: topic?.nameEn || "",
          ...score,
        };
      }
    );

    return {
      ...result,
      party,
      topicBreakdown,
    };
  });

  return {
    error: null,
    results: enrichedResults,
    parties,
    topics,
    answeredCount: Object.keys(answers).length,
  };
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 120,
      damping: 20,
    },
  },
};

export default function VAAResults({ loaderData }: Route.ComponentProps) {
  const { error, results, answeredCount } = loaderData;
  const { t, locale } = useOutletContext<{ t: Translations; locale: Locale }>();
  const [searchParams] = useSearchParams();
  const encodedData = searchParams.get("data");
  const [expandedParty, setExpandedParty] = useState<string | null>(null);

  if (error === "no_data" || error === "invalid_data") {
    return (
      <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#0A0A0A] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md mx-auto px-4"
        >
          <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-white/5 flex items-center justify-center mx-auto mb-6">
            <Home className="h-8 w-8 text-gray-400" />
          </div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {locale === "sq"
              ? "Nuk ka rezultate"
              : locale === "sr"
              ? "Nema rezultata"
              : "No results found"}
          </h1>
          <p className="text-gray-500 mb-6 text-sm">
            {locale === "sq"
              ? "Ju lutemi plotesoni pyetesorin per te marre rezultatet."
              : locale === "sr"
              ? "Molimo popunite upitnik da dobijete rezultate."
              : "Please complete the questionnaire to get your results."}
          </p>
          <Link to="/">
            <Button className="bg-gray-900 hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100">
              {locale === "sq"
                ? "Fillo Testin"
                : locale === "sr"
                ? "Zapocni test"
                : "Start Quiz"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  const handleRetake = () => {
    clearVAAState();
  };

  const topParty = results?.[0];

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#0A0A0A]">
      <div className="container mx-auto px-4 py-24">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-2xl mx-auto"
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-sm font-medium mb-6">
              <Trophy className="h-4 w-4" />
              {locale === "sq"
                ? "Rezultatet tuaja"
                : locale === "sr"
                ? "Vasi rezultati"
                : "Your results"}
            </div>
            <h1 className="text-3xl sm:text-4xl font-semibold text-gray-900 dark:text-white mb-3">
              {locale === "sq"
                ? "Perputhet me"
                : locale === "sr"
                ? "Poklapanje sa"
                : "You match with"}
            </h1>
            <p className="text-gray-500 text-sm">
              {locale === "sq"
                ? `Bazuar ne ${answeredCount} pergjigjet tuaja`
                : locale === "sr"
                ? `Na osnovu ${answeredCount} vasih odgovora`
                : `Based on your ${answeredCount} answers`}
            </p>
          </motion.div>

          {/* Top Match */}
          {topParty && (
            <motion.div variants={itemVariants} className="mb-6">
              <div className="relative p-6 rounded-2xl bg-white dark:bg-white/[0.02] border border-gray-100 dark:border-white/5">
                <div className="absolute -top-3 left-6">
                  <span className="px-3 py-1 rounded-full bg-emerald-500 text-white text-xs font-medium">
                    #1
                  </span>
                </div>

                <div className="flex items-center gap-5 mb-6">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-bold text-xl"
                    style={{ backgroundColor: topParty.party?.color || "#666" }}
                  >
                    {topParty.party?.shortName?.slice(0, 2)}
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {topParty.party?.name}
                    </h2>
                    <p className="text-sm text-gray-500">{topParty.party?.shortName}</p>
                  </div>
                  <div className="text-right">
                    <motion.span
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.3 }}
                      className="text-4xl font-bold text-emerald-600 dark:text-emerald-400"
                    >
                      {topParty.matchPercentage}%
                    </motion.span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="h-2 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden mb-6">
                  <motion.div
                    className="h-full bg-emerald-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${topParty.matchPercentage}%` }}
                    transition={{ delay: 0.2, duration: 0.8, type: "spring" }}
                  />
                </div>

                {/* Topic breakdown */}
                {topParty.topicBreakdown.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {topParty.topicBreakdown.map((topic, i) => {
                      const colors = getTopicColors(topic.topicSlug);
                      return (
                        <motion.div
                          key={topic.topicId}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.4 + i * 0.05 }}
                          className={cn("p-3 rounded-xl border", colors.bg, colors.border)}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <TopicIcon topic={{ slug: topic.topicSlug }} size="sm" className={colors.text} />
                            <span className="text-xs font-medium text-gray-600 dark:text-gray-400 truncate">
                              {locale === "en" && topic.topicNameEn
                                ? topic.topicNameEn
                                : topic.topicName}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
                              <motion.div
                                className="h-full bg-current rounded-full"
                                style={{ color: "currentColor" }}
                                initial={{ width: 0 }}
                                animate={{ width: `${topic.percentage}%` }}
                                transition={{ delay: 0.5 + i * 0.05 }}
                              />
                            </div>
                            <span className="text-xs font-medium text-gray-500">
                              {topic.percentage}%
                            </span>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Other Results */}
          <div className="space-y-3 mb-12">
            {results?.slice(1).map((result, index) => (
              <motion.div
                key={result.partyId}
                variants={itemVariants}
              >
                <div
                  className="p-4 rounded-xl bg-white dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 cursor-pointer hover:border-gray-200 dark:hover:border-white/10 transition-colors"
                  onClick={() => setExpandedParty(expandedParty === result.partyId ? null : result.partyId)}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium text-gray-400 w-6">
                      #{index + 2}
                    </span>
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-semibold text-sm"
                      style={{ backgroundColor: result.party?.color || "#666" }}
                    >
                      {result.party?.shortName?.slice(0, 2)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white truncate">
                        {result.party?.name}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-24 h-1.5 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                          className={cn(
                            "h-full rounded-full",
                            result.matchPercentage >= 60 ? "bg-emerald-500" :
                            result.matchPercentage >= 40 ? "bg-amber-500" : "bg-gray-400"
                          )}
                          initial={{ width: 0 }}
                          animate={{ width: `${result.matchPercentage}%` }}
                          transition={{ delay: 0.2 + index * 0.1 }}
                        />
                      </div>
                      <span className={cn(
                        "text-lg font-semibold min-w-[48px] text-right",
                        result.matchPercentage >= 60 ? "text-emerald-600 dark:text-emerald-400" :
                        result.matchPercentage >= 40 ? "text-amber-600 dark:text-amber-400" : "text-gray-500"
                      )}>
                        {result.matchPercentage}%
                      </span>
                      {expandedParty === result.partyId ? (
                        <ChevronUp className="h-4 w-4 text-gray-400" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                  </div>

                  {/* Expanded topic breakdown */}
                  {expandedParty === result.partyId && result.topicBreakdown.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 pt-4 border-t border-gray-100 dark:border-white/5"
                    >
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {result.topicBreakdown.map((topic) => {
                          const colors = getTopicColors(topic.topicSlug);
                          return (
                            <div key={topic.topicId} className={cn("p-2 rounded-lg", colors.bg)}>
                              <div className="flex items-center gap-1.5 mb-1">
                                <TopicIcon topic={{ slug: topic.topicSlug }} size="sm" className={colors.text} />
                                <span className="text-xs text-gray-500 truncate">
                                  {locale === "en" && topic.topicNameEn
                                    ? topic.topicNameEn
                                    : topic.topicName}
                                </span>
                              </div>
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                {topic.percentage}%
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Actions */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <Link to={`/compare?data=${encodedData}`}>
              <Button variant="outline" className="w-full sm:w-auto gap-2 rounded-xl h-12 px-6">
                {locale === "sq"
                  ? "Krahaso ne detaje"
                  : locale === "sr"
                  ? "Detaljno uporedi"
                  : "Compare in detail"}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>

            <Link to="/questionnaire" onClick={handleRetake}>
              <Button variant="ghost" className="w-full sm:w-auto gap-2 text-gray-500">
                <RefreshCw className="h-4 w-4" />
                {locale === "sq"
                  ? "Rifillo testin"
                  : locale === "sr"
                  ? "Ponovi test"
                  : "Retake quiz"}
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
