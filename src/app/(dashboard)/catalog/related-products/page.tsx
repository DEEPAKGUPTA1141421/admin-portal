"use client";

import { useState } from "react";
import Image from "next/image";
import { type ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Plus } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable } from "@/components/shared/data-table";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PRODUCTS_DATA } from "@/lib/mock/generate";
import { toast } from "sonner";

interface Mapping {
  id: string;
  productId: string;
  relatedId: string;
  type: "cross-sell" | "upsell" | "similar";
}

function seed(): Mapping[] {
  return PRODUCTS_DATA.slice(0, 15).map((p, i) => ({
    id: `RP-${i + 1}`,
    productId: p.id,
    relatedId: PRODUCTS_DATA[(i + 5) % PRODUCTS_DATA.length].id,
    type: (["cross-sell", "upsell", "similar"] as const)[i % 3],
  }));
}

export default function RelatedProductsPage() {
  const [mappings, setMappings] = useState<Mapping[]>(seed);
  const [addOpen, setAddOpen] = useState(false);
  const [productId, setProductId] = useState(PRODUCTS_DATA[0]?.id ?? "");
  const [relatedId, setRelatedId] = useState(PRODUCTS_DATA[1]?.id ?? "");
  const [type, setType] = useState<Mapping["type"]>("cross-sell");
  const [deleteTarget, setDeleteTarget] = useState<Mapping | null>(null);

  function productOf(id: string) {
    return PRODUCTS_DATA.find((p) => p.id === id)!;
  }

  function add() {
    if (productId === relatedId) { toast.error("Product and related product must differ"); return; }
    const m: Mapping = { id: `RP-NEW-${Date.now()}`, productId, relatedId, type };
    setMappings((prev) => [m, ...prev]);
    toast.success("Related product mapping added");
    setAddOpen(false);
  }

  function remove() {
    if (!deleteTarget) return;
    setMappings((prev) => prev.filter((m) => m.id !== deleteTarget.id));
    toast.success("Mapping removed");
    setDeleteTarget(null);
  }

  const columns: ColumnDef<Mapping, unknown>[] = [
    {
      id: "product",
      header: "Product",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Image src={productOf(row.original.productId).image} alt="" width={32} height={32} className="rounded-md object-cover" unoptimized />
          <span className="max-w-[180px] truncate">{productOf(row.original.productId).name}</span>
        </div>
      ),
    },
    {
      id: "related",
      header: "Related Product",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Image src={productOf(row.original.relatedId).image} alt="" width={32} height={32} className="rounded-md object-cover" unoptimized />
          <span className="max-w-[180px] truncate">{productOf(row.original.relatedId).name}</span>
        </div>
      ),
    },
    { accessorKey: "type", header: "Relation Type", cell: ({ row }) => <span className="capitalize">{row.original.type}</span> },
    {
      id: "actions",
      header: "",
      enableHiding: false,
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="size-7"><MoreHorizontal className="size-4" /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem variant="destructive" onClick={() => setDeleteTarget(row.original)}>Remove</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Related Products"
        description={`${mappings.length} cross-sell / upsell / similar product mappings`}
        actions={
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild><Button size="sm"><Plus /> Add Mapping</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Related Product</DialogTitle>
                <DialogDescription>Map a product to a related product for cross-sell/upsell recommendations.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-3">
                <div className="grid gap-1.5">
                  <Label>Product</Label>
                  <Select value={productId} onValueChange={setProductId}>
                    <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                    <SelectContent>{PRODUCTS_DATA.slice(0, 40).map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="grid gap-1.5">
                  <Label>Related Product</Label>
                  <Select value={relatedId} onValueChange={setRelatedId}>
                    <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                    <SelectContent>{PRODUCTS_DATA.slice(0, 40).map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="grid gap-1.5">
                  <Label>Relation Type</Label>
                  <Select value={type} onValueChange={(v) => setType(v as Mapping["type"])}>
                    <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cross-sell">Cross-sell</SelectItem>
                      <SelectItem value="upsell">Upsell</SelectItem>
                      <SelectItem value="similar">Similar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
                <Button onClick={add}>Add</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />
      <DataTable columns={columns} data={mappings} exportName="related-products" />

      <AlertDialog open={!!deleteTarget} onOpenChange={(v) => !v && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove mapping?</AlertDialogTitle>
            <AlertDialogDescription>This related product mapping will be removed.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={remove}>Remove</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
