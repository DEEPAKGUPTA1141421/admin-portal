"use client";

import { useMemo } from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import { IndianRupee, Wallet, RotateCcw, TrendingUp } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { KpiCard } from "@/components/shared/kpi-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { SETTLEMENTS_DATA } from "@/lib/mock/generate";
import { formatINR } from "@/lib/format";

const revenueConfig = {
  grossRevenue: { label: "Gross Revenue", color: "var(--chart-1)" },
  netPayable: { label: "Net Payable", color: "var(--chart-2)" },
} satisfies ChartConfig;

export default function RevenuePage() {
  const kpis = useMemo(() => {
    const totalGmv = SETTLEMENTS_DATA.reduce((s, x) => s + x.grossRevenue, 0);
    const platformRevenue = SETTLEMENTS_DATA.reduce((s, x) => s + x.commission + x.shippingFee, 0);
    const totalPayable = SETTLEMENTS_DATA.reduce((s, x) => s + x.netPayable, 0);
    const totalRefunds = SETTLEMENTS_DATA.reduce((s, x) => s + x.refunds, 0);
    return { totalGmv, platformRevenue, totalPayable, totalRefunds };
  }, []);

  const series = useMemo(() => {
    const buckets = new Map<string, { date: string; grossRevenue: number; netPayable: number; order: number }>();
    for (const s of SETTLEMENTS_DATA) {
      const d = new Date(s.periodStart);
      const key = d.toLocaleString("en-IN", { month: "short", year: "2-digit" });
      const order = d.getFullYear() * 12 + d.getMonth();
      const bucket = buckets.get(key) ?? { date: key, grossRevenue: 0, netPayable: 0, order };
      bucket.grossRevenue += s.grossRevenue;
      bucket.netPayable += s.netPayable;
      buckets.set(key, bucket);
    }
    return Array.from(buckets.values()).sort((a, b) => a.order - b.order);
  }, []);

  const topSellers = useMemo(() => {
    const map = new Map<string, number>();
    for (const s of SETTLEMENTS_DATA) {
      map.set(s.sellerName, (map.get(s.sellerName) ?? 0) + s.grossRevenue);
    }
    return Array.from(map.entries())
      .map(([sellerName, revenue]) => ({ sellerName, revenue }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader title="Revenue" description="Marketplace-wide GMV, platform revenue and seller payables" />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <KpiCard label="Total GMV" value={formatINR(kpis.totalGmv, true)} icon={IndianRupee} tone="blue" />
        <KpiCard label="Platform Revenue" value={formatINR(kpis.platformRevenue, true)} icon={TrendingUp} tone="green" />
        <KpiCard label="Total Payable to Sellers" value={formatINR(kpis.totalPayable, true)} icon={Wallet} tone="orange" />
        <KpiCard label="Total Refunds" value={formatINR(kpis.totalRefunds, true)} icon={RotateCcw} tone="red" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Revenue Over Time</CardTitle>
          <CardDescription>Gross revenue vs net payable to sellers, grouped by settlement period month</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={revenueConfig} className="h-[300px] w-full">
            <AreaChart data={series}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} />
              <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
              <Area dataKey="grossRevenue" type="monotone" fill="var(--color-grossRevenue)" fillOpacity={0.15} stroke="var(--color-grossRevenue)" strokeWidth={2} />
              <Area dataKey="netPayable" type="monotone" fill="var(--color-netPayable)" fillOpacity={0.15} stroke="var(--color-netPayable)" strokeWidth={2} />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Top Sellers by Revenue</CardTitle>
          <CardDescription>Top 10 sellers ranked by total gross revenue across all settlement periods</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">#</TableHead>
                <TableHead>Seller</TableHead>
                <TableHead className="text-right">Gross Revenue</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topSellers.map((s, i) => (
                <TableRow key={s.sellerName}>
                  <TableCell className="text-muted-foreground">{i + 1}</TableCell>
                  <TableCell className="font-medium">{s.sellerName}</TableCell>
                  <TableCell className="text-right">{formatINR(s.revenue)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
