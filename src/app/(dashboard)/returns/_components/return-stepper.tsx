import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ReturnStatus } from "@/lib/types";

const STEPS: { key: string; label: string }[] = [
  { key: "requested", label: "Requested" },
  { key: "approved", label: "Approved" },
  { key: "pickup", label: "Pickup" },
  { key: "received", label: "Received" },
  { key: "inspection", label: "Inspection" },
  { key: "refund", label: "Refund" },
];

function stepIndex(status: ReturnStatus): number {
  switch (status) {
    case "requested":
      return 0;
    case "approved":
    case "rejected":
      return 1;
    case "pickup_scheduled":
    case "picked_up":
      return 2;
    case "received":
      return 3;
    case "inspection":
      return 4;
    case "refund_initiated":
      return 5;
    case "refunded":
    case "replacement_shipped":
    case "closed":
      return 5;
    default:
      return 0;
  }
}

export function ReturnStepper({ status }: { status: ReturnStatus }) {
  const current = stepIndex(status);
  const rejected = status === "rejected";
  const done = ["refunded", "replacement_shipped", "closed"].includes(status);

  return (
    <div className="flex items-start">
      {STEPS.map((step, i) => {
        const isRejectedHere = rejected && i === current;
        const isDone = !rejected && (i < current || (i === current && done));
        const isCurrent = i === current && !isDone && !isRejectedHere;
        return (
          <div key={step.key} className="flex flex-1 flex-col items-center last:flex-none">
            <div className="flex w-full items-center">
              <div
                className={cn(
                  "flex size-7 shrink-0 items-center justify-center rounded-full border-2 text-xs font-medium",
                  isRejectedHere && "border-red-500 bg-red-50 text-red-600 dark:bg-red-950/40",
                  isDone && "border-emerald-500 bg-emerald-500 text-white",
                  isCurrent && "border-primary bg-primary/10 text-primary",
                  !isDone && !isCurrent && !isRejectedHere && "border-muted-foreground/25 text-muted-foreground"
                )}
              >
                {isRejectedHere ? <X className="size-3.5" /> : isDone ? <Check className="size-3.5" /> : i + 1}
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={cn(
                    "h-0.5 flex-1",
                    i < current ? "bg-emerald-500" : "bg-muted-foreground/20"
                  )}
                />
              )}
            </div>
            <span className={cn("mt-1.5 text-center text-[11px] leading-tight", isCurrent && "font-medium text-foreground", !isCurrent && "text-muted-foreground")}>
              {step.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
