"use client";

import { useMemo } from "react";
import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import { RotateCcw } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { KpiCard } from "@/components/shared/kpi-card";
import { ORDERS_DATA } from "@/lib/mock/generate";
import type { Order } from "@/lib/types";
import { formatDate, formatINR, formatNumber } from "@/lib/format";

export default function CustomerRefundsPage() {
  const data = useMemo(
    () => ORDERS_DATA.filter((o) => o.paymentStatus === "refunded" || o.paymentStatus === "partially_refunded"),
    []
  );
  const totalRefunded = useMemo(() => data.reduce((s, o) => s + o.amount, 0), [data]);

  const columns = useMemo<ColumnDef<Order, unknown>[]>(
    () => [
      {
        accessorKey: "orderNumber",
        header: "Order #",
        cell: ({ row }) => (
          <Link href={`/orders/all-orders/${row.original.id}`} className="font-medium hover:underline">
            {row.original.orderNumber}
          </Link>
        ),
      },
      { accessorKey: "customerName", header: "Customer" },
      { accessorKey: "amount", header: "Amount", cell: ({ row }) => formatINR(row.original.amount) },
      { accessorKey: "paymentStatus", header: "Refund Status", cell: ({ row }) => <StatusBadge status={row.original.paymentStatus} /> },
      { accessorKey: "placedAt", header: "Order Date", cell: ({ row }) => formatDate(row.original.placedAt) },
    ],
    []
  );

  return (
    <div className="space-y-6">
      <PageHeader title="Customer Refunds" description="Orders refunded or partially refunded to customers" />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <KpiCard label="Refunded Orders" value={formatNumber(data.length)} icon={RotateCcw} tone="orange" />
        <KpiCard label="Total Refunded" value={formatINR(totalRefunded, true)} icon={RotateCcw} tone="red" />
      </div>
      <DataTable
        columns={columns}
        data={data}
        searchKey="customerName"
        searchPlaceholder="Search by customer..."
        exportName="customer-refunds"
        emptyTitle="No refunds found"
      />
    </div>
  );
}
