import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ArrowDownRight, ArrowUpRight, Minus, type LucideIcon } from "lucide-react";

export function KpiCard({
  label,
  value,
  delta,
  trend = "flat",
  icon: Icon,
  tone = "default",
}: {
  label: string;
  value: string;
  delta?: string;
  trend?: "up" | "down" | "flat";
  icon?: LucideIcon;
  tone?: "default" | "green" | "red" | "orange" | "blue";
}) {
  const TrendIcon = trend === "up" ? ArrowUpRight : trend === "down" ? ArrowDownRight : Minus;
  const trendColor =
    trend === "up" ? "text-emerald-600 dark:text-emerald-400" :
    trend === "down" ? "text-red-600 dark:text-red-400" :
    "text-muted-foreground";

  const iconTone: Record<string, string> = {
    default: "bg-muted text-foreground",
    green: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400",
    red: "bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400",
    orange: "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400",
    blue: "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400",
  };

  return (
    <Card className="gap-2 py-4">
      <CardContent className="px-4">
        <div className="flex items-start justify-between">
          <p className="text-sm text-muted-foreground">{label}</p>
          {Icon && (
            <div className={cn("flex size-8 items-center justify-center rounded-md", iconTone[tone])}>
              <Icon className="size-4" />
            </div>
          )}
        </div>
        <p className="mt-2 text-2xl font-semibold tracking-tight">{value}</p>
        {delta && (
          <div className={cn("mt-1 flex items-center gap-1 text-xs font-medium", trendColor)}>
            <TrendIcon className="size-3.5" />
            <span>{delta}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
