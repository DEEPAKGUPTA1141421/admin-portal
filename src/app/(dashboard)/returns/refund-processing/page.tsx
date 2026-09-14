"use client";

import { useState } from "react";
import Image from "next/image";
import { type ColumnDef } from "@tanstack/react-table";
import { IndianRupee } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { DataTable } from "@/components/shared/data-table";
import { Button } from "@/components/ui/button";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { RETURNS_DATA } from "@/lib/mock/generate";
import type { ReturnRequest } from "@/lib/types";
import { formatINR, formatDate } from "@/lib/format";
import { toast } from "sonner";

export default function RefundProcessingPage() {
  const [returns, setReturns] = useState<ReturnRequest[]>(() => RETURNS_DATA.filter((r) => r.status === "refund_initiated"));
  const [processing, setProcessing] = useState<ReturnRequest | null>(null);

  function processRefund() {
    if (!processing) return;
    setReturns((prev) => prev.filter((r) => r.id !== processing.id));
    toast.success(`Refund of ${formatINR(processing.refundAmount)} processed for ${processing.id}`);
    setProcessing(null);
  }

  const columns: ColumnDef<ReturnRequest, unknown>[] = [
    {
      accessorKey: "productName",
      header: "Product",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Image src={row.original.image} alt={row.original.productName} width={36} height={36} className="rounded-md object-cover" unoptimized />
          <div className="max-w-[200px] truncate font-medium">{row.original.productName}</div>
        </div>
      ),
    },
    { accessorKey: "orderNumber", header: "Order" },
    { accessorKey: "customerName", header: "Customer" },
    { accessorKey: "refundAmount", header: "Amount", cell: ({ row }) => formatINR(row.original.refundAmount) },
    { accessorKey: "status", header: "Status", cell: ({ row }) => <StatusBadge status={row.original.status} /> },
    { accessorKey: "requestedAt", header: "Requested", cell: ({ row }) => formatDate(row.original.requestedAt) },
    {
      id: "actions",
      header: "",
      enableHiding: false,
      cell: ({ row }) => (
        <Button size="sm" variant="outline" onClick={() => setProcessing(row.original)}>
          <IndianRupee className="size-3.5" /> Process Refund
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Refund Processing" description={`${returns.length} refunds ready to be processed`} />

      <DataTable
        columns={columns}
        data={returns}
        searchKey="orderNumber"
        searchPlaceholder="Search by order number..."
        exportName="refund-processing"
        emptyTitle="No refunds to process"
        emptyDescription="Refunds ready for disbursement will appear here."
      />

      <AlertDialog open={!!processing} onOpenChange={(v) => !v && setProcessing(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Process refund?</AlertDialogTitle>
            <AlertDialogDescription>
              This disburses {processing && formatINR(processing.refundAmount)} to {processing?.customerName} for order {processing?.orderNumber}.
              This is a financial action and cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={processRefund}>Process Refund</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
