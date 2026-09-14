"use client";

import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import { Store, Star, TrendingUp, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { KpiCard } from "@/components/shared/kpi-card";
import { DateRangeFilter } from "@/components/shared/date-range-filter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { TOP_SELLERS } from "@/lib/mock/dashboard";
import { SELLERS_DATA } from "@/lib/mock/generate";
import { formatINR, formatNumber } from "@/lib/format";

const sellersConfig = { value: { label: "Revenue", color: "var(--chart-1)" } } satisfies ChartConfig;
const fulfillmentConfig = { count: { label: "Sellers", color: "var(--chart-2)" } } satisfies ChartConfig;

export default function SellerAnalyticsPage() {
  const [preset, setPreset] = useState("30d");
  const [days, setDays] = useState(30);

  const activeSellers = SELLERS_DATA.filter((s) => s.status === "active").length;
  const avgRating = (SELLERS_DATA.reduce((s, x) => s + x.rating, 0) / SELLERS_DATA.length).toFixed(2);
  const avgFulfillment = (SELLERS_DATA.reduce((s, x) => s + x.fulfillmentRate, 0) / SELLERS_DATA.length).toFixed(1);
  const totalRevenue = SELLERS_DATA.reduce((s, x) => s + x.totalRevenue, 0);

  const fulfillmentBuckets = useMemo(() => {
    const buckets = [
      { name: "<85%", min: 0, max: 85 },
      { name: "85-90%", min: 85, max: 90 },
      { name: "90-95%", min: 90, max: 95 },
      { name: "95-100%", min: 95, max: 100.01 },
    ];
    return buckets.map((b) => ({
      name: b.name,
      count: SELLERS_DATA.filter((s) => s.fulfillmentRate >= b.min && s.fulfillmentRate < b.max).length,
    }));
  }, []);

  const statusCounts = useMemo(() => {
    const map = new Map<string, number>();
    for (const s of SELLERS_DATA) map.set(s.status, (map.get(s.status) ?? 0) + 1);
    return Array.from(map, ([name, count]) => ({ name, count }));
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Seller Analytics"
        description="Seller revenue, fulfillment performance and status distribution"
        actions={<DateRangeFilter value={preset} onChange={(v, d) => { setPreset(v); setDays(d); }} />}
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <KpiCard label="Active Sellers" value={formatNumber(activeSellers)} icon={Store} tone="green" />
        <KpiCard label="Total Seller Revenue" value={formatINR(totalRevenue, true)} icon={TrendingUp} tone="blue" />
        <KpiCard label="Avg Rating" value={avgRating} icon={Star} tone="orange" />
        <KpiCard label="Avg Fulfillment Rate" value={`${avgFulfillment}%`} icon={ShieldCheck} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Top Sellers by Revenue</CardTitle></CardHeader>
          <CardContent>
            <ChartContainer config={sellersConfig} className="h-[280px] w-full">
              <BarChart data={TOP_SELLERS} layout="vertical" margin={{ left: 8 }}>
                <XAxis type="number" hide />
                <ChartTooltip content={<ChartTooltipContent />} formatter={(v) => formatINR(Number(v), true)} />
                <Bar dataKey="value" radius={4} fill="var(--color-value)" />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Fulfillment Rate Distribution</CardTitle></CardHeader>
          <CardContent>
            <ChartContainer config={fulfillmentConfig} className="h-[280px] w-full">
              <BarChart data={fulfillmentBuckets}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="count" radius={4} fill="var(--color-count)" />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Seller Count by Status</CardTitle></CardHeader>
        <CardContent>
          <ChartContainer config={{}} className="h-[220px] w-full">
            <BarChart data={statusCounts}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} fontSize={11} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="count" radius={4} fill="var(--chart-3)" />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
