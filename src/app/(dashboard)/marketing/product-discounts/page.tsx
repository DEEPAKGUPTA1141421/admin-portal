"use client";

import { useState } from "react";
import Image from "next/image";
import { type ColumnDef } from "@tanstack/react-table";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable } from "@/components/shared/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { PRODUCTS_DATA } from "@/lib/mock/generate";
import type { Product } from "@/lib/types";
import { formatINR } from "@/lib/format";
import { toast } from "sonner";

export default function ProductDiscountsPage() {
  const [products, setProducts] = useState<Product[]>(() => PRODUCTS_DATA.slice(0, 80));
  const [bulkOpen, setBulkOpen] = useState(false);
  const [pct, setPct] = useState("");
  const [selection, setSelection] = useState<Product[]>([]);

  function applyDiscount() {
    const value = Number(pct);
    if (!value || value <= 0 || value >= 100) {
      toast.error("Enter a valid discount percentage");
      return;
    }
    const ids = new Set(selection.map((p) => p.id));
    setProducts((prev) =>
      prev.map((p) =>
        ids.has(p.id)
          ? { ...p, discountPct: value, price: Math.round(p.mrp * (1 - value / 100)) }
          : p
      )
    );
    toast.success(`Applied ${value}% discount to ${ids.size} product(s)`);
    setBulkOpen(false);
    setPct("");
  }

  const columns: ColumnDef<Product, unknown>[] = [
    {
      accessorKey: "name",
      header: "Product",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Image src={row.original.image} alt={row.original.name} width={36} height={36} className="rounded-md object-cover" unoptimized />
          <div className="max-w-[220px] truncate font-medium">{row.original.name}</div>
        </div>
      ),
    },
    { accessorKey: "sellerName", header: "Seller" },
    { accessorKey: "mrp", header: "MRP", cell: ({ row }) => formatINR(row.original.mrp) },
    { accessorKey: "price", header: "Price", cell: ({ row }) => formatINR(row.original.price) },
    {
      accessorKey: "discountPct",
      header: "Discount",
      cell: ({ row }) => <span className="font-medium text-emerald-600 dark:text-emerald-400">{row.original.discountPct}%</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Product Discounts" description={`${products.length} products — select rows to apply a bulk discount`} />

      <DataTable
        columns={columns}
        data={products}
        searchKey="name"
        searchPlaceholder="Search products..."
        exportName="product-discounts"
        enableSelection
        bulkActions={(selected) => (
          <Button size="sm" variant="outline" onClick={() => { setSelection(selected); setBulkOpen(true); }}>
            Apply Discount
          </Button>
        )}
        emptyTitle="No products"
        emptyDescription="Products will appear here to manage discounts."
      />

      <Dialog open={bulkOpen} onOpenChange={setBulkOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Apply Bulk Discount</DialogTitle>
            <DialogDescription>Apply a flat discount percentage to {selection.length} selected product(s), computed off MRP.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-1.5">
            <Label>Discount Percentage</Label>
            <Input type="number" value={pct} onChange={(e) => setPct(e.target.value)} placeholder="15" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkOpen(false)}>Cancel</Button>
            <Button onClick={applyDiscount}>Apply</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
