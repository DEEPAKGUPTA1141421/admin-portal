"use client";

import { useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
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
import { INVENTORY_DATA } from "@/lib/mock/generate";
import { INITIAL_ADJUSTMENTS, ADJUSTMENT_TYPES, type AdjustmentRecord, type AdjustmentType } from "@/lib/mock/inventory-local";
import { formatDateTime } from "@/lib/format";

function NewAdjustmentDialog({ onCreate }: { onCreate: (a: AdjustmentRecord) => void }) {
  const [open, setOpen] = useState(false);
  const [productId, setProductId] = useState("");
  const [type, setType] = useState<AdjustmentType>("correction");
  const [delta, setDelta] = useState("0");
  const [reason, setReason] = useState("");

  const submit = () => {
    const item = INVENTORY_DATA.find((p) => p.id === productId);
    const n = Number(delta);
    if (!item) {
      toast.error("Select a product");
      return;
    }
    if (!n) {
      toast.error("Enter a non-zero quantity delta");
      return;
    }
    onCreate({
      id: `ADJ-NEW-${Date.now()}`,
      product: item.productName,
      sku: item.sku,
      warehouse: item.warehouseName,
      type,
      quantityDelta: n,
      adjustedBy: "You",
      date: new Date().toISOString(),
      reason: reason || "Manual adjustment",
    });
    toast.success(`Adjustment recorded for ${item.productName}`);
    setOpen(false);
    setProductId(""); setDelta("0"); setReason("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm"><Plus /> New Adjustment</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Stock Adjustment</DialogTitle>
          <DialogDescription>Log a manual correction, damage write-off, or return restock.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>Product</Label>
            <Select value={productId} onValueChange={setProductId}>
              <SelectTrigger className="w-full"><SelectValue placeholder="Select product" /></SelectTrigger>
              <SelectContent>
                {INVENTORY_DATA.slice(0, 60).map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.productName} ({p.sku})</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Type</Label>
              <Select value={type} onValueChange={(v) => setType(v as AdjustmentType)}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ADJUSTMENT_TYPES.map((t) => <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="delta">Quantity Delta</Label>
              <Input id="delta" type="number" value={delta} onChange={(e) => setDelta(e.target.value)} placeholder="e.g. -5 or +10" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="reason">Reason</Label>
            <Textarea id="reason" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Describe the reason for this adjustment" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={submit}>Save Adjustment</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function StockAdjustmentsPage() {
  const [data, setData] = useState<AdjustmentRecord[]>(INITIAL_ADJUSTMENTS);

  const columns: ColumnDef<AdjustmentRecord, unknown>[] = [
    { accessorKey: "product", header: "Product" },
    { accessorKey: "warehouse", header: "Warehouse" },
    { accessorKey: "type", header: "Type", cell: ({ row }) => <StatusBadge status={row.original.type} /> },
    {
      accessorKey: "quantityDelta",
      header: "Delta",
      cell: ({ row }) => {
        const v = row.original.quantityDelta;
        return <span className={v >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}>{v >= 0 ? `+${v}` : v}</span>;
      },
    },
    { accessorKey: "reason", header: "Reason" },
    { accessorKey: "adjustedBy", header: "Adjusted By" },
    { accessorKey: "date", header: "Date", cell: ({ row }) => formatDateTime(row.original.date) },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Stock Adjustments"
        description="History of manual stock corrections, damages, and return restocks"
        actions={<NewAdjustmentDialog onCreate={(a) => setData((prev) => [a, ...prev])} />}
      />
      <DataTable
        columns={columns}
        data={data}
        searchKey="product"
        searchPlaceholder="Search adjustments..."
        exportName="stock-adjustments"
        emptyTitle="No adjustments recorded"
      />
    </div>
  );
}
