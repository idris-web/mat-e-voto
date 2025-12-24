import { useNavigate, useOutletContext } from "react-router";
import type { Route } from "./+types/questionnaire";
import { db } from "~/lib/db.server";
import { Button } from "~/components/ui/button";
import { Switch } from "~/components/ui/switch";
import { Label } from "~/components/ui/label";
import {
  ArrowLeft,
  Check,
  Minus,
  X,
  SkipForward,
  Home,
  Bookmark,
} from "lucide-react";
import { useState, useEffect } from "react";
import {
  loadVAAState,
  saveVAAState,
  getInitialState,
  encodeVAAResults,
  type VAAState,
} from "~/lib/vaa-state";
import type { UserAnswer } from "~/lib/vaa-algorithm.server";
import type { Translations, Locale } from "~/locales";
import { cn } from "~/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { TopicIcon, getTopicColors } from "~/components/topic-icon";

export function meta({}: Route.MetaArgs) {
  return [{ title: "mat-e-voto" }];
}

export async function loader({}: Route.LoaderArgs) {
  const statements = await db.statement.findMany({
    where: { isActive: true },
    orderBy: [{ topic: { name: "asc" } }, { order: "asc" }],
    include: { topic: true },
  });

  return { statements };
}

const cardVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 100 : -100,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30,
    },
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 100 : -100,
    opacity: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30,
    },
  }),
};

export default function VAAQuestionnaire({ loaderData }: Route.ComponentProps) {
  const { statements } = loaderData;
  const { t, locale } = useOutletContext<{ t: Translations; locale: Locale }>();
  const navigate = useNavigate();

  const [state, setState] = useState<VAAState | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    setIsClient(true);
    const saved = loadVAAState();
    if (saved && Object.keys(saved.answers).length > 0) {
      setState(saved);
    } else {
      setState(getInitialState());
    }
  }, []);

  useEffect(() => {
    if (state && isClient) {
      saveVAAState(state);
    }
  }, [state, isClient]);

  if (!isClient || !state) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#0A0A0A] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-gray-200 border-t-gray-900 dark:border-gray-700 dark:border-t-gray-100 rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (statements.length === 0) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#0A0A0A] flex items-center justify-center">
        <div className="text-center px-4">
          <p className="text-gray-500 mb-4">No statements available.</p>
          <Button onClick={() => navigate("/")} variant="outline">
            <Home className="h-4 w-4 mr-2" />
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  const currentStatement = statements[state.currentIndex];
  const progress = ((state.currentIndex) / statements.length) * 100;
  const currentAnswer = state.answers[currentStatement?.id];
  const topicImportant = state.topicImportance[currentStatement?.topicId] || false;
  const topicColors = getTopicColors(currentStatement?.topic?.slug);

  const handleAnswer = (answer: UserAnswer) => {
    if (!currentStatement) return;

    const newAnswers = { ...state.answers, [currentStatement.id]: answer };
    const newIndex = state.currentIndex + 1;

    if (newIndex >= statements.length) {
      const encoded = encodeVAAResults(newAnswers, state.topicImportance);
      navigate(`/results?data=${encoded}`);
    } else {
      setDirection(1);
      setState({
        ...state,
        answers: newAnswers,
        currentIndex: newIndex,
      });
    }
  };

  const handlePrevious = () => {
    if (state.currentIndex > 0) {
      setDirection(-1);
      setState({
        ...state,
        currentIndex: state.currentIndex - 1,
      });
    }
  };

  const handleTopicImportance = (checked: boolean) => {
    if (!currentStatement) return;
    setState({
      ...state,
      topicImportance: {
        ...state.topicImportance,
        [currentStatement.topicId]: checked,
      },
    });
  };

  const getStatementText = () => {
    if (!currentStatement) return "";
    if (locale === "en" && currentStatement.textEn) return currentStatement.textEn;
    if (locale === "sr" && currentStatement.textSr) return currentStatement.textSr;
    return currentStatement.text;
  };

  const getTopicName = () => {
    if (!currentStatement) return "";
    if (locale === "en" && currentStatement.topic.nameEn)
      return currentStatement.topic.nameEn;
    return currentStatement.topic.name;
  };

  const answerButtons = [
    {
      value: "AGREE" as UserAnswer,
      icon: Check,
      label: locale === "sq" ? "Dakord" : locale === "sr" ? "Slazem se" : "Agree",
      activeClass: "bg-emerald-600 text-white border-emerald-600",
      hoverClass: "hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-700 dark:hover:bg-emerald-950/30",
    },
    {
      value: "DISAGREE" as UserAnswer,
      icon: X,
      label: locale === "sq" ? "Kunder" : locale === "sr" ? "Protiv" : "Disagree",
      activeClass: "bg-rose-600 text-white border-rose-600",
      hoverClass: "hover:bg-rose-50 hover:border-rose-300 hover:text-rose-700 dark:hover:bg-rose-950/30",
    },
    {
      value: "NEUTRAL" as UserAnswer,
      icon: Minus,
      label: locale === "sq" ? "Neutral" : locale === "sr" ? "Neutralno" : "Neutral",
      activeClass: "bg-amber-500 text-white border-amber-500",
      hoverClass: "hover:bg-amber-50 hover:border-amber-300 hover:text-amber-700 dark:hover:bg-amber-950/30",
    },
    {
      value: "SKIP" as UserAnswer,
      icon: SkipForward,
      label: locale === "sq" ? "Kalo" : locale === "sr" ? "Preskoci" : "Skip",
      activeClass: "bg-gray-500 text-white border-gray-500",
      hoverClass: "hover:bg-gray-100 hover:border-gray-300 dark:hover:bg-gray-800",
    },
  ];

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#0A0A0A]">
      {/* Progress bar - fixed at top */}
      <div className="fixed top-16 left-0 right-0 z-40 bg-[#FAFAFA]/80 dark:bg-[#0A0A0A]/80 backdrop-blur-sm border-b border-gray-100 dark:border-white/5">
        <div className="container mx-auto px-4 py-3">
          <div className="max-w-xl mx-auto">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-500">
                {state.currentIndex + 1} / {statements.length}
              </span>
              <span className="text-xs font-medium text-gray-900 dark:text-white">
                {Math.round(progress)}%
              </span>
            </div>
            <div className="h-1 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gray-900 dark:bg-white rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ type: "spring", stiffness: 100, damping: 20 }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 pt-36 pb-20">
        <div className="max-w-xl mx-auto">
          {/* Statement Card */}
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentStatement.id}
              custom={direction}
              variants={cardVariants}
              initial="enter"
              animate="center"
              exit="exit"
            >
              {/* Topic Badge */}
              <div className="flex items-center gap-3 mb-6">
                <div className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-lg border",
                  topicColors.bg,
                  topicColors.text,
                  topicColors.border
                )}>
                  <TopicIcon topic={currentStatement.topic} size="sm" />
                  <span className="text-sm font-medium">{getTopicName()}</span>
                </div>
              </div>

              {/* Statement Text */}
              <h2 className="text-2xl sm:text-3xl font-medium text-gray-900 dark:text-white leading-relaxed mb-10">
                {getStatementText()}
              </h2>

              {/* Answer Buttons */}
              <div className="grid grid-cols-2 gap-3 mb-8">
                {answerButtons.map((btn) => (
                  <motion.button
                    key={btn.value}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => handleAnswer(btn.value)}
                    className={cn(
                      "flex items-center justify-center gap-2 h-14 rounded-xl border-2 font-medium transition-all duration-200",
                      currentAnswer === btn.value
                        ? btn.activeClass
                        : "border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 " + btn.hoverClass
                    )}
                  >
                    <btn.icon className="h-5 w-5" />
                    <span>{btn.label}</span>
                  </motion.button>
                ))}
              </div>

              {/* Topic Importance Toggle */}
              <div className={cn(
                "flex items-center gap-3 p-4 rounded-xl border transition-all duration-200",
                topicImportant
                  ? "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800"
                  : "bg-gray-50 dark:bg-white/[0.02] border-gray-100 dark:border-white/5"
              )}>
                <Switch
                  id="importance"
                  checked={topicImportant}
                  onCheckedChange={handleTopicImportance}
                />
                <Label htmlFor="importance" className="text-sm cursor-pointer flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  {topicImportant && <Bookmark className="h-4 w-4 text-amber-500 fill-amber-500" />}
                  {locale === "sq"
                    ? "Kjo teme eshte e rendesishme per mua"
                    : locale === "sr"
                    ? "Ova tema mi je vazna"
                    : "This topic is important to me"}
                </Label>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-12">
            <Button
              variant="ghost"
              onClick={handlePrevious}
              disabled={state.currentIndex === 0}
              className="gap-2 text-gray-500"
            >
              <ArrowLeft className="h-4 w-4" />
              {locale === "sq" ? "Mbrapa" : locale === "sr" ? "Nazad" : "Back"}
            </Button>

            <Button
              variant="ghost"
              onClick={() => navigate("/")}
              className="gap-2 text-gray-400"
            >
              <X className="h-4 w-4" />
              {locale === "sq" ? "Anulo" : locale === "sr" ? "Otkazi" : "Cancel"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
