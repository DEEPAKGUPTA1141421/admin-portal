"use client";

import { useEffect, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Boxes, PackageCheck, PackageX, AlertTriangle, Layers, Lock } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { KpiCard } from "@/components/shared/kpi-card";
import { DataTable } from "@/components/shared/data-table";
import { cn } from "@/lib/utils";
import { INVENTORY_DATA } from "@/lib/mock/generate";
import { fetchVariantStock } from "@/lib/api/stock";
import type { InventoryItem } from "@/lib/types";
import { formatNumber } from "@/lib/format";

const columns: ColumnDef<InventoryItem, unknown>[] = [
  { accessorKey: "productName", header: "Product" },
  { accessorKey: "sku", header: "SKU" },
  { accessorKey: "sellerName", header: "Seller" },
  { accessorKey: "warehouseName", header: "Warehouse" },
  { accessorKey: "physicalStock", header: "Physical", cell: ({ row }) => formatNumber(row.original.physicalStock) },
  { accessorKey: "reservedStock", header: "Reserved", cell: ({ row }) => formatNumber(row.original.reservedStock) },
  {
    accessorKey: "availableStock",
    header: "Available",
    cell: ({ row }) => {
      const flagged = row.original.availableStock <= row.original.reorderLevel;
      return (
        <span className={cn("font-medium", flagged && "text-amber-600 dark:text-amber-400")}>
          {formatNumber(row.original.availableStock)}
        </span>
      );
    },
  },
  { accessorKey: "damagedStock", header: "Damaged", cell: ({ row }) => formatNumber(row.original.damagedStock) },
  { accessorKey: "inTransitStock", header: "In Transit", cell: ({ row }) => formatNumber(row.original.inTransitStock) },
  { accessorKey: "reorderLevel", header: "Reorder Level", cell: ({ row }) => formatNumber(row.original.reorderLevel) },
];

interface Stats {
  totalSkus: number;
  totalPhysical: number;
  totalReserved: number;
  totalAvailable: number;
  lowStock: number;
  outOfStock: number;
}

function computeMockStats(): Stats {
  const totalSkus = INVENTORY_DATA.length;
  const totalPhysical = INVENTORY_DATA.reduce((s, i) => s + i.physicalStock, 0);
  const totalReserved = INVENTORY_DATA.reduce((s, i) => s + i.reservedStock, 0);
  const totalAvailable = INVENTORY_DATA.reduce((s, i) => s + i.availableStock, 0);
  const lowStock = INVENTORY_DATA.filter((i) => i.availableStock > 0 && i.availableStock <= i.reorderLevel).length;
  const outOfStock = INVENTORY_DATA.filter((i) => i.availableStock <= 0).length;
  return { totalSkus, totalPhysical, totalReserved, totalAvailable, lowStock, outOfStock };
}

export default function InventoryOverviewPage() {
  const [items, setItems] = useState<InventoryItem[]>(INVENTORY_DATA);
  const [stats, setStats] = useState<Stats>(() => computeMockStats());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetchVariantStock({ stockFilter: "ALL", size: 200 }),
      fetchVariantStock({ stockFilter: "LOW", threshold: 10, size: 1 }),
      fetchVariantStock({ stockFilter: "OUT", size: 1 }),
    ])
      .then(([all, low, out]) => {
        if (cancelled) return;
        setItems(all.items);
        const totalPhysical = all.items.reduce((s, i) => s + i.physicalStock, 0);
        const totalAvailable = all.items.reduce((s, i) => s + i.availableStock, 0);
        setStats({
          totalSkus: all.totalElements,
          totalPhysical,
          totalReserved: 0, // not tracked at variant level
          totalAvailable,
          lowStock: low.totalElements,
          outOfStock: out.totalElements,
        });
      })
      .catch(() => {
        if (!cancelled) toast.info("Using demo data — backend unreachable");
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
        title="Inventory Overview"
        description={loading ? "Loading live stock..." : "Marketplace-wide stock health across all warehouses"}
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        <KpiCard label="Total SKUs" value={formatNumber(stats.totalSkus)} icon={Boxes} tone="blue" />
        <KpiCard label="Total Physical Stock" value={formatNumber(stats.totalPhysical)} icon={Layers} />
        <KpiCard label="Total Reserved" value={formatNumber(stats.totalReserved)} icon={Lock} tone="blue" />
        <KpiCard label="Total Available" value={formatNumber(stats.totalAvailable)} icon={PackageCheck} tone="green" />
        <KpiCard label="Low Stock" value={formatNumber(stats.lowStock)} icon={AlertTriangle} tone="orange" />
        <KpiCard label="Out of Stock" value={formatNumber(stats.outOfStock)} icon={PackageX} tone="red" />
      </div>

      <DataTable
        columns={columns}
        data={items}
        searchKey="productName"
        searchPlaceholder="Search products..."
        exportName="inventory-overview"
        emptyTitle="No inventory records"
        emptyDescription="Inventory items will appear here once products are stocked."
      />
    </div>
  );
}
