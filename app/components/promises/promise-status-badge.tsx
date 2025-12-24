import type { PromiseStatus } from "@prisma/client";
import { Badge } from "~/components/ui/badge";
import { PROMISE_STATUS_CONFIG } from "~/lib/constants";
import { cn } from "~/lib/utils";

interface PromiseStatusBadgeProps {
  status: PromiseStatus;
  size?: "sm" | "md" | "lg";
  locale?: string;
}

export function PromiseStatusBadge({
  status,
  size = "md",
  locale = "sq",
}: PromiseStatusBadgeProps) {
  const config = PROMISE_STATUS_CONFIG[status];
  const label = locale === "en" ? config.labelEn : config.label;

  return (
    <Badge
      className={cn(
        config.bgClass,
        config.textClass,
        "border",
        config.borderClass,
        size === "sm" && "text-xs px-2 py-0.5",
        size === "md" && "text-sm px-3 py-1",
        size === "lg" && "text-base px-4 py-1.5"
      )}
    >
      {label}
    </Badge>
  );
}
