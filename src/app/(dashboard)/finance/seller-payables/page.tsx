"use client";

import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { CheckCircle2, Wallet } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable } from "@/components/shared/data-table";
import { KpiCard } from "@/components/shared/kpi-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { SETTLEMENTS_DATA } from "@/lib/mock/generate";
import type { Settlement } from "@/lib/types";
import { formatDate, formatINR, formatNumber } from "@/lib/format";
import { toast } from "sonner";

export default function SellerPayablesPage() {
  const [settlements, setSettlements] = useState<Settlement[]>(() =>
    SETTLEMENTS_DATA.filter((s) => s.status !== "paid").map((s) => ({ ...s }))
  );
  const [payTarget, setPayTarget] = useState<Settlement | null>(null);

  const kpis = useMemo(() => {
    const unpaid = settlements.filter((s) => s.status !== "paid");
    const totalOutstanding = unpaid.reduce((s, x) => s + x.netPayable, 0);
    return { count: unpaid.length, totalOutstanding };
  }, [settlements]);

  function markPaid(settlement: Settlement) {
    setSettlements((prev) =>
      prev.map((s) =>
        s.id === settlement.id ? { ...s, status: "paid", paidAt: new Date().toISOString() } : s
      )
    );
    toast.success(`Marked ${settlement.sellerName}'s payable as paid`);
    setPayTarget(null);
  }

  const columns = useMemo<ColumnDef<Settlement, unknown>[]>(
    () => [
      { accessorKey: "sellerName", header: "Seller" },
      { accessorKey: "periodEnd", header: "Period End", cell: ({ row }) => formatDate(row.original.periodEnd) },
      { accessorKey: "netPayable", header: "Net Payable", cell: ({ row }) => formatINR(row.original.netPayable) },
      { accessorKey: "status", header: "Status", cell: ({ row }) => <StatusBadge status={row.original.status} /> },
      {
        id: "actions",
        header: "",
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) =>
          row.original.status === "paid" ? (
            <span className="text-xs text-muted-foreground">Paid</span>
          ) : (
            <Button size="sm" variant="outline" onClick={() => setPayTarget(row.original)}>
              <CheckCircle2 className="size-4" /> Mark as Paid
            </Button>
          ),
      },
    ],
    []
  );

  return (
    <div className="space-y-6">
      <PageHeader title="Seller Payables" description="Outstanding amounts owed to sellers that are not yet paid" />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <KpiCard label="Outstanding Payables" value={formatNumber(kpis.count)} icon={Wallet} tone="orange" />
        <KpiCard label="Total Amount Due" value={formatINR(kpis.totalOutstanding, true)} icon={Wallet} tone="red" />
      </div>

      <DataTable
        columns={columns}
        data={settlements}
        searchKey="sellerName"
        searchPlaceholder="Search by seller name..."
        exportName="seller-payables"
        emptyTitle="No outstanding payables"
        emptyDescription="All sellers have been paid."
      />

      <AlertDialog open={!!payTarget} onOpenChange={(o) => !o && setPayTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mark this payable as paid?</AlertDialogTitle>
            <AlertDialogDescription>
              {payTarget &&
                `${formatINR(payTarget.netPayable)} will be marked as paid to ${payTarget.sellerName}. This action records a financial transaction and cannot be easily undone.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => payTarget && markPaid(payTarget)}>Mark as Paid</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
