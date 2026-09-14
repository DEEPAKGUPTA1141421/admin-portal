"use client";

import { useState } from "react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import { Users, ShoppingCart, CreditCard, CheckCircle2 } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { KpiCard } from "@/components/shared/kpi-card";
import { DateRangeFilter } from "@/components/shared/date-range-filter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { formatNumber, formatPct } from "@/lib/format";

const channelConfig = { rate: { label: "Conversion Rate %", color: "var(--chart-1)" } } satisfies ChartConfig;

const CHANNEL_DATA = [
  { name: "App", rate: 4.8 },
  { name: "Web", rate: 3.1 },
];

export default function ConversionAnalyticsPage() {
  const [preset, setPreset] = useState("30d");
  const [days, setDays] = useState(30);

  const visitors = 482000;
  const cart = 96400;
  const checkout = 58080;
  const paid = 41600;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Conversion Analytics"
        description="Visitor-to-purchase funnel and channel conversion rates"
        actions={<DateRangeFilter value={preset} onChange={(v, d) => { setPreset(v); setDays(d); }} />}
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <KpiCard label="Visitors" value={formatNumber(visitors)} icon={Users} tone="blue" />
        <KpiCard label="Added to Cart" value={formatNumber(cart)} icon={ShoppingCart} delta={formatPct((cart / visitors) * 100)} trend="flat" />
        <KpiCard label="Checkout Started" value={formatNumber(checkout)} icon={CreditCard} tone="orange" delta={formatPct((checkout / visitors) * 100)} trend="flat" />
        <KpiCard label="Paid Orders" value={formatNumber(paid)} icon={CheckCircle2} tone="green" delta={formatPct((paid / visitors) * 100)} trend="flat" />
      </div>

      <Card>
        <CardHeader><CardTitle>Conversion Rate by Channel</CardTitle></CardHeader>
        <CardContent>
          <ChartContainer config={channelConfig} className="h-[260px] w-full">
            <BarChart data={CHANNEL_DATA}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} />
              <ChartTooltip content={<ChartTooltipContent />} formatter={(v) => `${v}%`} />
              <Bar dataKey="rate" radius={4} fill="var(--color-rate)" />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
