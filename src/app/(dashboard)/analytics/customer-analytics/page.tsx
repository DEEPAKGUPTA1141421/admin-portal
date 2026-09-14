"use client";

import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, XAxis } from "recharts";
import { Users, UserPlus, IndianRupee, Repeat } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { KpiCard } from "@/components/shared/kpi-card";
import { DateRangeFilter } from "@/components/shared/date-range-filter";
import { DataTable } from "@/components/shared/data-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { CUSTOMERS_DATA } from "@/lib/mock/generate";
import type { Customer } from "@/lib/types";
import { formatINR, formatNumber } from "@/lib/format";

const PIE_COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)"];
const trendConfig = {
  newCustomers: { label: "New", color: "var(--chart-1)" },
  returning: { label: "Returning", color: "var(--chart-2)" },
} satisfies ChartConfig;

export default function CustomerAnalyticsPage() {
  const [preset, setPreset] = useState("30d");
  const [days, setDays] = useState(30);

  const segmentData = useMemo(() => {
    const map = new Map<string, number>();
    for (const c of CUSTOMERS_DATA) map.set(c.segment, (map.get(c.segment) ?? 0) + 1);
    return Array.from(map, ([name, value]) => ({ name, value }));
  }, []);

  const trend = useMemo(() => {
    const out = [];
    const today = new Date();
    for (let i = days - 1; i >= 0; i -= Math.max(1, Math.floor(days / 14))) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      out.push({
        date: d.toLocaleDateString("en-IN", { month: "short", day: "numeric" }),
        newCustomers: Math.floor(Math.random() * 40) + 10,
        returning: Math.floor(Math.random() * 80) + 30,
      });
    }
    return out;
  }, [days]);

  const activeCustomers = CUSTOMERS_DATA.filter((c) => c.status === "active").length;
  const newCustomers = CUSTOMERS_DATA.filter((c) => c.segment === "new").length;
  const avgSpend = Math.round(CUSTOMERS_DATA.reduce((s, c) => s + c.totalSpend, 0) / CUSTOMERS_DATA.length);
  const returningPct = ((CUSTOMERS_DATA.filter((c) => c.totalOrders > 1).length / CUSTOMERS_DATA.length) * 100).toFixed(1);

  const topCustomers = useMemo(() => [...CUSTOMERS_DATA].sort((a, b) => b.totalSpend - a.totalSpend).slice(0, 20), []);

  const columns: ColumnDef<Customer, unknown>[] = [
    { accessorKey: "name", header: "Customer" },
    { accessorKey: "email", header: "Email" },
    { accessorKey: "segment", header: "Segment" },
    { accessorKey: "totalOrders", header: "Orders" },
    { accessorKey: "totalSpend", header: "Total Spend", cell: ({ row }) => formatINR(row.original.totalSpend) },
    { accessorKey: "avgOrderValue", header: "AOV", cell: ({ row }) => formatINR(row.original.avgOrderValue) },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customer Analytics"
        description="Customer growth, segmentation and top spenders"
        actions={<DateRangeFilter value={preset} onChange={(v, d) => { setPreset(v); setDays(d); }} />}
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <KpiCard label="Active Customers" value={formatNumber(activeCustomers)} icon={Users} tone="green" />
        <KpiCard label="New Customers" value={formatNumber(newCustomers)} icon={UserPlus} tone="blue" />
        <KpiCard label="Avg Customer Spend" value={formatINR(avgSpend)} icon={IndianRupee} />
        <KpiCard label="Returning Rate" value={`${returningPct}%`} icon={Repeat} tone="orange" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>New vs Returning Customers</CardTitle></CardHeader>
          <CardContent>
            <ChartContainer config={trendConfig} className="h-[280px] w-full">
              <BarChart data={trend}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="newCustomers" stackId="a" fill="var(--color-newCustomers)" radius={[0, 0, 4, 4]} />
                <Bar dataKey="returning" stackId="a" fill="var(--color-returning)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Segment Breakdown</CardTitle></CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="mx-auto aspect-square max-h-[240px]">
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                <Pie data={segmentData} dataKey="value" nameKey="name" innerRadius={50} strokeWidth={4}>
                  {segmentData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
            <div className="mt-2 grid grid-cols-2 gap-1 text-xs">
              {segmentData.map((d, i) => (
                <div key={d.name} className="flex items-center gap-1.5 capitalize">
                  <span className="size-2 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                  <span className="text-muted-foreground">{d.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Top Customers by Spend</CardTitle></CardHeader>
        <CardContent>
          <DataTable columns={columns} data={topCustomers} searchKey="name" searchPlaceholder="Search customers..." exportName="top-customers" />
        </CardContent>
      </Card>
    </div>
  );
}
