"use client";

import { useEffect, useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { PaymentDetailSheet } from "@/components/shared/payment-detail-sheet";
import { Button } from "@/components/ui/button";
import { PAYMENTS_DATA } from "@/lib/mock/generate";
import { fetchPayments, fetchPaymentDetail, mapPaymentSummaryToPayment, mapPaymentDetailToPayment } from "@/lib/api/payments";
import type { Payment } from "@/lib/types";
import { formatDateTime, formatINR } from "@/lib/format";

export default function PaymentRefundsPage() {
  const mockData = useMemo(() => PAYMENTS_DATA.filter((p) => p.status === "refunded" || p.status === "partially_refunded"), []);
  const [data, setData] = useState<Payment[]>(mockData);
  const [detail, setDetail] = useState<Payment | null>(null);

  useEffect(() => {
    let cancelled = false;
    // REVERSED = fully refunded, REVERSED_FAILED = refund attempted but did not
    // complete — the closest real analogue of the mock's "partially_refunded".
    Promise.allSettled([
      fetchPayments({ status: "REVERSED", size: 50 }),
      fetchPayments({ status: "REVERSED_FAILED", size: 50 }),
    ]).then(([reversed, reversedFailed]) => {
      if (cancelled) return;
      if (reversed.status === "rejected" && reversedFailed.status === "rejected") {
        toast.info("Using demo data — backend unreachable");
        return;
      }
      const rows = [
        ...(reversed.status === "fulfilled" ? reversed.value.payments : []),
        ...(reversedFailed.status === "fulfilled" ? reversedFailed.value.payments : []),
      ];
      setData(rows.map(mapPaymentSummaryToPayment));
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

  const columns: ColumnDef<Payment, unknown>[] = [
    { accessorKey: "orderNumber", header: "Order #" },
    { accessorKey: "customerName", header: "Customer" },
    { accessorKey: "amount", header: "Order Amount", cell: ({ row }) => formatINR(row.original.amount) },
    {
      id: "refundAmount",
      header: "Refund Amount",
      cell: ({ row }) => formatINR(row.original.status === "partially_refunded" ? Math.round(row.original.amount * 0.5) : row.original.amount),
    },
    { accessorKey: "gateway", header: "Gateway" },
    { accessorKey: "status", header: "Status", cell: ({ row }) => <StatusBadge status={row.original.status} /> },
    { accessorKey: "createdAt", header: "Date", cell: ({ row }) => formatDateTime(row.original.createdAt) },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => <Button size="sm" variant="outline" onClick={() => openDetail(row.original)}>View Refund</Button>,
      enableSorting: false,
      enableHiding: false,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Payment Refunds" description="Fully and partially refunded payments" />
      <DataTable
        columns={columns}
        data={data}
        searchKey="orderNumber"
        searchPlaceholder="Search by order number..."
        exportName="payment-refunds"
        emptyTitle="No refunds"
      />
      <PaymentDetailSheet payment={detail} open={!!detail} onOpenChange={(o) => !o && setDetail(null)} />
    </div>
  );
}
