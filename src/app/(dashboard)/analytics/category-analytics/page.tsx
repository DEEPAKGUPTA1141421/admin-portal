"use client";

import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import { Tags, TrendingUp, Package, Percent } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { KpiCard } from "@/components/shared/kpi-card";
import { DateRangeFilter } from "@/components/shared/date-range-filter";
import { DataTable } from "@/components/shared/data-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { SALES_BY_CATEGORY } from "@/lib/mock/dashboard";
import { CATEGORIES_DATA } from "@/lib/mock/generate";
import type { Category } from "@/lib/types";
import { formatINR, formatNumber } from "@/lib/format";

const catConfig = { value: { label: "Revenue", color: "var(--chart-1)" } } satisfies ChartConfig;

interface CategoryRow extends Category {
  revenue: number;
}

export default function CategoryAnalyticsPage() {
  const [preset, setPreset] = useState("30d");
  const [days, setDays] = useState(30);

  const rows: CategoryRow[] = useMemo(
    () => CATEGORIES_DATA.map((c) => ({ ...c, revenue: c.productCount * (Math.floor(Math.random() * 4000) + 800) })),
    []
  );

  const totalRevenue = SALES_BY_CATEGORY.reduce((s, c) => s + c.value, 0);
  const activeCategories = CATEGORIES_DATA.filter((c) => c.status === "active").length;
  const totalProducts = CATEGORIES_DATA.reduce((s, c) => s + c.productCount, 0);
  const topCategory = SALES_BY_CATEGORY.reduce((a, b) => (b.value > a.value ? b : a));

  const columns: ColumnDef<CategoryRow, unknown>[] = [
    { accessorKey: "name", header: "Category" },
    { accessorKey: "productCount", header: "Products" },
    { accessorKey: "revenue", header: "Revenue (est.)", cell: ({ row }) => formatINR(row.original.revenue) },
    { accessorKey: "status", header: "Status" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Category Analytics"
        description="Sales performance and product distribution across categories"
        actions={<DateRangeFilter value={preset} onChange={(v, d) => { setPreset(v); setDays(d); }} />}
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <KpiCard label="Total Category Revenue" value={formatINR(totalRevenue, true)} icon={TrendingUp} tone="green" />
        <KpiCard label="Active Categories" value={formatNumber(activeCategories)} icon={Tags} tone="blue" />
        <KpiCard label="Total Products" value={formatNumber(totalProducts)} icon={Package} />
        <KpiCard label="Top Category" value={topCategory.name} icon={Percent} tone="orange" />
      </div>

      <Card>
        <CardHeader><CardTitle>Sales by Category</CardTitle></CardHeader>
        <CardContent>
          <ChartContainer config={catConfig} className="h-[280px] w-full">
            <BarChart data={SALES_BY_CATEGORY}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} fontSize={11} />
              <ChartTooltip content={<ChartTooltipContent />} formatter={(v) => formatINR(Number(v), true)} />
              <Bar dataKey="value" radius={4} fill="var(--color-value)" />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>All Categories</CardTitle></CardHeader>
        <CardContent>
          <DataTable columns={columns} data={rows} searchKey="name" searchPlaceholder="Search categories..." exportName="categories" />
        </CardContent>
      </Card>
    </div>
  );
}
