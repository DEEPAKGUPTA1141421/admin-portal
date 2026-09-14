"use client";

import { useState } from "react";
import Image from "next/image";
import { type ColumnDef } from "@tanstack/react-table";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { DataTable } from "@/components/shared/data-table";
import { RETURNS_DATA } from "@/lib/mock/generate";
import type { ReturnRequest } from "@/lib/types";
import { formatINR, formatDate } from "@/lib/format";

export default function RefundRequestsPage() {
  const [returns] = useState<ReturnRequest[]>(() => RETURNS_DATA.filter((r) => r.status === "refund_initiated"));

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
    { accessorKey: "refundAmount", header: "Refund Amount", cell: ({ row }) => formatINR(row.original.refundAmount) },
    { accessorKey: "status", header: "Status", cell: ({ row }) => <StatusBadge status={row.original.status} /> },
    { accessorKey: "requestedAt", header: "Requested", cell: ({ row }) => formatDate(row.original.requestedAt) },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Refund Requests" description={`${returns.length} refunds initiated and awaiting processing`} />

      <DataTable
        columns={columns}
        data={returns}
        searchKey="orderNumber"
        searchPlaceholder="Search by order number..."
        exportName="refund-requests"
        emptyTitle="No refund requests"
        emptyDescription="Refunds initiated after inspection will appear here."
      />
    </div>
  );
}
