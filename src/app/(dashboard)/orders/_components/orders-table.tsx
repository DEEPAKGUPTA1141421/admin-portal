"use client";

import { useMemo } from "react";
import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import { Eye } from "lucide-react";
import { DataTable } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import type { Order } from "@/lib/types";
import { formatDate, formatINR } from "@/lib/format";

export function sharedOrderColumns(): ColumnDef<Order, unknown>[] {
  return [
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
    { accessorKey: "sellerName", header: "Seller" },
    { accessorKey: "amount", header: "Amount", cell: ({ row }) => formatINR(row.original.amount) },
    { accessorKey: "paymentStatus", header: "Payment", cell: ({ row }) => <StatusBadge status={row.original.paymentStatus} /> },
    { accessorKey: "status", header: "Status", cell: ({ row }) => <StatusBadge status={row.original.status} /> },
    { accessorKey: "placedAt", header: "Placed", cell: ({ row }) => formatDate(row.original.placedAt) },
    {
      id: "actions",
      header: "",
      enableSorting: false,
      enableHiding: false,
      cell: ({ row }) => (
        <Button variant="ghost" size="icon-sm" asChild>
          <Link href={`/orders/all-orders/${row.original.id}`}>
            <Eye className="size-4" />
          </Link>
        </Button>
      ),
    },
  ];
}

export function OrdersStatusTable({
  data,
  exportName,
  emptyTitle = "No orders found",
  emptyDescription,
}: {
  data: Order[];
  exportName: string;
  emptyTitle?: string;
  emptyDescription?: string;
}) {
  const columns = useMemo(() => sharedOrderColumns(), []);

  return (
    <DataTable
      columns={columns}
      data={data}
      searchKey="orderNumber"
      searchPlaceholder="Search by order number..."
      exportName={exportName}
      emptyTitle={emptyTitle}
      emptyDescription={emptyDescription}
    />
  );
}
