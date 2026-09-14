"use client";

import { useMemo, useState } from "react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import { IndianRupee, TrendingUp, ShoppingCart, Percent } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { KpiCard } from "@/components/shared/kpi-card";
import { DateRangeFilter } from "@/components/shared/date-range-filter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { salesSeries, computeKpis, SALES_BY_CATEGORY } from "@/lib/mock/dashboard";
import { formatINR } from "@/lib/format";

const salesConfig = {
  gmv: { label: "GMV", color: "var(--chart-1)" },
  netRevenue: { label: "Net Revenue", color: "var(--chart-2)" },
} satisfies ChartConfig;

export default function SalesAnalyticsPage() {
  const [preset, setPreset] = useState("30d");
  const [days, setDays] = useState(30);
  const sales = useMemo(() => salesSeries(days), [days]);
  const kpis = useMemo(() => computeKpis(), []);

  const avgDailyGmv = useMemo(() => Math.round(sales.reduce((s, p) => s + p.gmv, 0) / sales.length), [sales]);
  const netMargin = useMemo(() => (kpis.netRevenue / kpis.gmv) * 100, [kpis]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sales Analytics"
        description="GMV, net revenue and category-wise sales performance"
        actions={<DateRangeFilter value={preset} onChange={(v, d) => { setPreset(v); setDays(d); }} />}
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <KpiCard label="Total GMV" value={formatINR(kpis.gmv, true)} icon={IndianRupee} tone="green" delta="+12.4% vs last period" trend="up" />
        <KpiCard label="Net Revenue" value={formatINR(kpis.netRevenue, true)} icon={IndianRupee} tone="blue" delta="+9.1% vs last period" trend="up" />
        <KpiCard label="Avg Daily GMV" value={formatINR(avgDailyGmv, true)} icon={TrendingUp} />
        <KpiCard label="Net Margin" value={`${netMargin.toFixed(1)}%`} icon={Percent} tone="orange" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>GMV vs Net Revenue Trend</CardTitle>
            <CardDescription>Daily sales performance over the selected period</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={salesConfig} className="h-[300px] w-full">
              <AreaChart data={sales}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} minTickGap={24} />
                <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
                <Area dataKey="gmv" type="monotone" fill="var(--color-gmv)" fillOpacity={0.15} stroke="var(--color-gmv)" strokeWidth={2} />
                <Area dataKey="netRevenue" type="monotone" fill="var(--color-netRevenue)" fillOpacity={0.15} stroke="var(--color-netRevenue)" strokeWidth={2} />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sales by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="h-[300px] w-full">
              <BarChart data={SALES_BY_CATEGORY} layout="vertical" margin={{ left: 8 }}>
                <XAxis type="number" hide />
                <ChartTooltip content={<ChartTooltipContent />} formatter={(v) => formatINR(Number(v), true)} />
                <Bar dataKey="value" radius={4} fill="var(--chart-1)" />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
