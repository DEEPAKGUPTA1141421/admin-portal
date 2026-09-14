"use client";

import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Bar, BarChart, CartesianGrid, Line, LineChart, XAxis } from "recharts";
import { Tag, Megaphone, TrendingUp, Percent } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { KpiCard } from "@/components/shared/kpi-card";
import { DateRangeFilter } from "@/components/shared/date-range-filter";
import { DataTable } from "@/components/shared/data-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { COUPONS_DATA, CAMPAIGNS_DATA } from "@/lib/mock/generate";
import type { Campaign } from "@/lib/types";
import { formatNumber, formatPct } from "@/lib/format";

const conversionConfig = { conversions: { label: "Conversions", color: "var(--chart-1)" } } satisfies ChartConfig;

export default function MarketingAnalyticsPage() {
  const [preset, setPreset] = useState("30d");
  const [days, setDays] = useState(30);

  const activeCoupons = COUPONS_DATA.filter((c) => c.status === "active").length;
  const totalUsed = COUPONS_DATA.reduce((s, c) => s + c.usedCount, 0);
  const totalLimit = COUPONS_DATA.reduce((s, c) => s + c.usageLimit, 0);
  const usageRate = ((totalUsed / totalLimit) * 100).toFixed(1);
  const activeCampaigns = CAMPAIGNS_DATA.filter((c) => c.status === "active").length;

  const conversionsTrend = useMemo(() => {
    const out = [];
    const today = new Date();
    for (let i = 13; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      out.push({ date: d.toLocaleDateString("en-IN", { month: "short", day: "numeric" }), conversions: Math.floor(Math.random() * 800) + 200 });
    }
    return out;
  }, [days]);

  const topCampaigns = useMemo(() => [...CAMPAIGNS_DATA].sort((a, b) => b.conversions - a.conversions).slice(0, 10), []);

  const columns: ColumnDef<Campaign, unknown>[] = [
    { accessorKey: "name", header: "Campaign" },
    { accessorKey: "type", header: "Type" },
    { accessorKey: "status", header: "Status" },
    { accessorKey: "reach", header: "Reach", cell: ({ row }) => formatNumber(row.original.reach) },
    { accessorKey: "conversions", header: "Conversions", cell: ({ row }) => formatNumber(row.original.conversions) },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Marketing Analytics"
        description="Coupon usage, campaign conversions and top performers"
        actions={<DateRangeFilter value={preset} onChange={(v, d) => { setPreset(v); setDays(d); }} />}
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <KpiCard label="Active Coupons" value={formatNumber(activeCoupons)} icon={Tag} tone="blue" />
        <KpiCard label="Coupon Usage Rate" value={`${usageRate}%`} icon={Percent} tone="green" />
        <KpiCard label="Active Campaigns" value={formatNumber(activeCampaigns)} icon={Megaphone} tone="orange" />
        <KpiCard label="Total Conversions" value={formatNumber(CAMPAIGNS_DATA.reduce((s, c) => s + c.conversions, 0))} icon={TrendingUp} />
      </div>

      <Card>
        <CardHeader><CardTitle>Conversions Trend</CardTitle></CardHeader>
        <CardContent>
          <ChartContainer config={conversionConfig} className="h-[260px] w-full">
            <LineChart data={conversionsTrend}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} minTickGap={24} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line dataKey="conversions" type="monotone" stroke="var(--color-conversions)" strokeWidth={2} dot={false} />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Top Campaigns</CardTitle></CardHeader>
        <CardContent>
          <DataTable columns={columns} data={topCampaigns} searchKey="name" searchPlaceholder="Search campaigns..." exportName="campaigns" />
        </CardContent>
      </Card>
    </div>
  );
}
