"use client";

import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Eye, CheckCircle2 } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter,
} from "@/components/ui/sheet";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { SETTLEMENTS_DATA } from "@/lib/mock/generate";
import type { Settlement } from "@/lib/types";
import { formatDate, formatINR } from "@/lib/format";
import { toast } from "sonner";

export default function SellerSettlementsPage() {
  const [settlements, setSettlements] = useState<Settlement[]>(() => [...SETTLEMENTS_DATA]);
  const [viewTarget, setViewTarget] = useState<Settlement | null>(null);
  const [approveTarget, setApproveTarget] = useState<Settlement | null>(null);

  function approve(settlement: Settlement) {
    const nextStatus = settlement.status === "pending" ? "processing" : "paid";
    setSettlements((prev) =>
      prev.map((s) =>
        s.id === settlement.id
          ? { ...s, status: nextStatus, paidAt: nextStatus === "paid" ? new Date().toISOString() : s.paidAt }
          : s
      )
    );
    toast.success(
      nextStatus === "processing"
        ? `Settlement for ${settlement.sellerName} approved and moved to processing`
        : `Settlement for ${settlement.sellerName} approved and marked paid`
    );
    setApproveTarget(null);
  }

  const columns = useMemo<ColumnDef<Settlement, unknown>[]>(
    () => [
      { accessorKey: "sellerName", header: "Seller" },
      { accessorKey: "periodStart", header: "Period Start", cell: ({ row }) => formatDate(row.original.periodStart) },
      { accessorKey: "periodEnd", header: "Period End", cell: ({ row }) => formatDate(row.original.periodEnd) },
      { accessorKey: "grossRevenue", header: "Gross Revenue", cell: ({ row }) => formatINR(row.original.grossRevenue) },
      { accessorKey: "commission", header: "Commission", cell: ({ row }) => formatINR(row.original.commission) },
      { accessorKey: "shippingFee", header: "Shipping Fee", cell: ({ row }) => formatINR(row.original.shippingFee) },
      { accessorKey: "penalties", header: "Penalties", cell: ({ row }) => formatINR(row.original.penalties) },
      { accessorKey: "refunds", header: "Refunds", cell: ({ row }) => formatINR(row.original.refunds) },
      { accessorKey: "adjustments", header: "Adjustments", cell: ({ row }) => formatINR(row.original.adjustments) },
      { accessorKey: "netPayable", header: "Net Payable", cell: ({ row }) => formatINR(row.original.netPayable) },
      { accessorKey: "status", header: "Status", cell: ({ row }) => <StatusBadge status={row.original.status} /> },
      { accessorKey: "paidAt", header: "Paid At", cell: ({ row }) => formatDate(row.original.paidAt) },
      {
        id: "actions",
        header: "",
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => {
          const s = row.original;
          return (
            <div className="flex items-center gap-1.5">
              <Button size="sm" variant="ghost" onClick={() => setViewTarget(s)}>
                <Eye className="size-4" /> View
              </Button>
              {(s.status === "pending" || s.status === "processing") && (
                <Button size="sm" variant="outline" onClick={() => setApproveTarget(s)}>
                  <CheckCircle2 className="size-4" /> Approve
                </Button>
              )}
            </div>
          );
        },
      },
    ],
    []
  );

  const lines = viewTarget
    ? [
        { label: "Gross Revenue", value: viewTarget.grossRevenue, sign: 1 },
        { label: "Commission", value: viewTarget.commission, sign: -1 },
        { label: "Shipping Fee", value: viewTarget.shippingFee, sign: -1 },
        { label: "Penalties", value: viewTarget.penalties, sign: -1 },
        { label: "Refunds", value: viewTarget.refunds, sign: -1 },
        { label: "Adjustments", value: viewTarget.adjustments, sign: 1 },
      ]
    : [];

  let running = 0;

  return (
    <div className="space-y-6">
      <PageHeader title="Seller Settlements" description="Full settlement ledger across all sellers and periods" />

      <DataTable
        columns={columns}
        data={settlements}
        searchKey="sellerName"
        searchPlaceholder="Search by seller name..."
        exportName="seller-settlements"
        emptyTitle="No settlements found"
        emptyDescription="Try adjusting your search."
      />

      <Sheet open={!!viewTarget} onOpenChange={(o) => !o && setViewTarget(null)}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Settlement Breakdown</SheetTitle>
            <SheetDescription>
              {viewTarget && `${viewTarget.sellerName} · ${formatDate(viewTarget.periodStart)} – ${formatDate(viewTarget.periodEnd)}`}
            </SheetDescription>
          </SheetHeader>
          <div className="px-4 space-y-3">
            {viewTarget && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Status</span>
                <StatusBadge status={viewTarget.status} />
              </div>
            )}
            <Separator />
            <div className="space-y-2 text-sm">
              {lines.map((line) => {
                running += line.sign * line.value;
                return (
                  <div key={line.label} className="flex items-center justify-between">
                    <span className="text-muted-foreground">
                      {line.sign > 0 ? "+ " : "− "}
                      {line.label}
                    </span>
                    <span>{formatINR(line.value)}</span>
                  </div>
                );
              })}
            </div>
            <Separator />
            <div className="flex items-center justify-between text-base font-semibold">
              <span>Net Payable</span>
              <span>{viewTarget && formatINR(viewTarget.netPayable)}</span>
            </div>
          </div>
          <SheetFooter>
            {viewTarget && (viewTarget.status === "pending" || viewTarget.status === "processing") && (
              <Button
                onClick={() => {
                  setApproveTarget(viewTarget);
                  setViewTarget(null);
                }}
              >
                <CheckCircle2 className="size-4" /> Approve Settlement
              </Button>
            )}
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <AlertDialog open={!!approveTarget} onOpenChange={(o) => !o && setApproveTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approve this settlement?</AlertDialogTitle>
            <AlertDialogDescription>
              {approveTarget &&
                `${formatINR(approveTarget.netPayable)} net payable for ${approveTarget.sellerName} will be ${
                  approveTarget.status === "pending" ? "moved to processing" : "marked as paid"
                }. This is a financial action.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => approveTarget && approve(approveTarget)}>Approve</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
