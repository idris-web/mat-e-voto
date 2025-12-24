import type { PromiseStatus } from "@prisma/client";

export const PROMISE_STATUS_CONFIG: Record<
  PromiseStatus,
  {
    label: string;
    labelEn: string;
    color: string;
    bgClass: string;
    textClass: string;
    borderClass: string;
  }
> = {
  NOT_YET_RATED: {
    label: "Ende pa vleresuar",
    labelEn: "Not Yet Rated",
    color: "gray",
    bgClass: "bg-gray-100 dark:bg-gray-800",
    textClass: "text-gray-700 dark:text-gray-300",
    borderClass: "border-gray-300 dark:border-gray-600",
  },
  IN_THE_WORKS: {
    label: "Ne proces",
    labelEn: "In the Works",
    color: "blue",
    bgClass: "bg-blue-100 dark:bg-blue-900/30",
    textClass: "text-blue-700 dark:text-blue-300",
    borderClass: "border-blue-300 dark:border-blue-600",
  },
  STALLED: {
    label: "I ngecur",
    labelEn: "Stalled",
    color: "yellow",
    bgClass: "bg-yellow-100 dark:bg-yellow-900/30",
    textClass: "text-yellow-700 dark:text-yellow-300",
    borderClass: "border-yellow-300 dark:border-yellow-600",
  },
  COMPROMISE: {
    label: "Kompromis",
    labelEn: "Compromise",
    color: "orange",
    bgClass: "bg-orange-100 dark:bg-orange-900/30",
    textClass: "text-orange-700 dark:text-orange-300",
    borderClass: "border-orange-300 dark:border-orange-600",
  },
  PROMISE_KEPT: {
    label: "Premtim i mbajtur",
    labelEn: "Promise Kept",
    color: "green",
    bgClass: "bg-green-100 dark:bg-green-900/30",
    textClass: "text-green-700 dark:text-green-300",
    borderClass: "border-green-300 dark:border-green-600",
  },
  PROMISE_BROKEN: {
    label: "Premtim i thyer",
    labelEn: "Promise Broken",
    color: "red",
    bgClass: "bg-red-100 dark:bg-red-900/30",
    textClass: "text-red-700 dark:text-red-300",
    borderClass: "border-red-300 dark:border-red-600",
  },
};

export const PARTY_COLORS: Record<string, string> = {
  VV: "#E31E24",
  LDK: "#003399",
  PDK: "#FDB913",
  AAK: "#009639",
  NISMA: "#00AEEF",
  AKR: "#8B0000",
  LVV: "#E31E24",
};

export const SUPPORTED_LANGUAGES = ["sq", "sr", "en"] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];
export const DEFAULT_LANGUAGE: SupportedLanguage = "sq";

export const LANGUAGE_NAMES: Record<SupportedLanguage, { name: string; flag: string }> = {
  sq: { name: "Shqip", flag: "🇽🇰" },
  sr: { name: "Srpski", flag: "🇷🇸" },
  en: { name: "English", flag: "🇬🇧" },
};

export const SOURCE_TYPE_LABELS: Record<string, { sq: string; sr: string; en: string }> = {
  CAMPAIGN_SPEECH: { sq: "Fjalim elektoral", sr: "Predizborni govor", en: "Campaign Speech" },
  INTERVIEW: { sq: "Interviste", sr: "Intervju", en: "Interview" },
  SOCIAL_MEDIA: { sq: "Rrjete sociale", sr: "Drustvene mreze", en: "Social Media" },
  PARTY_PROGRAM: { sq: "Program partiak", sr: "Stranacki program", en: "Party Program" },
  PARLIAMENT_SESSION: { sq: "Seance parlamentare", sr: "Parlamentarna sesija", en: "Parliament Session" },
  PRESS_CONFERENCE: { sq: "Konference shtypi", sr: "Konferencija za stampu", en: "Press Conference" },
  OFFICIAL_DOCUMENT: { sq: "Dokument zyrtar", sr: "Sluzbeni dokument", en: "Official Document" },
  OTHER: { sq: "Tjeter", sr: "Ostalo", en: "Other" },
};

export const EVIDENCE_TYPE_LABELS: Record<string, { sq: string; sr: string; en: string }> = {
  LEGISLATION: { sq: "Legjislacion", sr: "Zakonodavstvo", en: "Legislation" },
  BUDGET_ALLOCATION: { sq: "Alokimi buxhetor", sr: "Budzetska alokacija", en: "Budget Allocation" },
  NEWS_ARTICLE: { sq: "Artikull lajmi", sr: "Novinski clanak", en: "News Article" },
  OFFICIAL_STATISTICS: { sq: "Statistika zyrtare", sr: "Zvanicna statistika", en: "Official Statistics" },
  GOVERNMENT_REPORT: { sq: "Raport qeveritar", sr: "Vladni izvestaj", en: "Government Report" },
  EXPERT_ANALYSIS: { sq: "Analize ekspertesh", sr: "Strucna analiza", en: "Expert Analysis" },
  OTHER: { sq: "Tjeter", sr: "Ostalo", en: "Other" },
};
