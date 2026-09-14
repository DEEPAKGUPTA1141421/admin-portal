"use client";

import { useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { INITIAL_RESERVATIONS, type ReservationRecord } from "@/lib/mock/inventory-local";
import { formatDateTime, formatNumber } from "@/lib/format";

export default function StockReservationsPage() {
  const [data, setData] = useState<ReservationRecord[]>(INITIAL_RESERVATIONS);

  const release = (id: string) => {
    setData((prev) => prev.map((r) => (r.id === id ? { ...r, status: "released" } : r)));
    toast.success("Reservation released");
  };

  const columns: ColumnDef<ReservationRecord, unknown>[] = [
    { accessorKey: "product", header: "Product" },
    { accessorKey: "warehouse", header: "Warehouse" },
    { accessorKey: "quantity", header: "Quantity", cell: ({ row }) => formatNumber(row.original.quantity) },
    { accessorKey: "reservedFor", header: "Reserved For" },
    { accessorKey: "reservedAt", header: "Reserved At", cell: ({ row }) => formatDateTime(row.original.reservedAt) },
    { accessorKey: "status", header: "Status", cell: ({ row }) => <StatusBadge status={row.original.status} /> },
    {
      id: "actions",
      header: "",
      cell: ({ row }) =>
        row.original.status === "active" ? (
          <Button size="sm" variant="outline" onClick={() => release(row.original.id)}>Release</Button>
        ) : null,
      enableSorting: false,
      enableHiding: false,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Stock Reservations" description="Stock held against pending orders" />
      <DataTable
        columns={columns}
        data={data}
        searchKey="product"
        searchPlaceholder="Search reservations..."
        exportName="stock-reservations"
        emptyTitle="No reservations"
      />
    </div>
  );
}
