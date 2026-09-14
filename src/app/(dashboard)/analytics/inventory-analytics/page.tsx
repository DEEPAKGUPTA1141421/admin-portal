"use client";

import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import { Warehouse, IndianRupee, PackageX, AlertTriangle } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { KpiCard } from "@/components/shared/kpi-card";
import { DateRangeFilter } from "@/components/shared/date-range-filter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { INVENTORY_DATA, WAREHOUSES_DATA, PRODUCTS_DATA } from "@/lib/mock/generate";
import { formatINR, formatNumber, formatPct } from "@/lib/format";

const utilConfig = { used: { label: "Utilization %", color: "var(--chart-2)" } } satisfies ChartConfig;

export default function InventoryAnalyticsPage() {
  const [preset, setPreset] = useState("30d");
  const [days, setDays] = useState(30);

  const priceMap = useMemo(() => new Map(PRODUCTS_DATA.map((p) => [p.id, p.price])), []);

  const totalStockValue = useMemo(
    () => INVENTORY_DATA.reduce((s, i) => s + i.physicalStock * (priceMap.get(i.productId) ?? 0), 0),
    [priceMap]
  );

  const totalDamaged = INVENTORY_DATA.reduce((s, i) => s + i.damagedStock, 0);
  const lowStockCount = INVENTORY_DATA.filter((i) => i.availableStock <= i.reorderLevel).length;
  const totalAvailable = INVENTORY_DATA.reduce((s, i) => s + i.availableStock, 0);

  const warehouseUtil = useMemo(
    () =>
      WAREHOUSES_DATA.map((w) => ({
        name: w.name.split(" ").slice(0, 2).join(" "),
        used: Math.round((w.capacityUsed / w.capacityMaxParcels) * 100),
      })),
    []
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inventory Analytics"
        description="Stock value, availability and warehouse utilization"
        actions={<DateRangeFilter value={preset} onChange={(v, d) => { setPreset(v); setDays(d); }} />}
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <KpiCard label="Total Stock Value" value={formatINR(totalStockValue, true)} icon={IndianRupee} tone="green" />
        <KpiCard label="Available Units" value={formatNumber(totalAvailable)} icon={Warehouse} tone="blue" />
        <KpiCard label="Low Stock SKUs" value={formatNumber(lowStockCount)} icon={AlertTriangle} tone="orange" />
        <KpiCard label="Damaged Units" value={formatNumber(totalDamaged)} icon={PackageX} tone="red" />
      </div>

      <Card>
        <CardHeader><CardTitle>Warehouse Capacity Utilization</CardTitle></CardHeader>
        <CardContent>
          <ChartContainer config={utilConfig} className="h-[300px] w-full">
            <BarChart data={warehouseUtil}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} fontSize={11} />
              <ChartTooltip content={<ChartTooltipContent />} formatter={(v) => formatPct(Number(v))} />
              <Bar dataKey="used" radius={4} fill="var(--color-used)" />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
