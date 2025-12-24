import { Link, useOutletContext } from "react-router";
import type { Route } from "./+types/index";
import { statements, parties } from "~/lib/data";
import { Button } from "~/components/ui/button";
import {
  ArrowRight,
  MessageSquare,
  BarChart2,
  Users,
  Lock,
  Clock,
  ChevronRight,
} from "lucide-react";
import type { Translations, Locale } from "~/locales";
import { motion } from "framer-motion";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "mat-e-voto" },
    {
      name: "description",
      content:
        "Find which political party best matches your views with our voting advice application",
    },
  ];
}

export function loader({}: Route.LoaderArgs) {
  const statementCount = statements.filter(s => s.isActive).length;
  const partyCount = parties.length;
  return { statementCount, partyCount };
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
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

export default function VAAWelcome({ loaderData }: Route.ComponentProps) {
  const { statementCount, partyCount } = loaderData;
  const { t, locale } = useOutletContext<{ t: Translations; locale: Locale }>();

  const steps = [
    {
      icon: MessageSquare,
      title: locale === "sq" ? "Përgjigju" : locale === "sr" ? "Odgovori" : "Answer",
      description:
        locale === "sq"
          ? "Thuaj çka mendon për tema të ndryshme"
          : locale === "sr"
          ? "Reci sta mislis o raznim temama"
          : "Tell us what you think about different topics",
    },
    {
      icon: BarChart2,
      title: locale === "sq" ? "Përzgjidh" : locale === "sr" ? "Odaberi" : "Pick",
      description:
        locale === "sq"
          ? "Cila temë të intereson më shumë?"
          : locale === "sr"
          ? "Koja tema te najvise zanima?"
          : "Which topics matter most to you?",
    },
    {
      icon: Users,
      title: locale === "sq" ? "Shiko" : locale === "sr" ? "Pogledaj" : "See",
      description:
        locale === "sq"
          ? "Shiko cila parti mendon si ti"
          : locale === "sr"
          ? "Vidi koja partija misli kao ti"
          : "See which party thinks like you",
    },
  ];

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#0A0A0A]">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Subtle gradient orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-100 dark:bg-blue-950/20 rounded-full blur-3xl opacity-60" />
        <div className="absolute top-20 right-1/4 w-80 h-80 bg-violet-100 dark:bg-violet-950/20 rounded-full blur-3xl opacity-40" />

        <div className="container mx-auto px-4 pt-32 pb-20 relative">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-2xl mx-auto text-center"
          >
            <motion.div variants={itemVariants}>
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-sm text-gray-600 dark:text-gray-400 mb-8 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                {locale === "sq"
                  ? `${statementCount} pyetje • ${partyCount} parti`
                  : locale === "sr"
                  ? `${statementCount} pitanja • ${partyCount} partija`
                  : `${statementCount} questions • ${partyCount} parties`}
              </span>
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight text-gray-900 dark:text-white mb-6"
            >
              {locale === "sq"
                ? "Cila parti të përshtatet?"
                : locale === "sr"
                ? "Koja partija ti odgovara?"
                : "Which party fits you?"}
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="text-lg sm:text-xl text-gray-500 dark:text-gray-400 mb-10 max-w-lg mx-auto leading-relaxed"
            >
              {locale === "sq"
                ? "Përgjigju disa pyetjeve dhe shiko cila parti mendon njësoj si ti."
                : locale === "sr"
                ? "Odgovori na par pitanja i vidi koja partija misli kao ti."
                : "Answer a few questions and see which party thinks like you."}
            </motion.p>

            <motion.div variants={itemVariants}>
              {statementCount === 0 ? (
                <div className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 text-sm">
                  <Clock className="h-4 w-4" />
                  {locale === "sq"
                    ? "Së shpejti"
                    : locale === "sr"
                    ? "Uskoro"
                    : "Coming soon"}
                </div>
              ) : (
                <Link to="/questionnaire">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      size="lg"
                      className="h-14 px-8 text-base font-medium bg-gray-900 hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100 rounded-xl shadow-lg shadow-gray-900/10 dark:shadow-black/20"
                    >
                      {locale === "sq"
                        ? "Fillo"
                        : locale === "sr"
                        ? "Pocni"
                        : "Start"}
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </motion.div>
                </Link>
              )}
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="flex items-center justify-center gap-6 mt-8 text-sm text-gray-400"
            >
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                ~10 min
              </span>
              <span className="flex items-center gap-1.5">
                <Lock className="h-4 w-4" />
                {locale === "sq" ? "Anonim" : locale === "sr" ? "Anonimno" : "Anonymous"}
              </span>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* How it works */}
      <div className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          <div className="text-center mb-12">
            <h2 className="text-sm font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">
              {locale === "sq"
                ? "3 hapa të thjeshtë"
                : locale === "sr"
                ? "3 jednostavna koraka"
                : "3 simple steps"}
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group"
              >
                <div className="relative p-6 rounded-2xl bg-white dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 hover:border-gray-200 dark:hover:border-white/10 transition-all duration-300 hover:shadow-lg hover:shadow-gray-100/50 dark:hover:shadow-none">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gray-50 dark:bg-white/5 text-gray-600 dark:text-gray-400 group-hover:bg-gray-900 group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-gray-900 transition-colors duration-300">
                      <step.icon className="h-5 w-5" />
                    </div>
                    <span className="text-xs font-medium text-gray-300 dark:text-gray-600">
                      0{index + 1}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Privacy Section */}
      <div className="container mx-auto px-4 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto"
        >
          <div className="relative p-8 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100/50 dark:from-white/[0.02] dark:to-white/[0.01] border border-gray-100 dark:border-white/5">
            <div className="flex items-start gap-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex-shrink-0">
                <Lock className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {locale === "sq"
                    ? "100% anonim"
                    : locale === "sr"
                    ? "100% anonimno"
                    : "100% anonymous"}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                  {locale === "sq"
                    ? "Asgjë nuk ruhet. Mbyll faqen dhe gjithçka fshihet."
                    : locale === "sr"
                    ? "Nista se ne cuva. Zatvori stranicu i sve se brise."
                    : "Nothing is saved. Close the page and everything is gone."}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* CTA Section */}
      {statementCount > 0 && (
        <div className="container mx-auto px-4 pb-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-xl mx-auto text-center"
          >
            <Link to="/questionnaire">
              <motion.div
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="group p-6 rounded-2xl bg-gray-900 dark:bg-white cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="text-left">
                    <p className="text-white dark:text-gray-900 font-medium mb-1">
                      {locale === "sq"
                        ? "Fillo tani"
                        : locale === "sr"
                        ? "Pocni sad"
                        : "Start now"}
                    </p>
                    <p className="text-gray-400 dark:text-gray-600 text-sm">
                      {locale === "sq"
                        ? "~10 minuta"
                        : locale === "sr"
                        ? "~10 minuta"
                        : "~10 minutes"}
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-white dark:bg-gray-900 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <ChevronRight className="h-5 w-5 text-gray-900 dark:text-white" />
                  </div>
                </div>
              </motion.div>
            </Link>
          </motion.div>
        </div>
      )}
    </div>
  );
}
