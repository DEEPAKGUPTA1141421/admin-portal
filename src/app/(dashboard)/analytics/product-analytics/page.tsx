"use client";

import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, XAxis } from "recharts";
import { Package, Star, PackageX, TrendingUp } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { KpiCard } from "@/components/shared/kpi-card";
import { DateRangeFilter } from "@/components/shared/date-range-filter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { TOP_PRODUCTS } from "@/lib/mock/dashboard";
import { PRODUCTS_DATA } from "@/lib/mock/generate";
import { formatINR, formatNumber } from "@/lib/format";

const PIE_COLORS = ["var(--chart-2)", "var(--chart-4)", "var(--chart-5)"];
const topConfig = { value: { label: "Sales Value", color: "var(--chart-1)" } } satisfies ChartConfig;

export default function ProductAnalyticsPage() {
  const [preset, setPreset] = useState("30d");
  const [days, setDays] = useState(30);

  const stockStatus = useMemo(() => {
    const inStock = PRODUCTS_DATA.filter((p) => p.stock > p.minStock).length;
    const low = PRODUCTS_DATA.filter((p) => p.stock > 0 && p.stock <= p.minStock).length;
    const out = PRODUCTS_DATA.filter((p) => p.stock === 0).length;
    return [
      { name: "In Stock", value: inStock },
      { name: "Low Stock", value: low },
      { name: "Out of Stock", value: out },
    ];
  }, []);

  const ratingDistribution = useMemo(() => {
    const buckets = [1, 2, 3, 4, 5].map((r) => ({
      name: `${r} star`,
      count: PRODUCTS_DATA.filter((p) => Math.round(p.rating) === r).length,
    }));
    return buckets;
  }, []);

  const totalProducts = PRODUCTS_DATA.length;
  const avgRating = (PRODUCTS_DATA.reduce((s, p) => s + p.rating, 0) / PRODUCTS_DATA.length).toFixed(2);
  const outOfStock = PRODUCTS_DATA.filter((p) => p.stock === 0).length;
  const avgPrice = Math.round(PRODUCTS_DATA.reduce((s, p) => s + p.price, 0) / PRODUCTS_DATA.length);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Product Analytics"
        description="Top performing products, stock health and rating distribution"
        actions={<DateRangeFilter value={preset} onChange={(v, d) => { setPreset(v); setDays(d); }} />}
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <KpiCard label="Total Products" value={formatNumber(totalProducts)} icon={Package} tone="blue" />
        <KpiCard label="Avg Rating" value={avgRating} icon={Star} tone="orange" />
        <KpiCard label="Out of Stock" value={formatNumber(outOfStock)} icon={PackageX} tone="red" />
        <KpiCard label="Avg Price" value={formatINR(avgPrice)} icon={TrendingUp} tone="green" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Top Products by Sales Value</CardTitle></CardHeader>
          <CardContent>
            <ChartContainer config={topConfig} className="h-[280px] w-full">
              <BarChart data={TOP_PRODUCTS} layout="vertical" margin={{ left: 8 }}>
                <XAxis type="number" hide />
                <ChartTooltip content={<ChartTooltipContent />} formatter={(v) => formatINR(Number(v), true)} />
                <Bar dataKey="value" radius={4} fill="var(--color-value)" />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Stock Status</CardTitle></CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="mx-auto aspect-square max-h-[220px]">
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                <Pie data={stockStatus} dataKey="value" nameKey="name" innerRadius={50} strokeWidth={4}>
                  {stockStatus.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
            <div className="mt-2 space-y-1 text-xs">
              {stockStatus.map((d, i) => (
                <div key={d.name} className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                  <span className="text-muted-foreground">{d.name}: {d.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Rating Distribution</CardTitle></CardHeader>
        <CardContent>
          <ChartContainer config={{}} className="h-[220px] w-full">
            <BarChart data={ratingDistribution}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="count" radius={4} fill="var(--chart-3)" />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
