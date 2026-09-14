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
import { INVENTORY_DATA } from "@/lib/mock/generate";
import { INITIAL_PURCHASE_ORDERS, type PurchaseOrderRecord } from "@/lib/mock/inventory-local";
import { formatDate, formatINR } from "@/lib/format";

const SUPPLIERS = [
  "Apex Distributors", "Northline Traders", "BlueCrest Supplies", "Vantage Wholesale",
  "Metro Sourcing Co.", "Everstock Ltd.", "Prime Vendor Partners", "Coastal Goods Supply",
];

function CreatePODialog({ onCreate }: { onCreate: (po: PurchaseOrderRecord) => void }) {
  const [open, setOpen] = useState(false);
  const [supplier, setSupplier] = useState(SUPPLIERS[0]);
  const [productId, setProductId] = useState("");
  const [qty, setQty] = useState("100");
  const [unitCost, setUnitCost] = useState("500");

  const submit = () => {
    const item = INVENTORY_DATA.find((p) => p.id === productId);
    const q = Number(qty);
    const cost = Number(unitCost);
    if (!item) {
      toast.error("Select a product");
      return;
    }
    if (!q || q <= 0 || !cost || cost <= 0) {
      toast.error("Enter valid quantity and unit cost");
      return;
    }
    onCreate({
      id: `PO-NEW-${Date.now()}`,
      poNumber: `PO-${2026}${String(Math.floor(Math.random() * 9000) + 1000)}`,
      supplier,
      product: item.productName,
      quantity: q,
      unitCost: cost,
      totalCost: q * cost,
      status: "draft",
      expectedDate: new Date(Date.now() + 7 * 86400000).toISOString(),
    });
    toast.success("Purchase order created");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm"><Plus /> Create PO</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Purchase Order</DialogTitle>
          <DialogDescription>Order new stock from a supplier.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>Supplier</Label>
            <Select value={supplier} onValueChange={setSupplier}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                {SUPPLIERS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
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
              <Label htmlFor="po-qty">Quantity</Label>
              <Input id="po-qty" type="number" value={qty} onChange={(e) => setQty(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="po-cost">Unit Cost (₹)</Label>
              <Input id="po-cost" type="number" value={unitCost} onChange={(e) => setUnitCost(e.target.value)} />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={submit}>Create PO</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function PurchaseOrdersPage() {
  const [data, setData] = useState<PurchaseOrderRecord[]>(INITIAL_PURCHASE_ORDERS);

  const columns: ColumnDef<PurchaseOrderRecord, unknown>[] = [
    { accessorKey: "poNumber", header: "PO Number" },
    { accessorKey: "supplier", header: "Supplier" },
    { accessorKey: "product", header: "Product" },
    { accessorKey: "quantity", header: "Quantity" },
    { accessorKey: "unitCost", header: "Unit Cost", cell: ({ row }) => formatINR(row.original.unitCost) },
    { accessorKey: "totalCost", header: "Total Cost", cell: ({ row }) => formatINR(row.original.totalCost) },
    { accessorKey: "status", header: "Status", cell: ({ row }) => <StatusBadge status={row.original.status} /> },
    { accessorKey: "expectedDate", header: "Expected Date", cell: ({ row }) => formatDate(row.original.expectedDate) },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Purchase Orders"
        description="Stock replenishment orders placed with suppliers"
        actions={<CreatePODialog onCreate={(po) => setData((prev) => [po, ...prev])} />}
      />
      <DataTable
        columns={columns}
        data={data}
        searchKey="poNumber"
        searchPlaceholder="Search purchase orders..."
        exportName="purchase-orders"
        emptyTitle="No purchase orders"
      />
    </div>
  );
}
