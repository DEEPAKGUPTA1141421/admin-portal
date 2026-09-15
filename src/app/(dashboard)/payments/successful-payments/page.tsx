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

export default function SuccessfulPaymentsPage() {
  const mockData = useMemo(() => PAYMENTS_DATA.filter((p) => p.status === "captured"), []);
  const [data, setData] = useState<Payment[]>(mockData);
  const [detail, setDetail] = useState<Payment | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchPayments({ status: "SUCCESS", size: 50 })
      .then((res) => {
        if (!cancelled) setData(res.payments.map(mapPaymentSummaryToPayment));
      })
      .catch(() => {
        if (!cancelled) toast.error("Could not load data — backend unreachable");
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
      <PageHeader title="Successful Payments" description="Captured payments settled successfully" />
      <DataTable
        columns={columns}
        data={data}
        searchKey="orderNumber"
        searchPlaceholder="Search by order number..."
        exportName="successful-payments"
        emptyTitle="No successful payments"
      />
      <PaymentDetailSheet payment={detail} open={!!detail} onOpenChange={(o) => !o && setDetail(null)} />
    </div>
  );
}
