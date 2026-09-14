"use client";

import { useMemo, useState } from "react";
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
import { PAYMENTS_DATA } from "@/lib/mock/generate";
import type { Payment } from "@/lib/types";
import { formatDateTime, formatINR } from "@/lib/format";

export default function PaymentDisputesPage() {
  const initial = useMemo(() => PAYMENTS_DATA.filter((p) => p.status === "disputed"), []);
  const [data, setData] = useState<Payment[]>(initial);
  const [action, setAction] = useState<{ payment: Payment; kind: "accept" | "contest" } | null>(null);

  const resolve = () => {
    if (!action) return;
    setData((prev) => prev.map((p) => (p.id === action.payment.id ? { ...p, status: action.kind === "accept" ? "refunded" : "cancelled" } : p)));
    toast.success(action.kind === "accept" ? `Dispute accepted — refund issued for ${action.payment.orderNumber}` : `Dispute contested for ${action.payment.orderNumber}`);
    setAction(null);
  };

  const columns: ColumnDef<Payment, unknown>[] = [
    { accessorKey: "orderNumber", header: "Order #" },
    { accessorKey: "customerName", header: "Customer" },
    { accessorKey: "amount", header: "Amount", cell: ({ row }) => formatINR(row.original.amount) },
    { accessorKey: "gateway", header: "Gateway" },
    { accessorKey: "status", header: "Status", cell: ({ row }) => <StatusBadge status={row.original.status} /> },
    { accessorKey: "createdAt", header: "Date", cell: ({ row }) => formatDateTime(row.original.createdAt) },
    {
      id: "actions",
      header: "",
      cell: ({ row }) =>
        row.original.status === "disputed" ? (
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => setAction({ payment: row.original, kind: "contest" })}>Contest</Button>
            <Button size="sm" onClick={() => setAction({ payment: row.original, kind: "accept" })}>Accept</Button>
          </div>
        ) : null,
      enableSorting: false,
      enableHiding: false,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Payment Disputes" description="Disputed payments requiring a resolution decision" />
      <DataTable
        columns={columns}
        data={data}
        searchKey="orderNumber"
        searchPlaceholder="Search by order number..."
        exportName="payment-disputes"
        emptyTitle="No disputes"
        emptyDescription="There are currently no disputed payments."
      />

      <AlertDialog open={!!action} onOpenChange={(o) => !o && setAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{action?.kind === "accept" ? "Accept Dispute" : "Contest Dispute"}</AlertDialogTitle>
            <AlertDialogDescription>
              {action?.kind === "accept"
                ? `This will refund ${action && formatINR(action.payment.amount)} to ${action?.payment.customerName} and close the dispute.`
                : `This will submit evidence to contest the dispute for order ${action?.payment.orderNumber}.`}
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
