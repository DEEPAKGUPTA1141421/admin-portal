"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, XAxis,
} from "recharts";
import {
  IndianRupee, ShoppingCart, PackageCheck, Truck, RotateCcw, Users, Store,
  AlertTriangle, PackageX, Plus, FileDown, Tag, Megaphone,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { KpiCard } from "@/components/shared/kpi-card";
import { DateRangeFilter } from "@/components/shared/date-range-filter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { computeKpis, salesSeries, SALES_BY_CATEGORY, TOP_SELLERS, TOP_PRODUCTS, ORDER_STATUS_DISTRIBUTION, PAYMENT_METHOD_DISTRIBUTION, GEO_SALES } from "@/lib/mock/dashboard";
import { fetchLiveKpis, type DashboardKpis } from "@/lib/api/dashboard";
import { formatINR, formatNumber } from "@/lib/format";
import { toast } from "sonner";

const salesConfig = {
  gmv: { label: "GMV", color: "var(--chart-1)" },
  netRevenue: { label: "Net Revenue", color: "var(--chart-2)" },
} satisfies ChartConfig;

const ordersConfig = {
  orders: { label: "Orders", color: "var(--chart-3)" },
} satisfies ChartConfig;

const PIE_COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)", "#94a3b8"];

const QUICK_ACTIONS = [
  { label: "Add Product", href: "/catalog/products", icon: Plus },
  { label: "Seller Applications", href: "/sellers/seller-applications", icon: Store },
  { label: "Create Coupon", href: "/marketing/coupons", icon: Tag },
  { label: "Create Promotion", href: "/marketing/promotions", icon: Megaphone },
  { label: "View Orders", href: "/orders/all-orders", icon: ShoppingCart },
  { label: "Process Returns", href: "/returns/return-requests", icon: RotateCcw },
  { label: "View Payouts", href: "/finance/payouts", icon: IndianRupee },
  { label: "Generate Report", href: "/analytics/custom-reports", icon: FileDown },
];

export default function DashboardOverviewPage() {
  const [preset, setPreset] = useState("30d");
  const [days, setDays] = useState(30);
  const [kpis, setKpis] = useState<DashboardKpis>(() => computeKpis());
  const sales = useMemo(() => salesSeries(days), [days]);

  useEffect(() => {
    let cancelled = false;
    fetchLiveKpis()
      .then((live) => {
        if (!cancelled) setKpis(live);
      })
      .catch(() => {
        if (!cancelled) toast.info("Using demo data for some KPIs — backend unreachable");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard Overview"
        description="Real-time marketplace performance across catalog, orders, sellers and finance"
        actions={<DateRangeFilter value={preset} onChange={(v, d) => { setPreset(v); setDays(d); }} />}
      />

      <div>
        <p className="mb-2 text-sm font-medium text-muted-foreground">Quick Actions</p>
        <div className="flex flex-wrap gap-2">
          {QUICK_ACTIONS.map((a) => (
            <Button key={a.label} variant="outline" size="sm" asChild>
              <Link href={a.href}>
                <a.icon /> {a.label}
              </Link>
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
        <KpiCard label="Total GMV" value={formatINR(kpis.gmv, true)} delta="+12.4% vs last period" trend="up" icon={IndianRupee} tone="green" />
        <KpiCard label="Net Revenue" value={formatINR(kpis.netRevenue, true)} delta="+9.1% vs last period" trend="up" icon={IndianRupee} tone="blue" />
        <KpiCard label="Today's Sales" value={formatINR(kpis.todaySales, true)} delta="+3.2% vs yesterday" trend="up" icon={IndianRupee} />
        <KpiCard label="Orders Today" value={formatNumber(kpis.todayOrders)} delta="+18 vs yesterday" trend="up" icon={ShoppingCart} />
        <KpiCard label="Total Orders" value={formatNumber(kpis.totalOrders)} icon={ShoppingCart} tone="blue" />
        <KpiCard label="Pending Orders" value={formatNumber(kpis.pending)} icon={AlertTriangle} tone="orange" />
        <KpiCard label="Processing" value={formatNumber(kpis.processing)} icon={PackageCheck} tone="blue" />
        <KpiCard label="Shipped" value={formatNumber(kpis.shipped)} icon={Truck} tone="blue" />
        <KpiCard label="Delivered" value={formatNumber(kpis.delivered)} icon={PackageCheck} tone="green" />
        <KpiCard label="Cancelled" value={formatNumber(kpis.cancelled)} icon={AlertTriangle} tone="red" />
        <KpiCard label="Return Requests" value={formatNumber(kpis.returned)} icon={RotateCcw} tone="orange" />
        <KpiCard label="Refunds" value={formatNumber(kpis.refunded)} icon={RotateCcw} tone="red" />
        <KpiCard label="Active Customers" value={formatNumber(kpis.activeCustomers)} delta="+2.6% growth" trend="up" icon={Users} tone="green" />
        <KpiCard label="New Customers" value={formatNumber(kpis.newCustomers)} icon={Users} />
        <KpiCard label="Active Sellers" value={formatNumber(kpis.activeSellers)} icon={Store} tone="green" />
        <KpiCard label="Pending Seller Approvals" value={formatNumber(kpis.pendingSellers)} icon={Store} tone="orange" />
        <KpiCard label="Low-stock Products" value={formatNumber(kpis.lowStock)} icon={AlertTriangle} tone="orange" />
        <KpiCard label="Out-of-stock Products" value={formatNumber(kpis.outOfStock)} icon={PackageX} tone="red" />
        <KpiCard label="Marketplace Commission" value={formatINR(kpis.commission, true)} icon={IndianRupee} tone="green" />
        <KpiCard label="Seller Payable" value={formatINR(kpis.sellerPayable, true)} icon={IndianRupee} tone="orange" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>GMV vs Net Revenue</CardTitle>
            <CardDescription>Drill down by clicking any point to view underlying orders</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={salesConfig} className="h-[280px] w-full">
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
            <CardTitle>Order Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="mx-auto aspect-square max-h-[260px]">
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                <Pie data={ORDER_STATUS_DISTRIBUTION} dataKey="value" nameKey="name" innerRadius={55} strokeWidth={4}>
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

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Orders Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={ordersConfig} className="h-[220px] w-full">
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
          <CardHeader>
            <CardTitle>Sales by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="h-[220px] w-full">
              <BarChart data={SALES_BY_CATEGORY} layout="vertical" margin={{ left: 8 }}>
                <XAxis type="number" hide />
                <ChartTooltip content={<ChartTooltipContent />} formatter={(v) => formatINR(Number(v), true)} />
                <Bar dataKey="value" radius={4} fill="var(--chart-1)" />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Geographic Sales Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="h-[220px] w-full">
              <BarChart data={GEO_SALES}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} fontSize={11} />
                <ChartTooltip content={<ChartTooltipContent />} formatter={(v) => formatINR(Number(v), true)} />
                <Bar dataKey="value" radius={4} fill="var(--chart-2)" />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader><CardTitle>Top Sellers</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {TOP_SELLERS.map((s, i) => (
              <div key={s.name} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2"><span className="text-muted-foreground">{i + 1}.</span>{s.name}</span>
                <span className="font-medium">{formatINR(s.value, true)}</span>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Top Products</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {TOP_PRODUCTS.map((p, i) => (
              <div key={p.name} className="flex items-center justify-between text-sm gap-2">
                <span className="flex items-center gap-2 truncate"><span className="text-muted-foreground">{i + 1}.</span><span className="truncate">{p.name}</span></span>
                <span className="font-medium shrink-0">{formatINR(p.value, true)}</span>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Payment Method Distribution</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {PAYMENT_METHOD_DISTRIBUTION.map((m) => (
              <div key={m.name}>
                <div className="flex justify-between text-xs mb-1">
                  <span>{m.name}</span>
                  <span className="text-muted-foreground">{m.value}%</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-muted">
                  <div className="h-1.5 rounded-full bg-primary" style={{ width: `${m.value}%` }} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
