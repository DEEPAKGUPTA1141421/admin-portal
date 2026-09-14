"use client";

import { useState } from "react";
import Image from "next/image";
import { type ColumnDef } from "@tanstack/react-table";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { DataTable } from "@/components/shared/data-table";
import { RETURNS_DATA } from "@/lib/mock/generate";
import type { ReturnRequest, ReturnStatus } from "@/lib/types";
import { formatINR, formatDate } from "@/lib/format";

const HISTORY_STATUSES: ReturnStatus[] = ["refunded", "closed"];

export default function RefundHistoryPage() {
  const [returns] = useState<ReturnRequest[]>(() => RETURNS_DATA.filter((r) => HISTORY_STATUSES.includes(r.status)));

  const totalRefunded = returns.reduce((s, r) => s + r.refundAmount, 0);

  const columns: ColumnDef<ReturnRequest, unknown>[] = [
    {
      accessorKey: "productName",
      header: "Product",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Image src={row.original.image} alt={row.original.productName} width={36} height={36} className="rounded-md object-cover" unoptimized />
          <div className="max-w-[220px] truncate font-medium">{row.original.productName}</div>
        </div>
      ),
    },
    { accessorKey: "orderNumber", header: "Order" },
    { accessorKey: "customerName", header: "Customer" },
    { accessorKey: "sellerName", header: "Seller" },
    { accessorKey: "refundAmount", header: "Refunded", cell: ({ row }) => formatINR(row.original.refundAmount) },
    { accessorKey: "status", header: "Status", cell: ({ row }) => <StatusBadge status={row.original.status} /> },
    { accessorKey: "requestedAt", header: "Requested", cell: ({ row }) => formatDate(row.original.requestedAt) },
    { accessorKey: "resolvedAt", header: "Resolved", cell: ({ row }) => formatDate(row.original.resolvedAt) },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Refund History"
        description={`${returns.length} completed refunds · ${formatINR(totalRefunded)} disbursed in total`}
      />

      <DataTable
        columns={columns}
        data={returns}
        searchKey="orderNumber"
        searchPlaceholder="Search by order number..."
        exportName="refund-history"
        emptyTitle="No refund history"
        emptyDescription="Completed and closed refunds will appear here as a read-only ledger."
      />
    </div>
  );
}
