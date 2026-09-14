"use client";

import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, XAxis } from "recharts";
import { ShoppingCart, PackageCheck, IndianRupee, RotateCcw } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { KpiCard } from "@/components/shared/kpi-card";
import { DateRangeFilter } from "@/components/shared/date-range-filter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { salesSeries, computeKpis, ORDER_STATUS_DISTRIBUTION } from "@/lib/mock/dashboard";
import { formatINR, formatNumber } from "@/lib/format";

const ordersConfig = { orders: { label: "Orders", color: "var(--chart-3)" } } satisfies ChartConfig;
const PIE_COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)", "#94a3b8"];

export default function OrderAnalyticsPage() {
  const [preset, setPreset] = useState("30d");
  const [days, setDays] = useState(30);
  const sales = useMemo(() => salesSeries(days), [days]);
  const kpis = useMemo(() => computeKpis(), []);
  const avgOrderValue = useMemo(() => Math.round(kpis.gmv / kpis.totalOrders), [kpis]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Order Analytics"
        description="Order volume, status mix and average order value"
        actions={<DateRangeFilter value={preset} onChange={(v, d) => { setPreset(v); setDays(d); }} />}
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <KpiCard label="Total Orders" value={formatNumber(kpis.totalOrders)} icon={ShoppingCart} tone="blue" />
        <KpiCard label="Avg Order Value" value={formatINR(avgOrderValue)} icon={IndianRupee} tone="green" />
        <KpiCard label="Delivered" value={formatNumber(kpis.delivered)} icon={PackageCheck} tone="green" />
        <KpiCard label="Returned/Refunded" value={formatNumber(kpis.returned + kpis.refunded)} icon={RotateCcw} tone="orange" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Order Volume Trend</CardTitle></CardHeader>
          <CardContent>
            <ChartContainer config={ordersConfig} className="h-[280px] w-full">
              <LineChart data={sales}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} minTickGap={24} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line dataKey="orders" type="monotone" stroke="var(--color-orders)" strokeWidth={2} dot={false} />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Order Status Distribution</CardTitle></CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="mx-auto aspect-square max-h-[240px]">
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                <Pie data={ORDER_STATUS_DISTRIBUTION} dataKey="value" nameKey="name" innerRadius={50} strokeWidth={4}>
                  {ORDER_STATUS_DISTRIBUTION.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
            <div className="mt-2 grid grid-cols-2 gap-1 text-xs">
              {ORDER_STATUS_DISTRIBUTION.map((d, i) => (
                <div key={d.name} className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                  <span className="text-muted-foreground">{d.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
