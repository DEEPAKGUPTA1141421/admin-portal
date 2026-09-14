import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Tone = "green" | "red" | "orange" | "blue" | "gray" | "purple";

const TONE_CLASSES: Record<Tone, string> = {
  green: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900",
  red: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-900",
  orange: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900",
  blue: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900",
  gray: "bg-muted text-muted-foreground border-border",
  purple: "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/40 dark:text-violet-400 dark:border-violet-900",
};

const STATUS_TONE: Record<string, Tone> = {
  // success
  active: "green", approved: "green", published: "green", delivered: "green",
  paid: "green", captured: "green", resolved: "green", closed: "green",
  success: "green", refunded: "green", completed: "green", live: "green",
  in_stock: "green",
  // danger
  rejected: "red", suspended: "red", cancelled: "red", failed: "red",
  out_of_stock: "red", blocked: "red", disputed: "red", critical: "red",
  chargeback: "red", overdue: "red", reverse_failed: "red",
  // warning
  pending: "orange", pending_approval: "orange", pending_payment: "orange",
  processing: "orange", under_review: "orange", low_stock: "orange",
  escalated: "orange", high: "orange", on_hold: "orange", flagged: "orange",
  documents_pending: "orange", waiting_customer: "orange", waiting_seller: "orange",
  medium: "orange", initiated: "orange", reversed: "orange",
  // info
  draft: "blue", shipped: "blue", packed: "blue", confirmed: "blue",
  ready_to_ship: "blue", out_for_delivery: "blue", scheduled: "blue",
  in_progress: "blue", open: "blue", authorized: "blue", inspection: "blue",
  applied: "blue",
  // neutral
  inactive: "gray", archived: "gray", unpublished: "gray", expired: "gray",
  disabled: "gray", dismissed: "gray", low: "gray",
  // purple
  vip: "purple", urgent: "purple", partially_refunded: "purple",
};

export function StatusBadge({ status, label }: { status: string; label?: string }) {
  const key = status.toLowerCase().replace(/\s+/g, "_");
  const tone = STATUS_TONE[key] ?? "gray";
  const text = label ?? status.replace(/_/g, " ");
  return (
    <Badge
      variant="outline"
      className={cn("capitalize font-medium", TONE_CLASSES[tone])}
    >
      {text}
    </Badge>
  );
}
