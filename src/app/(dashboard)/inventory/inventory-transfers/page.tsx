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
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { INVENTORY_DATA, WAREHOUSES_DATA } from "@/lib/mock/generate";
import { INITIAL_TRANSFERS, type TransferRecord } from "@/lib/mock/inventory-local";
import { formatDateTime, formatNumber } from "@/lib/format";

function NewTransferDialog({ onCreate }: { onCreate: (t: TransferRecord) => void }) {
  const [open, setOpen] = useState(false);
  const [productId, setProductId] = useState("");
  const [fromId, setFromId] = useState("");
  const [toId, setToId] = useState("");
  const [qty, setQty] = useState("10");

  const submit = () => {
    const product = INVENTORY_DATA.find((p) => p.id === productId);
    const from = WAREHOUSES_DATA.find((w) => w.id === fromId);
    const to = WAREHOUSES_DATA.find((w) => w.id === toId);
    const n = Number(qty);
    if (!product || !from || !to) {
      toast.error("Select product, source and destination warehouse");
      return;
    }
    if (from.id === to.id) {
      toast.error("Source and destination warehouses must differ");
      return;
    }
    if (!n || n <= 0) {
      toast.error("Enter a valid quantity");
      return;
    }
    onCreate({
      id: `TRF-NEW-${Date.now()}`,
      product: product.productName,
      sku: product.sku,
      fromWarehouse: from.name,
      toWarehouse: to.name,
      quantity: n,
      status: "pending",
      initiatedAt: new Date().toISOString(),
    });
    toast.success(`Transfer of ${n} units initiated`);
    setOpen(false);
    setProductId(""); setFromId(""); setToId(""); setQty("10");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm"><Plus /> New Transfer</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Inventory Transfer</DialogTitle>
          <DialogDescription>Move stock between warehouses.</DialogDescription>
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
              <Label>From Warehouse</Label>
              <Select value={fromId} onValueChange={setFromId}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Source" /></SelectTrigger>
                <SelectContent>
                  {WAREHOUSES_DATA.map((w) => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>To Warehouse</Label>
              <Select value={toId} onValueChange={setToId}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Destination" /></SelectTrigger>
                <SelectContent>
                  {WAREHOUSES_DATA.map((w) => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="transfer-qty">Quantity</Label>
            <Input id="transfer-qty" type="number" min={1} value={qty} onChange={(e) => setQty(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={submit}>Initiate Transfer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function InventoryTransfersPage() {
  const [data, setData] = useState<TransferRecord[]>(INITIAL_TRANSFERS);

  const columns: ColumnDef<TransferRecord, unknown>[] = [
    { accessorKey: "product", header: "Product" },
    { accessorKey: "sku", header: "SKU" },
    { accessorKey: "fromWarehouse", header: "From" },
    { accessorKey: "toWarehouse", header: "To" },
    { accessorKey: "quantity", header: "Quantity", cell: ({ row }) => formatNumber(row.original.quantity) },
    { accessorKey: "status", header: "Status", cell: ({ row }) => <StatusBadge status={row.original.status} /> },
    { accessorKey: "initiatedAt", header: "Initiated At", cell: ({ row }) => formatDateTime(row.original.initiatedAt) },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inventory Transfers"
        description="Track stock movement between warehouses"
        actions={<NewTransferDialog onCreate={(t) => setData((prev) => [t, ...prev])} />}
      />
      <DataTable
        columns={columns}
        data={data}
        searchKey="product"
        searchPlaceholder="Search transfers..."
        exportName="inventory-transfers"
        emptyTitle="No transfers"
      />
    </div>
  );
}
