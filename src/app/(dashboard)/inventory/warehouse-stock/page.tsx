"use client";

import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable } from "@/components/shared/data-table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { INVENTORY_DATA, WAREHOUSES_DATA } from "@/lib/mock/generate";
import type { InventoryItem } from "@/lib/types";
import { formatNumber } from "@/lib/format";

const columns: ColumnDef<InventoryItem, unknown>[] = [
  { accessorKey: "productName", header: "Product" },
  { accessorKey: "sku", header: "SKU" },
  { accessorKey: "sellerName", header: "Seller" },
  { accessorKey: "physicalStock", header: "Physical", cell: ({ row }) => formatNumber(row.original.physicalStock) },
  { accessorKey: "reservedStock", header: "Reserved", cell: ({ row }) => formatNumber(row.original.reservedStock) },
  { accessorKey: "availableStock", header: "Available", cell: ({ row }) => formatNumber(row.original.availableStock) },
  { accessorKey: "damagedStock", header: "Damaged", cell: ({ row }) => formatNumber(row.original.damagedStock) },
  { accessorKey: "inTransitStock", header: "In Transit", cell: ({ row }) => formatNumber(row.original.inTransitStock) },
];

export default function WarehouseStockPage() {
  const [warehouseId, setWarehouseId] = useState<string>("all");

  const filtered = useMemo(
    () => (warehouseId === "all" ? INVENTORY_DATA : INVENTORY_DATA.filter((i) => i.warehouseId === warehouseId)),
    [warehouseId]
  );

  const toolbarExtra = (
    <Select value={warehouseId} onValueChange={setWarehouseId}>
      <SelectTrigger className="w-56"><SelectValue placeholder="All warehouses" /></SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Warehouses</SelectItem>
        {WAREHOUSES_DATA.map((w) => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}
      </SelectContent>
    </Select>
  );

  return (
    <div className="space-y-6">
      <PageHeader title="Warehouse Stock" description="Per-warehouse stock breakdown across all SKUs" />
      <DataTable
        columns={columns}
        data={filtered}
        searchKey="productName"
        searchPlaceholder="Search products..."
        exportName="warehouse-stock"
        toolbarExtra={toolbarExtra}
        emptyTitle="No stock records"
        emptyDescription="No inventory found for the selected warehouse."
      />
    </div>
  );
}
