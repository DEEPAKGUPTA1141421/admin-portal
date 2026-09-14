"use client";

import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { RotateCw, Send, IndianRupee } from "lucide-react";
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
import { formatDate, formatINR, formatNumber } from "@/lib/format";
import { toast } from "sonner";

interface Payout {
  id: string;
  sellerName: string;
  paidAt: string | null;
  netPayable: number;
  status: "pending" | "processing" | "paid" | "failed" | "on_hold";
}

const EXTRA_PAYOUTS: Payout[] = [
  { id: "PYT-EXTRA-1", sellerName: "Nova Emporium", paidAt: null, netPayable: 48250, status: "processing" },
  { id: "PYT-EXTRA-2", sellerName: "Sunrise Bazaar", paidAt: null, netPayable: 132400, status: "failed" },
  { id: "PYT-EXTRA-3", sellerName: "Classic Traders", paidAt: null, netPayable: 27800, status: "pending" },
  { id: "PYT-EXTRA-4", sellerName: "Elite Mart", paidAt: null, netPayable: 96150, status: "failed" },
  { id: "PYT-EXTRA-5", sellerName: "Royal Enterprises", paidAt: null, netPayable: 15600, status: "pending" },
  { id: "PYT-EXTRA-6", sellerName: "Star Retail", paidAt: null, netPayable: 210300, status: "processing" },
  { id: "PYT-EXTRA-7", sellerName: "Urban Store", paidAt: null, netPayable: 8900, status: "failed" },
];

export default function PayoutsPage() {
  const [payouts, setPayouts] = useState<Payout[]>(() => [
    ...SETTLEMENTS_DATA.filter((s) => s.status === "paid").map((s) => ({
      id: s.id,
      sellerName: s.sellerName,
      paidAt: s.paidAt,
      netPayable: s.netPayable,
      status: s.status as Payout["status"],
    })),
    ...EXTRA_PAYOUTS,
  ]);
  const [processTarget, setProcessTarget] = useState<Payout | null>(null);

  const kpis = useMemo(() => {
    const totalPaid = payouts.filter((p) => p.status === "paid").reduce((s, p) => s + p.netPayable, 0);
    const pendingCount = payouts.filter((p) => p.status === "pending").length;
    const failedCount = payouts.filter((p) => p.status === "failed").length;
    return { totalPaid, pendingCount, failedCount, total: payouts.length };
  }, [payouts]);

  function retry(payout: Payout) {
    setPayouts((prev) => prev.map((p) => (p.id === payout.id ? { ...p, status: "processing" } : p)));
    toast.success(`Retry initiated for ${payout.sellerName}'s payout`);
    setTimeout(() => {
      setPayouts((prev) =>
        prev.map((p) => (p.id === payout.id ? { ...p, status: "paid", paidAt: new Date().toISOString() } : p))
      );
      toast.success(`Payout completed for ${payout.sellerName}`);
    }, 2000);
  }

  function process(payout: Payout) {
    setPayouts((prev) =>
      prev.map((p) => (p.id === payout.id ? { ...p, status: "paid", paidAt: new Date().toISOString() } : p))
    );
    toast.success(`Payout of ${formatINR(payout.netPayable)} processed for ${payout.sellerName}`);
    setProcessTarget(null);
  }

  const columns = useMemo<ColumnDef<Payout, unknown>[]>(
    () => [
      { accessorKey: "sellerName", header: "Seller" },
      { accessorKey: "netPayable", header: "Amount", cell: ({ row }) => formatINR(row.original.netPayable) },
      { accessorKey: "paidAt", header: "Paid At", cell: ({ row }) => formatDate(row.original.paidAt) },
      { accessorKey: "status", header: "Status", cell: ({ row }) => <StatusBadge status={row.original.status} /> },
      {
        id: "actions",
        header: "",
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => {
          const p = row.original;
          if (p.status === "failed") {
            return (
              <Button size="sm" variant="outline" onClick={() => retry(p)}>
                <RotateCw className="size-4" /> Retry Failed Payout
              </Button>
            );
          }
          if (p.status === "pending") {
            return (
              <Button size="sm" variant="outline" onClick={() => setProcessTarget(p)}>
                <Send className="size-4" /> Process Payout
              </Button>
            );
          }
          return null;
        },
      },
    ],
    []
  );

  return (
    <div className="space-y-6">
      <PageHeader title="Payouts" description="Payout history and pending seller payout actions" />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <KpiCard label="Total Payouts" value={formatNumber(kpis.total)} icon={IndianRupee} />
        <KpiCard label="Total Paid Out" value={formatINR(kpis.totalPaid, true)} icon={IndianRupee} tone="green" />
        <KpiCard label="Pending" value={formatNumber(kpis.pendingCount)} icon={IndianRupee} tone="orange" />
        <KpiCard label="Failed" value={formatNumber(kpis.failedCount)} icon={IndianRupee} tone="red" />
      </div>

      <DataTable
        columns={columns}
        data={payouts}
        searchKey="sellerName"
        searchPlaceholder="Search by seller name..."
        exportName="payouts"
        emptyTitle="No payouts found"
        emptyDescription="Try adjusting your search."
      />

      <AlertDialog open={!!processTarget} onOpenChange={(o) => !o && setProcessTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Process this payout?</AlertDialogTitle>
            <AlertDialogDescription>
              {processTarget &&
                `${formatINR(processTarget.netPayable)} will be transferred to ${processTarget.sellerName}. This is a financial transaction.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => processTarget && process(processTarget)}>Process Payout</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
