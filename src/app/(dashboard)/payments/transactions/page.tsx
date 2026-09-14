"use client";

import { useEffect, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { PaymentDetailSheet } from "@/components/shared/payment-detail-sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { PAYMENTS_DATA } from "@/lib/mock/generate";
import { fetchPayments, fetchPaymentDetail, mapPaymentSummaryToPayment, mapPaymentDetailToPayment } from "@/lib/api/payments";
import { refundPayment } from "@/lib/api/orders";
import type { Payment } from "@/lib/types";
import { formatDateTime, formatINR } from "@/lib/format";

const GATEWAYS = ["razorpay", "phonepe", "cod"] as const;

export default function TransactionsPage() {
  const [data, setData] = useState<Payment[]>(PAYMENTS_DATA);
  const [detail, setDetail] = useState<Payment | null>(null);
  const [refundTarget, setRefundTarget] = useState<Payment | null>(null);
  const [refundGateway, setRefundGateway] = useState<string>("razorpay");
  const [refundReason, setRefundReason] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetchPayments({ size: 50 })
      .then((res) => {
        if (!cancelled) setData(res.payments.map(mapPaymentSummaryToPayment));
      })
      .catch(() => {
        if (!cancelled) toast.info("Using demo data — backend unreachable");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  function openDetail(p: Payment) {
    setDetail(p);
    fetchPaymentDetail(p.id)
      .then((dto) => setDetail(mapPaymentDetailToPayment(dto)))
      .catch(() => {
        /* keep the summary-level row already shown */
      });
  }

  function openRefund(p: Payment) {
    setRefundTarget(p);
    setRefundGateway("razorpay");
    setRefundReason("");
  }

  async function doRefund() {
    if (!refundTarget) return;
    if (!refundReason.trim()) {
      toast.error("A refund reason is required");
      return;
    }
    try {
      await refundPayment(refundTarget.id, {
        gateway: refundGateway,
        reason: refundReason.trim(),
      });
      setData((prev) => prev.map((p) => (p.id === refundTarget.id ? { ...p, status: "refunded" } : p)));
      toast.success(`Refund of ${formatINR(refundTarget.amount)} processed for ${refundTarget.orderNumber}`);
    } catch {
      toast.error("Refund failed — backend unreachable or rejected the request");
    }
    setRefundTarget(null);
  }

  const retry = (p: Payment) => {
    toast.success(`Retry initiated for payment ${p.transactionId}`);
  };

  const columns: ColumnDef<Payment, unknown>[] = [
    { accessorKey: "orderNumber", header: "Order #" },
    { accessorKey: "customerName", header: "Customer" },
    { accessorKey: "amount", header: "Amount", cell: ({ row }) => formatINR(row.original.amount) },
    { accessorKey: "method", header: "Method" },
    { accessorKey: "gateway", header: "Gateway" },
    { accessorKey: "transactionId", header: "Transaction ID" },
    { accessorKey: "status", header: "Status", cell: ({ row }) => <StatusBadge status={row.original.status} /> },
    { accessorKey: "createdAt", header: "Created At", cell: ({ row }) => formatDateTime(row.original.createdAt) },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const p = row.original;
        const canRefund = p.status === "captured" || p.status === "partially_refunded";
        const canRetry = p.status === "failed" || p.status === "pending";
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm"><MoreHorizontal className="size-4" /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => openDetail(p)}>View Detail</DropdownMenuItem>
              {canRetry && <DropdownMenuItem onSelect={() => retry(p)}>Retry</DropdownMenuItem>}
              {canRefund && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem variant="destructive" onSelect={() => openRefund(p)}>Refund</DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
      enableSorting: false,
      enableHiding: false,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Transactions" description="All payment transactions across the marketplace" />
      <DataTable
        columns={columns}
        data={data}
        searchKey="orderNumber"
        searchPlaceholder="Search by order number..."
        exportName="transactions"
        emptyTitle="No transactions"
      />

      <PaymentDetailSheet payment={detail} open={!!detail} onOpenChange={(o) => !o && setDetail(null)} />

      <Dialog open={!!refundTarget} onOpenChange={(o) => !o && setRefundTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Refund Payment</DialogTitle>
            <DialogDescription>
              This will refund {refundTarget && formatINR(refundTarget.amount)} for order {refundTarget?.orderNumber}. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Gateway</Label>
              <Select value={refundGateway} onValueChange={setRefundGateway}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {GATEWAYS.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Reason</Label>
              <Textarea placeholder="Reason for refund..." value={refundReason} onChange={(e) => setRefundReason(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRefundTarget(null)}>Cancel</Button>
            <Button variant="destructive" onClick={doRefund}>Confirm Refund</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
