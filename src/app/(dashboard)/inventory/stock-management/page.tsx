"use client";

import { useEffect, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, PackagePlus } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable } from "@/components/shared/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { INVENTORY_DATA as INITIAL_DATA } from "@/lib/mock/generate";
import { fetchVariantStock, updateVariantStock } from "@/lib/api/stock";
import type { InventoryItem } from "@/lib/types";
import { formatNumber } from "@/lib/format";

const REASONS = ["Stock received", "Cycle count correction", "Damage write-off", "Return restock", "Manual correction"];

function AdjustDialog({ item, onAdjust }: { item: InventoryItem; onAdjust: (id: string, delta: number, reason: string) => void }) {
  const [open, setOpen] = useState(false);
  const [direction, setDirection] = useState<"add" | "remove">("add");
  const [qty, setQty] = useState("1");
  const [reason, setReason] = useState(REASONS[0]);

  const submit = () => {
    const n = Number(qty);
    if (!n || n <= 0) {
      toast.error("Enter a valid quantity");
      return;
    }
    onAdjust(item.id, direction === "add" ? n : -n, reason);
    toast.success(`Stock ${direction === "add" ? "increased" : "decreased"} by ${n} for ${item.productName}`);
    setOpen(false);
    setQty("1");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>Adjust Stock</DropdownMenuItem>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adjust Stock — {item.productName}</DialogTitle>
          <DialogDescription>SKU {item.sku} · Current physical stock: {formatNumber(item.physicalStock)}</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="flex gap-2">
            <Button type="button" variant={direction === "add" ? "default" : "outline"} size="sm" onClick={() => setDirection("add")}>+ Add</Button>
            <Button type="button" variant={direction === "remove" ? "default" : "outline"} size="sm" onClick={() => setDirection("remove")}>− Remove</Button>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="qty">Quantity</Label>
            <Input id="qty" type="number" min={1} value={qty} onChange={(e) => setQty(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Reason</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                {REASONS.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={submit}>Apply Adjustment</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function StockManagementPage() {
  const [data, setData] = useState<InventoryItem[]>(INITIAL_DATA);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchVariantStock({ stockFilter: "ALL" })
      .then((res) => {
        if (!cancelled) setData(res.items);
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

  const handleAdjust = (id: string, delta: number, _reason: string) => {
    const item = data.find((i) => i.id === id);
    if (!item) return;
    const physicalStock = Math.max(0, item.physicalStock + delta);
    const availableStock = Math.max(0, physicalStock - item.reservedStock);
    setData((prev) => prev.map((i) => (i.id === id ? { ...i, physicalStock, availableStock } : i)));

    updateVariantStock(id, physicalStock).catch(() => {
      toast.error("Failed to save stock change to the server — reverting");
      setData((prev) => prev.map((i) => (i.id === id ? item : i)));
    });
  };

  const columns: ColumnDef<InventoryItem, unknown>[] = [
    { accessorKey: "productName", header: "Product" },
    { accessorKey: "sku", header: "SKU" },
    { accessorKey: "warehouseName", header: "Warehouse" },
    { accessorKey: "physicalStock", header: "Physical", cell: ({ row }) => formatNumber(row.original.physicalStock) },
    { accessorKey: "reservedStock", header: "Reserved", cell: ({ row }) => formatNumber(row.original.reservedStock) },
    { accessorKey: "availableStock", header: "Available", cell: ({ row }) => formatNumber(row.original.availableStock) },
    { accessorKey: "reorderLevel", header: "Reorder Level", cell: ({ row }) => formatNumber(row.original.reorderLevel) },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm"><MoreHorizontal className="size-4" /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <AdjustDialog item={row.original} onAdjust={handleAdjust} />
          </DropdownMenuContent>
        </DropdownMenu>
      ),
      enableSorting: false,
      enableHiding: false,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Stock Management"
        description={loading ? "Loading live stock..." : "View and adjust physical stock levels across the catalog"}
        actions={<Button size="sm" variant="outline"><PackagePlus /> Bulk Adjust</Button>}
      />
      <DataTable
        columns={columns}
        data={data}
        searchKey="productName"
        searchPlaceholder="Search products..."
        exportName="stock-management"
        emptyTitle="No inventory records"
      />
    </div>
  );
}
