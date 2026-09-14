"use client";

import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Percent, IndianRupee } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable } from "@/components/shared/data-table";
import { KpiCard } from "@/components/shared/kpi-card";
import { SETTLEMENTS_DATA } from "@/lib/mock/generate";
import type { Settlement } from "@/lib/types";
import { formatDate, formatINR } from "@/lib/format";

export default function MarketplaceCommissionPage() {
  const [settlements] = useState<Settlement[]>(() => [...SETTLEMENTS_DATA]);

  const kpis = useMemo(() => {
    const totalCommission = settlements.reduce((s, x) => s + x.commission, 0);
    const totalGross = settlements.reduce((s, x) => s + x.grossRevenue, 0);
    const avgRate = totalGross ? (totalCommission / totalGross) * 100 : 0;
    return { totalCommission, avgRate };
  }, [settlements]);

  const columns = useMemo<ColumnDef<Settlement, unknown>[]>(
    () => [
      { accessorKey: "sellerName", header: "Seller" },
      { accessorKey: "periodStart", header: "Period Start", cell: ({ row }) => formatDate(row.original.periodStart) },
      { accessorKey: "periodEnd", header: "Period End", cell: ({ row }) => formatDate(row.original.periodEnd) },
      { accessorKey: "grossRevenue", header: "Gross Revenue", cell: ({ row }) => formatINR(row.original.grossRevenue) },
      { accessorKey: "commission", header: "Commission", cell: ({ row }) => formatINR(row.original.commission) },
      {
        id: "commissionRate",
        header: "Commission Rate",
        accessorFn: (row) => (row.grossRevenue ? (row.commission / row.grossRevenue) * 100 : 0),
        cell: ({ row }) => {
          const rate = row.original.grossRevenue ? (row.original.commission / row.original.grossRevenue) * 100 : 0;
          return `${rate.toFixed(1)}%`;
        },
      },
    ],
    []
  );

  return (
    <div className="space-y-6">
      <PageHeader title="Marketplace Commission" description="Commission earned from sellers across all settlement periods" />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <KpiCard label="Total Commission Earned" value={formatINR(kpis.totalCommission, true)} icon={IndianRupee} tone="green" />
        <KpiCard label="Average Commission Rate" value={`${kpis.avgRate.toFixed(1)}%`} icon={Percent} tone="blue" />
      </div>

      <DataTable
        columns={columns}
        data={settlements}
        searchKey="sellerName"
        searchPlaceholder="Search by seller name..."
        exportName="marketplace-commission"
        emptyTitle="No settlements found"
        emptyDescription="Try adjusting your search."
      />
    </div>
  );
}
