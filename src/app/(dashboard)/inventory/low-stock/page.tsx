"use client";

import { useEffect, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { KpiCard } from "@/components/shared/kpi-card";
import { DataTable } from "@/components/shared/data-table";
import { INVENTORY_DATA } from "@/lib/mock/generate";
import { fetchVariantStock } from "@/lib/api/stock";
import type { InventoryItem } from "@/lib/types";
import { formatNumber } from "@/lib/format";

const columns: ColumnDef<InventoryItem, unknown>[] = [
  { accessorKey: "productName", header: "Product" },
  { accessorKey: "sku", header: "SKU" },
  { accessorKey: "sellerName", header: "Seller" },
  { accessorKey: "warehouseName", header: "Warehouse" },
  { accessorKey: "availableStock", header: "Available", cell: ({ row }) => <span className="font-medium text-amber-600 dark:text-amber-400">{formatNumber(row.original.availableStock)}</span> },
  { accessorKey: "reorderLevel", header: "Reorder Level", cell: ({ row }) => formatNumber(row.original.reorderLevel) },
  { accessorKey: "inTransitStock", header: "In Transit", cell: ({ row }) => formatNumber(row.original.inTransitStock) },
];

const MOCK_LOW_STOCK = INVENTORY_DATA.filter((i) => i.availableStock > 0 && i.availableStock <= i.reorderLevel);

export default function LowStockPage() {
  const [lowStock, setLowStock] = useState<InventoryItem[]>(MOCK_LOW_STOCK);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchVariantStock({ stockFilter: "LOW", threshold: 10 })
      .then((res) => {
        if (!cancelled) setLowStock(res.items);
      })
      .catch(() => {
        if (!cancelled) toast.error("Could not load data — backend unreachable");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Low Stock"
        description={loading ? "Loading live stock..." : "SKUs at or below their reorder level, but not yet exhausted"}
      />
      <KpiCard label="Low-stock SKUs" value={formatNumber(lowStock.length)} icon={AlertTriangle} tone="orange" />
      <DataTable
        columns={columns}
        data={lowStock}
        searchKey="productName"
        searchPlaceholder="Search products..."
        exportName="low-stock"
        emptyTitle="No low-stock items"
        emptyDescription="All SKUs are currently above their reorder level."
      />
    </div>
  );
}
