"use client";

import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Cell, Pie, PieChart } from "recharts";
import { ShieldAlert, FolderOpen, ShieldCheck, AlertOctagon } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { KpiCard } from "@/components/shared/kpi-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { RISK_CASES_DATA } from "@/lib/mock/generate";
import { formatDate, formatNumber } from "@/lib/format";

const PIE_COLORS: Record<string, string> = {
  critical: "var(--chart-5)",
  high: "var(--chart-4)",
  medium: "var(--chart-3)",
  low: "var(--chart-2)",
};

export default function RiskDashboardPage() {
  const openCases = RISK_CASES_DATA.filter((c) => c.status === "open" || c.status === "reviewing").length;
  const criticalCases = RISK_CASES_DATA.filter((c) => c.riskScore === "critical").length;
  const resolvedThisWeek = RISK_CASES_DATA.filter((c) => c.status === "resolved").length;
  const totalCases = RISK_CASES_DATA.length;

  const distribution = useMemo(() => {
    const map = new Map<string, number>();
    for (const c of RISK_CASES_DATA) map.set(c.riskScore, (map.get(c.riskScore) ?? 0) + 1);
    return Array.from(map, ([name, value]) => ({ name, value }));
  }, []);

  const recentCases = useMemo(
    () => [...RISK_CASES_DATA].sort((a, b) => +new Date(b.detectedAt) - +new Date(a.detectedAt)).slice(0, 10),
    []
  );

  return (
    <div className="space-y-6">
      <PageHeader title="Risk Dashboard" description="Marketplace-wide fraud and risk case overview" />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <KpiCard label="Open Cases" value={formatNumber(openCases)} icon={FolderOpen} tone="orange" />
        <KpiCard label="Critical Cases" value={formatNumber(criticalCases)} icon={AlertOctagon} tone="red" />
        <KpiCard label="Resolved This Week" value={formatNumber(resolvedThisWeek)} icon={ShieldCheck} tone="green" />
        <KpiCard label="Total Cases" value={formatNumber(totalCases)} icon={ShieldAlert} tone="blue" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader><CardTitle>Risk Score Distribution</CardTitle></CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="mx-auto aspect-square max-h-[240px]">
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                <Pie data={distribution} dataKey="value" nameKey="name" innerRadius={50} strokeWidth={4}>
                  {distribution.map((d, i) => (
                    <Cell key={i} fill={PIE_COLORS[d.name] ?? "var(--chart-1)"} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
            <div className="mt-2 space-y-1 text-xs">
              {distribution.map((d) => (
                <div key={d.name} className="flex items-center gap-1.5 capitalize">
                  <span className="size-2 rounded-full" style={{ background: PIE_COLORS[d.name] }} />
                  <span className="text-muted-foreground">{d.name}: {d.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Recent Cases</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Entity</TableHead>
                  <TableHead>Risk</TableHead>
                  <TableHead>Detected</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentCases.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="whitespace-nowrap">{c.type}</TableCell>
                    <TableCell className="whitespace-nowrap">{c.entityName}</TableCell>
                    <TableCell><StatusBadge status={c.riskScore} /></TableCell>
                    <TableCell className="whitespace-nowrap">{formatDate(c.detectedAt)}</TableCell>
                    <TableCell><StatusBadge status={c.status} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
