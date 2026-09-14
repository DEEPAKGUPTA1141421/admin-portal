"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { type ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Plus, Star } from "lucide-react";
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
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PRODUCTS_DATA, CATEGORIES_DATA, BRANDS_DATA, SELLERS_DATA } from "@/lib/mock/generate";
import { fetchLiveProducts } from "@/lib/api/products";
import type { Product, ProductStatus } from "@/lib/types";
import { formatINR, formatNumber, formatDate } from "@/lib/format";
import { toast } from "sonner";

const STATUSES: ProductStatus[] = [
  "draft", "pending_approval", "approved", "rejected", "published", "unpublished", "out_of_stock", "archived",
];

function emptyForm() {
  return {
    name: "", sku: "", categoryId: CATEGORIES_DATA[0]?.id ?? "", brandId: BRANDS_DATA[0]?.id ?? "",
    sellerId: SELLERS_DATA[0]?.id ?? "", mrp: "", price: "", stock: "",
  };
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>(PRODUCTS_DATA);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchLiveProducts()
      .then((live) => {
        if (cancelled) return;
        if (live.length > 0) setProducts(live);
      })
      .catch(() => {
        if (cancelled) return;
        toast.info("Using demo data — backend unreachable");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState(emptyForm());
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [bulkPriceOpen, setBulkPriceOpen] = useState(false);
  const [bulkPricePct, setBulkPricePct] = useState("");
  const [pendingSelection, setPendingSelection] = useState<Product[]>([]);

  function updateStatus(id: string, status: ProductStatus) {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, status, updatedAt: new Date().toISOString() } : p)));
  }

  function archiveProduct(p: Product) {
    updateStatus(p.id, "archived");
    toast.success(`${p.name} archived`);
  }

  function duplicateProduct(p: Product) {
    const copy: Product = {
      ...p,
      id: `${p.id}-COPY-${Date.now().toString().slice(-4)}`,
      name: `${p.name} (Copy)`,
      sku: `${p.sku}-C`,
      status: "draft",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setProducts((prev) => [copy, ...prev]);
    toast.success(`Duplicated as "${copy.name}"`);
  }

  function deleteProduct() {
    if (!deleteTarget) return;
    setProducts((prev) => prev.filter((p) => p.id !== deleteTarget.id));
    toast.success(`${deleteTarget.name} deleted`);
    setDeleteTarget(null);
  }

  function addProduct() {
    if (!form.name || !form.sku) {
      toast.error("Name and SKU are required");
      return;
    }
    const cat = CATEGORIES_DATA.find((c) => c.id === form.categoryId)!;
    const brand = BRANDS_DATA.find((b) => b.id === form.brandId)!;
    const seller = SELLERS_DATA.find((s) => s.id === form.sellerId)!;
    const mrp = Number(form.mrp) || 999;
    const price = Number(form.price) || mrp;
    const newProduct: Product = {
      id: `PRD-NEW-${Date.now()}`,
      name: form.name,
      slug: form.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      sku: form.sku,
      categoryId: cat.id, categoryName: cat.name,
      brandId: brand.id, brandName: brand.name,
      sellerId: seller.id, sellerName: seller.storeName,
      image: `https://picsum.photos/seed/${form.sku}/400/400`,
      mrp, price, costPrice: Math.round(price * 0.75),
      discountPct: mrp > 0 ? Math.round((1 - price / mrp) * 100) : 0,
      stock: Number(form.stock) || 0,
      minStock: 5,
      status: "draft",
      rating: 0, reviewCount: 0, gstPct: 18, weightKg: 1,
      warehouseId: "WH-1",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setProducts((prev) => [newProduct, ...prev]);
    toast.success(`Product "${newProduct.name}" added as draft`);
    setAddOpen(false);
    setForm(emptyForm());
  }

  function applyBulkPrice() {
    const pct = Number(bulkPricePct);
    if (!pct) { toast.error("Enter a valid percentage"); return; }
    const ids = new Set(pendingSelection.map((p) => p.id));
    setProducts((prev) =>
      prev.map((p) =>
        ids.has(p.id)
          ? { ...p, price: Math.max(1, Math.round(p.price * (1 + pct / 100))), updatedAt: new Date().toISOString() }
          : p
      )
    );
    toast.success(`Updated price for ${ids.size} products by ${pct}%`);
    setBulkPriceOpen(false);
    setBulkPricePct("");
  }

  const columns: ColumnDef<Product, unknown>[] = [
    {
      accessorKey: "name",
      header: "Product",
      cell: ({ row }) => (
        <Link href={`/catalog/products/${row.original.id}`} className="flex items-center gap-2 hover:underline">
          <Image src={row.original.image} alt={row.original.name} width={36} height={36} className="rounded-md object-cover" unoptimized />
          <div className="max-w-[220px] truncate font-medium">{row.original.name}</div>
        </Link>
      ),
    },
    { accessorKey: "sku", header: "SKU" },
    { accessorKey: "categoryName", header: "Category" },
    { accessorKey: "brandName", header: "Brand" },
    { accessorKey: "sellerName", header: "Seller" },
    {
      accessorKey: "price",
      header: "Price",
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{formatINR(row.original.price)}</div>
          {row.original.discountPct > 0 && <div className="text-xs text-muted-foreground line-through">{formatINR(row.original.mrp)}</div>}
        </div>
      ),
    },
    {
      accessorKey: "stock",
      header: "Stock",
      cell: ({ row }) => (
        <span className={row.original.stock <= row.original.minStock ? "text-amber-600 font-medium" : ""}>
          {formatNumber(row.original.stock)}
        </span>
      ),
    },
    { accessorKey: "status", header: "Status", cell: ({ row }) => <StatusBadge status={row.original.status} /> },
    {
      accessorKey: "rating",
      header: "Rating",
      cell: ({ row }) => (
        <span className="flex items-center gap-1"><Star className="size-3.5 fill-amber-400 text-amber-400" />{row.original.rating.toFixed(1)}</span>
      ),
    },
    { accessorKey: "updatedAt", header: "Updated", cell: ({ row }) => formatDate(row.original.updatedAt) },
    {
      id: "actions",
      header: "",
      enableHiding: false,
      cell: ({ row }) => {
        const p = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-7"><MoreHorizontal className="size-4" /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild><Link href={`/catalog/products/${p.id}`}>View</Link></DropdownMenuItem>
              <DropdownMenuItem asChild><Link href={`/catalog/products/${p.id}`}>Edit</Link></DropdownMenuItem>
              <DropdownMenuItem onClick={() => duplicateProduct(p)}>Duplicate</DropdownMenuItem>
              {p.status === "pending_approval" && (
                <>
                  <DropdownMenuItem onClick={() => { updateStatus(p.id, "approved"); toast.success(`${p.name} approved`); }}>Approve</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { updateStatus(p.id, "rejected"); toast.error(`${p.name} rejected`); }}>Reject</DropdownMenuItem>
                </>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => archiveProduct(p)}>Archive</DropdownMenuItem>
              <DropdownMenuItem variant="destructive" onClick={() => setDeleteTarget(p)}>Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Products"
        description={loading ? "Loading live catalog..." : `${products.length} products across the catalog`}
        actions={
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus /> Add Product</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Product</DialogTitle>
                <DialogDescription>Creates a new draft product in the catalog.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-3">
                <div className="grid gap-1.5">
                  <Label>Name</Label>
                  <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-1.5">
                    <Label>SKU</Label>
                    <Input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} />
                  </div>
                  <div className="grid gap-1.5">
                    <Label>Stock</Label>
                    <Input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-1.5">
                    <Label>MRP</Label>
                    <Input type="number" value={form.mrp} onChange={(e) => setForm({ ...form, mrp: e.target.value })} />
                  </div>
                  <div className="grid gap-1.5">
                    <Label>Price</Label>
                    <Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-1.5">
                    <Label>Category</Label>
                    <Select value={form.categoryId} onValueChange={(v) => setForm({ ...form, categoryId: v })}>
                      <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {CATEGORIES_DATA.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-1.5">
                    <Label>Brand</Label>
                    <Select value={form.brandId} onValueChange={(v) => setForm({ ...form, brandId: v })}>
                      <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {BRANDS_DATA.map((b) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid gap-1.5">
                  <Label>Seller</Label>
                  <Select value={form.sellerId} onValueChange={(v) => setForm({ ...form, sellerId: v })}>
                    <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {SELLERS_DATA.map((s) => <SelectItem key={s.id} value={s.id}>{s.storeName}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
                <Button onClick={addProduct}>Create Product</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <DataTable
        columns={columns}
        data={products}
        searchKey="name"
        searchPlaceholder="Search products..."
        exportName="products"
        enableSelection
        bulkActions={(selected) => (
          <>
            <Button
              size="sm" variant="outline"
              onClick={() => {
                const ids = new Set(selected.map((p) => p.id));
                setProducts((prev) => prev.map((p) => (ids.has(p.id) ? { ...p, status: "approved" } : p)));
                toast.success(`${selected.length} products approved`);
              }}
            >
              Bulk Approve
            </Button>
            <Button
              size="sm" variant="outline"
              onClick={() => {
                const ids = new Set(selected.map((p) => p.id));
                setProducts((prev) => prev.map((p) => (ids.has(p.id) ? { ...p, status: "rejected" } : p)));
                toast.error(`${selected.length} products rejected`);
              }}
            >
              Bulk Reject
            </Button>
            <Button size="sm" variant="outline" onClick={() => { setPendingSelection(selected); setBulkPriceOpen(true); }}>
              Bulk Price Update
            </Button>
          </>
        )}
        emptyTitle="No products found"
        emptyDescription="Try adjusting filters or add a new product."
      />

      <AlertDialog open={!!deleteTarget} onOpenChange={(v) => !v && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete product?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove &quot;{deleteTarget?.name}&quot; from the catalog. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={deleteProduct}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={bulkPriceOpen} onOpenChange={setBulkPriceOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bulk Price Update</DialogTitle>
            <DialogDescription>
              Adjust price for {pendingSelection.length} selected product(s) by a percentage (financial change — please confirm the value).
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-1.5">
            <Label>Percentage change (e.g. -10 for 10% off, 5 for 5% up)</Label>
            <Input type="number" value={bulkPricePct} onChange={(e) => setBulkPricePct(e.target.value)} placeholder="-10" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkPriceOpen(false)}>Cancel</Button>
            <Button onClick={applyBulkPrice}>Apply</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
