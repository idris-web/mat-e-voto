import { CheckCircle, XCircle, Clock, AlertCircle, HelpCircle, Scale } from "lucide-react";
import { Card, CardContent } from "~/components/ui/card";
import { Progress } from "~/components/ui/progress";
import { calculatePercentage, cn } from "~/lib/utils";
import type { Translations } from "~/locales";

interface StatsOverviewProps {
  stats: {
    total: number;
    kept: number;
    broken: number;
    inProgress: number;
    stalled: number;
    compromise: number;
    notRated: number;
  };
  t: Translations;
}

export function StatsOverview({ stats, t }: StatsOverviewProps) {
  const keptPercentage = calculatePercentage(stats.kept, stats.total);
  const brokenPercentage = calculatePercentage(stats.broken, stats.total);
  const inProgressPercentage = calculatePercentage(stats.inProgress, stats.total);

  const statCards = [
    {
      label: t.stats.totalPromises,
      value: stats.total,
      icon: HelpCircle,
      color: "text-gray-600 dark:text-gray-400",
      bgColor: "bg-gray-100 dark:bg-gray-800",
    },
    {
      label: t.stats.keptPromises,
      value: stats.kept,
      icon: CheckCircle,
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-100 dark:bg-green-900/30",
      percentage: keptPercentage,
    },
    {
      label: t.stats.brokenPromises,
      value: stats.broken,
      icon: XCircle,
      color: "text-red-600 dark:text-red-400",
      bgColor: "bg-red-100 dark:bg-red-900/30",
      percentage: brokenPercentage,
    },
    {
      label: t.stats.inProgress,
      value: stats.inProgress,
      icon: Clock,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-100 dark:bg-blue-900/30",
      percentage: inProgressPercentage,
    },
    {
      label: t.stats.stalled,
      value: stats.stalled,
      icon: AlertCircle,
      color: "text-yellow-600 dark:text-yellow-400",
      bgColor: "bg-yellow-100 dark:bg-yellow-900/30",
    },
    {
      label: t.stats.compromise,
      value: stats.compromise,
      icon: Scale,
      color: "text-orange-600 dark:text-orange-400",
      bgColor: "bg-orange-100 dark:bg-orange-900/30",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {statCards.map((stat, index) => (
        <Card key={index}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className={cn("p-2 rounded-lg", stat.bgColor)}>
                <stat.icon className={cn("h-5 w-5", stat.color)} />
              </div>
              {stat.percentage !== undefined && (
                <span className={cn("text-sm font-medium", stat.color)}>
                  {stat.percentage}%
                </span>
              )}
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {stat.value}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {stat.label}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
