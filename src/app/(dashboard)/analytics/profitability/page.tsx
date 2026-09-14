"use client";

import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import { Percent, IndianRupee, TrendingUp } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { KpiCard } from "@/components/shared/kpi-card";
import { DateRangeFilter } from "@/components/shared/date-range-filter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { PRODUCTS_DATA } from "@/lib/mock/generate";
import { formatINR, formatPct } from "@/lib/format";

const profitConfig = { margin: { label: "Margin %", color: "var(--chart-2)" } } satisfies ChartConfig;

export default function ProfitabilityPage() {
  const [preset, setPreset] = useState("30d");
  const [days, setDays] = useState(30);

  const grossMarginPct = useMemo(() => {
    const revenue = PRODUCTS_DATA.reduce((s, p) => s + p.price, 0);
    const cost = PRODUCTS_DATA.reduce((s, p) => s + p.costPrice, 0);
    return ((revenue - cost) / revenue) * 100;
  }, []);

  const netMarginPct = grossMarginPct - 8.5; // approximate operating costs
  const avgOrderProfit = useMemo(() => {
    const avgPrice = PRODUCTS_DATA.reduce((s, p) => s + p.price, 0) / PRODUCTS_DATA.length;
    const avgCost = PRODUCTS_DATA.reduce((s, p) => s + p.costPrice, 0) / PRODUCTS_DATA.length;
    return Math.round(avgPrice - avgCost);
  }, []);

  const categoryProfitability = useMemo(() => {
    const map = new Map<string, { revenue: number; cost: number }>();
    for (const p of PRODUCTS_DATA) {
      const cur = map.get(p.categoryName) ?? { revenue: 0, cost: 0 };
      cur.revenue += p.price;
      cur.cost += p.costPrice;
      map.set(p.categoryName, cur);
    }
    return Array.from(map, ([name, v]) => ({
      name,
      margin: Number((((v.revenue - v.cost) / v.revenue) * 100).toFixed(1)),
    })).sort((a, b) => b.margin - a.margin);
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Profitability"
        description="Margin analysis across the product catalog"
        actions={<DateRangeFilter value={preset} onChange={(v, d) => { setPreset(v); setDays(d); }} />}
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        <KpiCard label="Gross Margin" value={formatPct(grossMarginPct)} icon={Percent} tone="green" />
        <KpiCard label="Net Margin" value={formatPct(netMarginPct)} icon={TrendingUp} tone="blue" />
        <KpiCard label="Avg Order Profit" value={formatINR(avgOrderProfit)} icon={IndianRupee} tone="orange" />
      </div>

      <Card>
        <CardHeader><CardTitle>Profitability by Category</CardTitle></CardHeader>
        <CardContent>
          <ChartContainer config={profitConfig} className="h-[300px] w-full">
            <BarChart data={categoryProfitability} layout="vertical" margin={{ left: 24 }}>
              <XAxis type="number" hide />
              <ChartTooltip content={<ChartTooltipContent />} formatter={(v) => `${v}%`} />
              <Bar dataKey="margin" radius={4} fill="var(--color-margin)" />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
