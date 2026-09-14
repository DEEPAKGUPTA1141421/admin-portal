"use client";

import { useEffect, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { PackageX } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { KpiCard } from "@/components/shared/kpi-card";
import { DataTable } from "@/components/shared/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { INVENTORY_DATA } from "@/lib/mock/generate";
import { fetchVariantStock, updateVariantStock } from "@/lib/api/stock";
import type { InventoryItem } from "@/lib/types";
import { formatNumber } from "@/lib/format";

const MOCK_OUT_OF_STOCK = INVENTORY_DATA.filter((i) => i.availableStock <= 0);

export default function OutOfStockPage() {
  const [data, setData] = useState<InventoryItem[]>(MOCK_OUT_OF_STOCK);
  const [loading, setLoading] = useState(true);
  const [target, setTarget] = useState<InventoryItem | null>(null);
  const [qty, setQty] = useState("50");

  useEffect(() => {
    let cancelled = false;
    fetchVariantStock({ stockFilter: "OUT" })
      .then((res) => {
        if (!cancelled) setData(res.items);
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

  const restock = () => {
    if (!target) return;
    const n = Number(qty);
    if (!n || n <= 0) {
      toast.error("Enter a valid quantity");
      return;
    }
    setData((prev) => prev.filter((i) => i.id !== target.id));
    updateVariantStock(target.id, n)
      .then(() => toast.success(`Restocked ${n} units for ${target.productName}`))
      .catch(() => toast.error(`Restock saved locally but failed to sync to the server for ${target.productName}`));
    setTarget(null);
    setQty("50");
  };

  const columns: ColumnDef<InventoryItem, unknown>[] = [
    { accessorKey: "productName", header: "Product" },
    { accessorKey: "sku", header: "SKU" },
    { accessorKey: "sellerName", header: "Seller" },
    { accessorKey: "warehouseName", header: "Warehouse" },
    { accessorKey: "physicalStock", header: "Physical", cell: ({ row }) => formatNumber(row.original.physicalStock) },
    { accessorKey: "reorderLevel", header: "Reorder Level", cell: ({ row }) => formatNumber(row.original.reorderLevel) },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <Button size="sm" variant="outline" onClick={() => setTarget(row.original)}>Restock</Button>
      ),
      enableSorting: false,
      enableHiding: false,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Out of Stock" description={loading ? "Loading live stock..." : "SKUs with zero or negative available stock"} />
      <KpiCard label="Out-of-stock SKUs" value={formatNumber(data.length)} icon={PackageX} tone="red" />
      <DataTable
        columns={columns}
        data={data}
        searchKey="productName"
        searchPlaceholder="Search products..."
        exportName="out-of-stock"
        emptyTitle="No out-of-stock items"
        emptyDescription="Every SKU currently has available stock."
      />

      <Dialog open={!!target} onOpenChange={(o) => !o && setTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Restock — {target?.productName}</DialogTitle>
            <DialogDescription>SKU {target?.sku} · Enter the quantity received to replenish stock.</DialogDescription>
          </DialogHeader>
          <div className="space-y-1.5">
            <Label htmlFor="restock-qty">Quantity</Label>
            <Input id="restock-qty" type="number" min={1} value={qty} onChange={(e) => setQty(e.target.value)} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTarget(null)}>Cancel</Button>
            <Button onClick={restock}>Confirm Restock</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
