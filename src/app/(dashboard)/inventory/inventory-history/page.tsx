"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { INVENTORY_HISTORY, type HistoryRecord } from "@/lib/mock/inventory-local";
import { formatDateTime } from "@/lib/format";

const columns: ColumnDef<HistoryRecord, unknown>[] = [
  { accessorKey: "timestamp", header: "Timestamp", cell: ({ row }) => formatDateTime(row.original.timestamp) },
  { accessorKey: "product", header: "Product" },
  { accessorKey: "sku", header: "SKU" },
  { accessorKey: "warehouse", header: "Warehouse" },
  { accessorKey: "action", header: "Action", cell: ({ row }) => <StatusBadge status={row.original.action} /> },
  {
    accessorKey: "quantity",
    header: "Quantity",
    cell: ({ row }) => {
      const v = row.original.quantity;
      return <span className={v >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}>{v >= 0 ? `+${v}` : v}</span>;
    },
  },
  { accessorKey: "performedBy", header: "Performed By" },
];

export default function InventoryHistoryPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Inventory History" description="Audit trail of all stock movements across warehouses" />
      <DataTable
        columns={columns}
        data={INVENTORY_HISTORY}
        searchKey="product"
        searchPlaceholder="Search movements..."
        exportName="inventory-history"
        emptyTitle="No movement history"
      />
    </div>
  );
}
