import { Badge } from "~/components/ui/badge";
import { PARTY_COLORS } from "~/lib/constants";
import { cn } from "~/lib/utils";

interface PartyBadgeProps {
  party: {
    shortName: string;
    color?: string | null;
  };
  size?: "sm" | "md";
  showColor?: boolean;
}

export function PartyBadge({
  party,
  size = "md",
  showColor = true,
}: PartyBadgeProps) {
  const color = party.color || PARTY_COLORS[party.shortName] || "#6B7280";

  return (
    <Badge
      variant="outline"
      className={cn(
        "font-medium",
        size === "sm" && "text-xs px-1.5 py-0",
        size === "md" && "text-sm px-2 py-0.5"
      )}
      style={
        showColor
          ? {
              borderColor: color,
              backgroundColor: `${color}15`,
              color: color,
            }
          : undefined
      }
    >
      {party.shortName}
    </Badge>
  );
}
