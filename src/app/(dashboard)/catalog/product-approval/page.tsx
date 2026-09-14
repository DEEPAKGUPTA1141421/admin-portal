"use client";

import { useState } from "react";
import Image from "next/image";
import { type ColumnDef } from "@tanstack/react-table";
import { CheckCircle2, XCircle } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { DataTable } from "@/components/shared/data-table";
import { Button } from "@/components/ui/button";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { PRODUCTS_DATA } from "@/lib/mock/generate";
import type { Product } from "@/lib/types";
import { formatINR, formatDate } from "@/lib/format";
import { toast } from "sonner";

export default function ProductApprovalPage() {
  const [products, setProducts] = useState<Product[]>(
    PRODUCTS_DATA.filter((p) => p.status === "pending_approval" || p.status === "draft")
  );
  const [rejectTarget, setRejectTarget] = useState<Product | null>(null);

  function approve(p: Product) {
    setProducts((prev) => prev.filter((x) => x.id !== p.id));
    toast.success(`${p.name} approved and published`);
  }

  function reject() {
    if (!rejectTarget) return;
    setProducts((prev) => prev.filter((x) => x.id !== rejectTarget.id));
    toast.error(`${rejectTarget.name} rejected`);
    setRejectTarget(null);
  }

  const columns: ColumnDef<Product, unknown>[] = [
    {
      accessorKey: "name",
      header: "Product",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Image src={row.original.image} alt="" width={36} height={36} className="rounded-md object-cover" unoptimized />
          <div className="max-w-[220px] truncate font-medium">{row.original.name}</div>
        </div>
      ),
    },
    { accessorKey: "sku", header: "SKU" },
    { accessorKey: "sellerName", header: "Seller" },
    { accessorKey: "categoryName", header: "Category" },
    { accessorKey: "price", header: "Price", cell: ({ row }) => formatINR(row.original.price) },
    { accessorKey: "status", header: "Status", cell: ({ row }) => <StatusBadge status={row.original.status} /> },
    { accessorKey: "createdAt", header: "Submitted", cell: ({ row }) => formatDate(row.original.createdAt) },
    {
      id: "actions",
      header: "",
      enableHiding: false,
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Button size="sm" variant="outline" onClick={() => approve(row.original)}>
            <CheckCircle2 className="size-4 text-emerald-600" /> Approve
          </Button>
          <Button size="sm" variant="outline" onClick={() => setRejectTarget(row.original)}>
            <XCircle className="size-4 text-red-600" /> Reject
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Product Approval" description={`${products.length} products awaiting review`} />

      <DataTable
        columns={columns}
        data={products}
        searchKey="name"
        searchPlaceholder="Search pending products..."
        exportName="product-approvals"
        enableSelection
        bulkActions={(selected) => (
          <>
            <Button
              size="sm"
              onClick={() => {
                const ids = new Set(selected.map((p) => p.id));
                setProducts((prev) => prev.filter((p) => !ids.has(p.id)));
                toast.success(`${selected.length} products approved`);
              }}
            >
              Bulk Approve
            </Button>
            <Button
              size="sm" variant="outline"
              onClick={() => {
                const ids = new Set(selected.map((p) => p.id));
                setProducts((prev) => prev.filter((p) => !ids.has(p.id)));
                toast.error(`${selected.length} products rejected`);
              }}
            >
              Bulk Reject
            </Button>
          </>
        )}
        emptyTitle="Queue is clear"
        emptyDescription="No products currently pending approval."
      />

      <AlertDialog open={!!rejectTarget} onOpenChange={(v) => !v && setRejectTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject product?</AlertDialogTitle>
            <AlertDialogDescription>
              &quot;{rejectTarget?.name}&quot; will be marked rejected and the seller notified.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={reject}>Reject</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
