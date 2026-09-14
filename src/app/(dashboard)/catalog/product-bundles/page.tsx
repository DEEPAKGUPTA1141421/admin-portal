"use client";

import { useState } from "react";
import Image from "next/image";
import { type ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Plus, X } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { DataTable } from "@/components/shared/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { formatINR } from "@/lib/format";
import { toast } from "sonner";

interface Bundle {
  id: string;
  name: string;
  productIds: string[];
  bundlePrice: number;
  status: "active" | "inactive";
}

function seedBundles(): Bundle[] {
  return [
    { id: "BND-1", name: "Starter Combo", productIds: [PRODUCTS_DATA[0].id, PRODUCTS_DATA[1].id], bundlePrice: Math.round((PRODUCTS_DATA[0].price + PRODUCTS_DATA[1].price) * 0.85), status: "active" },
    { id: "BND-2", name: "Home Essentials Pack", productIds: [PRODUCTS_DATA[2].id, PRODUCTS_DATA[3].id, PRODUCTS_DATA[4].id], bundlePrice: Math.round((PRODUCTS_DATA[2].price + PRODUCTS_DATA[3].price + PRODUCTS_DATA[4].price) * 0.8), status: "active" },
    { id: "BND-3", name: "Weekend Bundle", productIds: [PRODUCTS_DATA[5].id, PRODUCTS_DATA[6].id], bundlePrice: Math.round((PRODUCTS_DATA[5].price + PRODUCTS_DATA[6].price) * 0.9), status: "inactive" },
  ];
}

export default function ProductBundlesPage() {
  const [bundles, setBundles] = useState<Bundle[]>(seedBundles);
  const [addOpen, setAddOpen] = useState(false);
  const [name, setName] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [candidate, setCandidate] = useState(PRODUCTS_DATA[0]?.id ?? "");
  const [discountPct, setDiscountPct] = useState("15");
  const [deleteTarget, setDeleteTarget] = useState<Bundle | null>(null);

  function productOf(id: string) {
    return PRODUCTS_DATA.find((p) => p.id === id)!;
  }

  function addToSelection() {
    if (!selected.includes(candidate)) setSelected((prev) => [...prev, candidate]);
  }

  function createBundle() {
    if (!name || selected.length < 2) { toast.error("Name and at least 2 products are required"); return; }
    const total = selected.reduce((s, id) => s + productOf(id).price, 0);
    const bundlePrice = Math.round(total * (1 - Number(discountPct) / 100));
    const bundle: Bundle = { id: `BND-NEW-${Date.now()}`, name, productIds: selected, bundlePrice, status: "active" };
    setBundles((prev) => [bundle, ...prev]);
    toast.success(`Bundle "${name}" created`);
    setAddOpen(false);
    setName(""); setSelected([]);
  }

  function remove() {
    if (!deleteTarget) return;
    setBundles((prev) => prev.filter((b) => b.id !== deleteTarget.id));
    toast.success(`Bundle "${deleteTarget.name}" deleted`);
    setDeleteTarget(null);
  }

  const columns: ColumnDef<Bundle, unknown>[] = [
    { accessorKey: "name", header: "Bundle" },
    {
      id: "products",
      header: "Products",
      cell: ({ row }) => (
        <div className="flex -space-x-2">
          {row.original.productIds.map((id) => (
            <Image key={id} src={productOf(id).image} alt="" width={28} height={28} className="rounded-full border-2 border-background object-cover" unoptimized />
          ))}
        </div>
      ),
    },
    {
      id: "originalTotal",
      header: "Original Total",
      cell: ({ row }) => formatINR(row.original.productIds.reduce((s, id) => s + productOf(id).price, 0)),
    },
    { accessorKey: "bundlePrice", header: "Bundle Price", cell: ({ row }) => <span className="font-medium">{formatINR(row.original.bundlePrice)}</span> },
    { accessorKey: "status", header: "Status", cell: ({ row }) => <StatusBadge status={row.original.status} /> },
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
            <DropdownMenuItem onClick={() => toast.success(`Edit form opened for ${row.original.name}`)}>Edit</DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setBundles((prev) => prev.map((b) => (b.id === row.original.id ? { ...b, status: b.status === "active" ? "inactive" : "active" } : b)))}
            >
              {row.original.status === "active" ? "Deactivate" : "Activate"}
            </DropdownMenuItem>
            <DropdownMenuItem variant="destructive" onClick={() => setDeleteTarget(row.original)}>Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Product Bundles"
        description={`${bundles.length} bundles combining 2-3 products at a discounted price`}
        actions={
          <Dialog open={addOpen} onOpenChange={(v) => { setAddOpen(v); if (!v) setSelected([]); }}>
            <DialogTrigger asChild><Button size="sm"><Plus /> Add Bundle</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Bundle</DialogTitle>
                <DialogDescription>Group 2-3 products with a combined discounted price.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-3">
                <div className="grid gap-1.5">
                  <Label>Name</Label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="grid gap-1.5">
                  <Label>Add Products</Label>
                  <div className="flex gap-2">
                    <Select value={candidate} onValueChange={setCandidate}>
                      <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {PRODUCTS_DATA.slice(0, 40).map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <Button type="button" variant="outline" onClick={addToSelection}>Add</Button>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {selected.map((id) => (
                      <span key={id} className="flex items-center gap-1 rounded-full border px-2 py-1 text-xs">
                        {productOf(id).name}
                        <button onClick={() => setSelected((prev) => prev.filter((x) => x !== id))}><X className="size-3" /></button>
                      </span>
                    ))}
                  </div>
                </div>
                <div className="grid gap-1.5">
                  <Label>Discount % off combined price</Label>
                  <Input type="number" value={discountPct} onChange={(e) => setDiscountPct(e.target.value)} />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
                <Button onClick={createBundle}>Create Bundle</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />
      <DataTable columns={columns} data={bundles} searchKey="name" searchPlaceholder="Search bundles..." exportName="product-bundles" />

      <AlertDialog open={!!deleteTarget} onOpenChange={(v) => !v && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete bundle?</AlertDialogTitle>
            <AlertDialogDescription>&quot;{deleteTarget?.name}&quot; will be removed and no longer offered.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={remove}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
