"use client";

import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { RotateCcw, AlertTriangle } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable } from "@/components/shared/data-table";
import { KpiCard } from "@/components/shared/kpi-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatDate, formatINR, formatNumber } from "@/lib/format";

type ReconciledStatus = "reconciled" | "pending" | "discrepancy";

interface RefundLedgerRow {
  id: string;
  date: string;
  refundCount: number;
  totalRefunded: number;
  reconciledStatus: ReconciledStatus;
}

function daysAgoIso(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

function buildLedger(): RefundLedgerRow[] {
  const statuses: ReconciledStatus[] = [
    "reconciled", "reconciled", "reconciled", "pending", "reconciled",
    "discrepancy", "reconciled", "pending", "reconciled", "reconciled",
    "discrepancy", "reconciled", "pending", "reconciled", "reconciled",
    "reconciled", "discrepancy", "reconciled",
  ];
  return statuses.map((status, i) => {
    const refundCount = 5 + ((i * 7) % 40);
    const totalRefunded = refundCount * (350 + (i % 5) * 120);
    return {
      id: `RFL-${i + 1}`,
      date: daysAgoIso(statuses.length - i),
      refundCount,
      totalRefunded,
      reconciledStatus: status,
    };
  });
}

export default function RefundAccountingPage() {
  const [rows] = useState<RefundLedgerRow[]>(() => buildLedger());

  const kpis = useMemo(() => {
    const totalRefunded = rows.reduce((s, r) => s + r.totalRefunded, 0);
    const totalCount = rows.reduce((s, r) => s + r.refundCount, 0);
    const unreconciled = rows.filter((r) => r.reconciledStatus !== "reconciled");
    const unreconciledCount = unreconciled.length;
    const unreconciledAmount = unreconciled.reduce((s, r) => s + r.totalRefunded, 0);
    return { totalRefunded, totalCount, unreconciledCount, unreconciledAmount };
  }, [rows]);

  const columns = useMemo<ColumnDef<RefundLedgerRow, unknown>[]>(
    () => [
      { accessorKey: "date", header: "Date", cell: ({ row }) => formatDate(row.original.date) },
      { accessorKey: "refundCount", header: "Refund Count", cell: ({ row }) => formatNumber(row.original.refundCount) },
      { accessorKey: "totalRefunded", header: "Total Refunded", cell: ({ row }) => formatINR(row.original.totalRefunded) },
      {
        accessorKey: "reconciledStatus",
        header: "Reconciliation Status",
        cell: ({ row }) => <StatusBadge status={row.original.reconciledStatus} />,
      },
    ],
    []
  );

  return (
    <div className="space-y-6">
      <PageHeader title="Refund Accounting" description="Daily refund reconciliation ledger" />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <KpiCard label="Total Refunds This Period" value={formatINR(kpis.totalRefunded, true)} icon={RotateCcw} tone="red" />
        <KpiCard label="Total Refund Count" value={formatNumber(kpis.totalCount)} icon={RotateCcw} tone="blue" />
        <KpiCard label="Unreconciled Count" value={formatNumber(kpis.unreconciledCount)} icon={AlertTriangle} tone="orange" />
        <KpiCard label="Unreconciled Amount" value={formatINR(kpis.unreconciledAmount, true)} icon={AlertTriangle} tone="orange" />
      </div>

      <DataTable
        columns={columns}
        data={rows}
        searchKey="reconciledStatus"
        searchPlaceholder="Search by status..."
        exportName="refund-accounting"
        emptyTitle="No refund records found"
        emptyDescription="Try adjusting your search."
      />
    </div>
  );
}
