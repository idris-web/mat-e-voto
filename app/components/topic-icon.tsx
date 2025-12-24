import {
  Banknote,
  Heart,
  GraduationCap,
  Building2,
  Shield,
  Scale,
  Globe,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { cn } from "~/lib/utils";

// Map topic slugs/names to Lucide icons
const topicIconMap: Record<string, LucideIcon> = {
  // By slug
  economy: Banknote,
  ekonomia: Banknote,
  healthcare: Heart,
  shendetesia: Heart,
  education: GraduationCap,
  arsimi: GraduationCap,
  infrastructure: Building2,
  infrastruktura: Building2,
  security: Shield,
  siguria: Shield,
  justice: Scale,
  drejtesia: Scale,
  "foreign-policy": Globe,
  "politika-e-jashtme": Globe,
  energy: Zap,
  energjia: Zap,
};

// Default icon if no match
const DefaultIcon = Building2;

interface TopicIconProps {
  topic: {
    slug?: string;
    name?: string;
    icon?: string;
  };
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

const sizeClasses = {
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-6 w-6",
  xl: "h-8 w-8",
};

export function TopicIcon({ topic, className, size = "md" }: TopicIconProps) {
  // Try to find icon by slug first, then by name
  const slug = topic.slug?.toLowerCase() || "";
  const name = topic.name?.toLowerCase() || "";

  const Icon = topicIconMap[slug] || topicIconMap[name] || DefaultIcon;

  return <Icon className={cn(sizeClasses[size], className)} />;
}

// Topic color classes for consistent theming
export const topicColors: Record<string, { bg: string; text: string; border: string }> = {
  economy: {
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
    text: "text-emerald-600 dark:text-emerald-400",
    border: "border-emerald-200 dark:border-emerald-800",
  },
  ekonomia: {
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
    text: "text-emerald-600 dark:text-emerald-400",
    border: "border-emerald-200 dark:border-emerald-800",
  },
  healthcare: {
    bg: "bg-rose-50 dark:bg-rose-950/30",
    text: "text-rose-600 dark:text-rose-400",
    border: "border-rose-200 dark:border-rose-800",
  },
  shendetesia: {
    bg: "bg-rose-50 dark:bg-rose-950/30",
    text: "text-rose-600 dark:text-rose-400",
    border: "border-rose-200 dark:border-rose-800",
  },
  education: {
    bg: "bg-blue-50 dark:bg-blue-950/30",
    text: "text-blue-600 dark:text-blue-400",
    border: "border-blue-200 dark:border-blue-800",
  },
  arsimi: {
    bg: "bg-blue-50 dark:bg-blue-950/30",
    text: "text-blue-600 dark:text-blue-400",
    border: "border-blue-200 dark:border-blue-800",
  },
  infrastructure: {
    bg: "bg-amber-50 dark:bg-amber-950/30",
    text: "text-amber-600 dark:text-amber-400",
    border: "border-amber-200 dark:border-amber-800",
  },
  infrastruktura: {
    bg: "bg-amber-50 dark:bg-amber-950/30",
    text: "text-amber-600 dark:text-amber-400",
    border: "border-amber-200 dark:border-amber-800",
  },
  security: {
    bg: "bg-slate-50 dark:bg-slate-950/30",
    text: "text-slate-600 dark:text-slate-400",
    border: "border-slate-200 dark:border-slate-800",
  },
  siguria: {
    bg: "bg-slate-50 dark:bg-slate-950/30",
    text: "text-slate-600 dark:text-slate-400",
    border: "border-slate-200 dark:border-slate-800",
  },
  justice: {
    bg: "bg-violet-50 dark:bg-violet-950/30",
    text: "text-violet-600 dark:text-violet-400",
    border: "border-violet-200 dark:border-violet-800",
  },
  drejtesia: {
    bg: "bg-violet-50 dark:bg-violet-950/30",
    text: "text-violet-600 dark:text-violet-400",
    border: "border-violet-200 dark:border-violet-800",
  },
  "foreign-policy": {
    bg: "bg-cyan-50 dark:bg-cyan-950/30",
    text: "text-cyan-600 dark:text-cyan-400",
    border: "border-cyan-200 dark:border-cyan-800",
  },
  "politika-e-jashtme": {
    bg: "bg-cyan-50 dark:bg-cyan-950/30",
    text: "text-cyan-600 dark:text-cyan-400",
    border: "border-cyan-200 dark:border-cyan-800",
  },
  energy: {
    bg: "bg-orange-50 dark:bg-orange-950/30",
    text: "text-orange-600 dark:text-orange-400",
    border: "border-orange-200 dark:border-orange-800",
  },
  energjia: {
    bg: "bg-orange-50 dark:bg-orange-950/30",
    text: "text-orange-600 dark:text-orange-400",
    border: "border-orange-200 dark:border-orange-800",
  },
};

export function getTopicColors(slug?: string) {
  const defaultColors = {
    bg: "bg-gray-50 dark:bg-gray-950/30",
    text: "text-gray-600 dark:text-gray-400",
    border: "border-gray-200 dark:border-gray-800",
  };

  if (!slug) return defaultColors;
  return topicColors[slug.toLowerCase()] || defaultColors;
}
