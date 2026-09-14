"use client";

import { useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CHARGEBACKS, type ChargebackRecord } from "@/lib/mock/payments-local";
import { formatDateTime, formatINR } from "@/lib/format";

export default function ChargebacksPage() {
  const [data, setData] = useState<ChargebackRecord[]>(CHARGEBACKS);
  const [action, setAction] = useState<{ record: ChargebackRecord; kind: "accept" | "contest" } | null>(null);

  const resolve = () => {
    if (!action) return;
    setData((prev) => prev.map((r) => (r.id === action.record.id ? { ...r, status: action.kind === "accept" ? "accepted" : "contested" } : r)));
    toast.success(action.kind === "accept" ? `Chargeback accepted for ${action.record.orderNumber}` : `Chargeback contested for ${action.record.orderNumber}`);
    setAction(null);
  };

  const columns: ColumnDef<ChargebackRecord, unknown>[] = [
    { accessorKey: "orderNumber", header: "Order #" },
    { accessorKey: "customerName", header: "Customer" },
    { accessorKey: "amount", header: "Amount", cell: ({ row }) => formatINR(row.original.amount) },
    { accessorKey: "gateway", header: "Gateway" },
    { accessorKey: "reason", header: "Reason" },
    { accessorKey: "status", header: "Status", cell: ({ row }) => <StatusBadge status={row.original.status} /> },
    { accessorKey: "filedAt", header: "Filed At", cell: ({ row }) => formatDateTime(row.original.filedAt) },
    {
      id: "actions",
      header: "",
      cell: ({ row }) =>
        row.original.status === "open" ? (
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => setAction({ record: row.original, kind: "contest" })}>Contest</Button>
            <Button size="sm" onClick={() => setAction({ record: row.original, kind: "accept" })}>Accept</Button>
          </div>
        ) : null,
      enableSorting: false,
      enableHiding: false,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Chargebacks" description="Card network chargebacks filed against marketplace transactions" />
      <DataTable
        columns={columns}
        data={data}
        searchKey="orderNumber"
        searchPlaceholder="Search by order number..."
        exportName="chargebacks"
        emptyTitle="No chargebacks"
      />

      <AlertDialog open={!!action} onOpenChange={(o) => !o && setAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{action?.kind === "accept" ? "Accept Chargeback" : "Contest Chargeback"}</AlertDialogTitle>
            <AlertDialogDescription>
              {action?.kind === "accept"
                ? `This will accept liability and refund ${action && formatINR(action.record.amount)} for order ${action?.record.orderNumber}.`
                : `This will submit representment evidence to contest the chargeback for order ${action?.record.orderNumber}.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={resolve}>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
