"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { type ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Plus } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
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

interface VariantRow {
  id: string;
  productId: string;
  productName: string;
  image: string;
  sku: string;
  color: string;
  size: string;
  price: number;
  stock: number;
}

const COLORS = ["Red", "Blue", "Black", "White", "Green"];
const SIZES = ["S", "M", "L", "XL"];

function buildSeed(): VariantRow[] {
  const rows: VariantRow[] = [];
  PRODUCTS_DATA.slice(0, 18).forEach((p, i) => {
    const color = COLORS[i % COLORS.length];
    const size = SIZES[i % SIZES.length];
    rows.push({
      id: `VAR-${i + 1}`,
      productId: p.id,
      productName: p.name,
      image: p.image,
      sku: `${p.sku}-${color.slice(0, 2).toUpperCase()}-${size}`,
      color, size,
      price: p.price,
      stock: Math.max(0, Math.round(p.stock / 3)),
    });
  });
  return rows;
}

export default function ProductVariantsPage() {
  const [variants, setVariants] = useState<VariantRow[]>(buildSeed);
  const [addOpen, setAddOpen] = useState(false);
  const [productId, setProductId] = useState(PRODUCTS_DATA[0]?.id ?? "");
  const [color, setColor] = useState(COLORS[0]);
  const [size, setSize] = useState(SIZES[0]);
  const [stock, setStock] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<VariantRow | null>(null);

  const productMap = useMemo(() => new Map(PRODUCTS_DATA.map((p) => [p.id, p])), []);

  function addVariant() {
    const product = productMap.get(productId);
    if (!product) return;
    const row: VariantRow = {
      id: `VAR-NEW-${Date.now()}`,
      productId, productName: product.name, image: product.image,
      sku: `${product.sku}-${color.slice(0, 2).toUpperCase()}-${size}`,
      color, size, price: product.price, stock: Number(stock) || 0,
    };
    setVariants((prev) => [row, ...prev]);
    toast.success(`Variant "${row.sku}" added`);
    setAddOpen(false);
    setStock("");
  }

  function remove() {
    if (!deleteTarget) return;
    setVariants((prev) => prev.filter((v) => v.id !== deleteTarget.id));
    toast.success(`Variant "${deleteTarget.sku}" removed`);
    setDeleteTarget(null);
  }

  const columns: ColumnDef<VariantRow, unknown>[] = [
    {
      accessorKey: "productName",
      header: "Product",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Image src={row.original.image} alt="" width={32} height={32} className="rounded-md object-cover" unoptimized />
          <span className="max-w-[180px] truncate">{row.original.productName}</span>
        </div>
      ),
    },
    { accessorKey: "sku", header: "Variant SKU" },
    { accessorKey: "color", header: "Color", cell: ({ row }) => <Badge variant="outline">{row.original.color}</Badge> },
    { accessorKey: "size", header: "Size", cell: ({ row }) => <Badge variant="outline">{row.original.size}</Badge> },
    { accessorKey: "price", header: "Price", cell: ({ row }) => formatINR(row.original.price) },
    { accessorKey: "stock", header: "Stock" },
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
            <DropdownMenuItem onClick={() => toast.success(`Edit form opened for ${row.original.sku}`)}>Edit</DropdownMenuItem>
            <DropdownMenuItem variant="destructive" onClick={() => setDeleteTarget(row.original)}>Remove</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Product Variants"
        description={`${variants.length} SKU-level variants across attribute combinations`}
        actions={
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild><Button size="sm"><Plus /> Add Variant</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Variant</DialogTitle>
                <DialogDescription>Create a new SKU-level variant for a product.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-3">
                <div className="grid gap-1.5">
                  <Label>Product</Label>
                  <Select value={productId} onValueChange={setProductId}>
                    <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {PRODUCTS_DATA.slice(0, 40).map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="grid gap-1.5">
                    <Label>Color</Label>
                    <Select value={color} onValueChange={setColor}>
                      <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                      <SelectContent>{COLORS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-1.5">
                    <Label>Size</Label>
                    <Select value={size} onValueChange={setSize}>
                      <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                      <SelectContent>{SIZES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-1.5">
                    <Label>Stock</Label>
                    <Input type="number" value={stock} onChange={(e) => setStock(e.target.value)} />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
                <Button onClick={addVariant}>Create</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />
      <DataTable columns={columns} data={variants} searchKey="sku" searchPlaceholder="Search variant SKUs..." exportName="product-variants" />

      <AlertDialog open={!!deleteTarget} onOpenChange={(v) => !v && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove variant?</AlertDialogTitle>
            <AlertDialogDescription>&quot;{deleteTarget?.sku}&quot; will be removed from the product.</AlertDialogDescription>
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
