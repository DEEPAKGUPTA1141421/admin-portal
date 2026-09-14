"use client";

import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatNumber, formatPct } from "@/lib/format";

const STAGES = [
  { name: "Visit", count: 482000 },
  { name: "Product View", count: 301000 },
  { name: "Add to Cart", count: 96400 },
  { name: "Checkout", count: 58080 },
  { name: "Payment", count: 47200 },
  { name: "Order Placed", count: 41600 },
];

export default function FunnelAnalyticsPage() {
  const max = STAGES[0].count;

  return (
    <div className="space-y-6">
      <PageHeader title="Funnel Analytics" description="Purchase funnel with stage-by-stage drop-off" />

      <Card>
        <CardHeader>
          <CardTitle>Purchase Funnel</CardTitle>
          <CardDescription>Visit → Product View → Add to Cart → Checkout → Payment → Order Placed</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {STAGES.map((s, i) => {
            const widthPct = (s.count / max) * 100;
            const prev = i > 0 ? STAGES[i - 1].count : null;
            const dropoff = prev ? ((prev - s.count) / prev) * 100 : null;
            return (
              <div key={s.name}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="font-medium">{s.name}</span>
                  <span className="text-muted-foreground">
                    {formatNumber(s.count)}
                    {dropoff !== null && <span className="ml-2 text-red-600 dark:text-red-400">-{formatPct(dropoff)} drop-off</span>}
                  </span>
                </div>
                <div className="h-8 w-full rounded-md bg-muted">
                  <div
                    className="flex h-8 items-center justify-end rounded-md bg-primary px-2 text-xs font-medium text-primary-foreground transition-all"
                    style={{ width: `${widthPct}%`, minWidth: "3rem" }}
                  >
                    {formatPct(widthPct)}
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
