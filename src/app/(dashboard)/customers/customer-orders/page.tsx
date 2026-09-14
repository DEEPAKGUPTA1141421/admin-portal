"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CUSTOMERS_DATA, ORDERS_DATA } from "@/lib/mock/generate";
import type { Order } from "@/lib/types";
import { formatDate, formatINR } from "@/lib/format";

export default function CustomerOrdersPage() {
  const [customerId, setCustomerId] = useState<string>("all");

  const data = useMemo(
    () => (customerId === "all" ? ORDERS_DATA : ORDERS_DATA.filter((o) => o.customerId === customerId)),
    [customerId]
  );

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
      { accessorKey: "status", header: "Status", cell: ({ row }) => <StatusBadge status={row.original.status} /> },
      { accessorKey: "paymentStatus", header: "Payment", cell: ({ row }) => <StatusBadge status={row.original.paymentStatus} /> },
      { accessorKey: "placedAt", header: "Placed", cell: ({ row }) => formatDate(row.original.placedAt) },
    ],
    []
  );

  return (
    <div className="space-y-6">
      <PageHeader title="Customer Orders" description="All orders, filterable by customer" />
      <DataTable
        columns={columns}
        data={data}
        searchKey="orderNumber"
        searchPlaceholder="Search by order number..."
        exportName="customer-orders"
        emptyTitle="No orders found"
        toolbarExtra={
          <Select value={customerId} onValueChange={setCustomerId}>
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder="Filter by customer" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Customers</SelectItem>
              {CUSTOMERS_DATA.slice(0, 100).map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      />
    </div>
  );
}
