"use client";

import { useMemo } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

function monthLabel(monthsAgo: number) {
  const d = new Date();
  d.setMonth(d.getMonth() - monthsAgo);
  return d.toLocaleDateString("en-IN", { month: "short", year: "2-digit" });
}

export default function CohortAnalysisPage() {
  const cohorts = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => {
      const monthsAgo = 5 - i;
      const cells = Array.from({ length: 6 }, (_, m) => {
        if (m > monthsAgo) return null;
        const base = 100 - m * (12 + Math.random() * 6);
        return Math.max(8, Math.round(base));
      });
      return { label: monthLabel(monthsAgo), cells };
    });
  }, []);

  function bg(v: number | null) {
    if (v === null) return "transparent";
    const alpha = Math.max(0.08, v / 100);
    return `color-mix(in oklch, var(--chart-1) ${Math.round(alpha * 100)}%, transparent)`;
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Cohort Analysis" description="Customer retention by signup month cohort" />

      <Card>
        <CardHeader>
          <CardTitle>Retention Heatmap</CardTitle>
          <CardDescription>% of cohort customers who placed an order in each subsequent month</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] border-collapse text-sm">
              <thead>
                <tr>
                  <th className="p-2 text-left font-medium text-muted-foreground">Cohort</th>
                  {Array.from({ length: 6 }, (_, i) => (
                    <th key={i} className="p-2 text-center font-medium text-muted-foreground">Month {i}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {cohorts.map((c) => (
                  <tr key={c.label}>
                    <td className="p-2 font-medium whitespace-nowrap">{c.label}</td>
                    {c.cells.map((v, i) => (
                      <td key={i} className="p-1">
                        <div
                          className="flex h-10 items-center justify-center rounded-md text-xs font-medium"
                          style={{ background: bg(v), color: v && v > 55 ? "var(--foreground)" : undefined }}
                        >
                          {v !== null ? `${v}%` : ""}
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
