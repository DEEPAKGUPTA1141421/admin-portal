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

export default function PendingPaymentsPage() {
  const mockData = useMemo(() => PAYMENTS_DATA.filter((p) => p.status === "pending" || p.status === "authorized"), []);
  const [data, setData] = useState<Payment[]>(mockData);
  const [detail, setDetail] = useState<Payment | null>(null);

  useEffect(() => {
    let cancelled = false;
    // Backend takes one status per call — merge PENDING + INITIATED to match
    // the mock's "pending or authorized" bucket (INITIATED is the closest
    // real analogue of "authorized but not yet confirmed").
    Promise.allSettled([
      fetchPayments({ status: "PENDING", size: 50 }),
      fetchPayments({ status: "INITIATED", size: 50 }),
    ])
      .then(([pending, initiated]) => {
        if (cancelled) return;
        const rows = [
          ...(pending.status === "fulfilled" ? pending.value.payments : []),
          ...(initiated.status === "fulfilled" ? initiated.value.payments : []),
        ];
        if (pending.status === "rejected" && initiated.status === "rejected") {
          toast.error("Could not load data — backend unreachable");
          return;
        }
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
    { accessorKey: "amount", header: "Amount", cell: ({ row }) => formatINR(row.original.amount) },
    { accessorKey: "method", header: "Method" },
    { accessorKey: "gateway", header: "Gateway" },
    { accessorKey: "status", header: "Status", cell: ({ row }) => <StatusBadge status={row.original.status} /> },
    { accessorKey: "createdAt", header: "Created At", cell: ({ row }) => formatDateTime(row.original.createdAt) },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => <Button size="sm" variant="outline" onClick={() => openDetail(row.original)}>View Detail</Button>,
      enableSorting: false,
      enableHiding: false,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Pending Payments" description="Payments awaiting confirmation or authorization" />
      <DataTable
        columns={columns}
        data={data}
        searchKey="orderNumber"
        searchPlaceholder="Search by order number..."
        exportName="pending-payments"
        emptyTitle="No pending payments"
      />
      <PaymentDetailSheet payment={detail} open={!!detail} onOpenChange={(o) => !o && setDetail(null)} />
    </div>
  );
}
