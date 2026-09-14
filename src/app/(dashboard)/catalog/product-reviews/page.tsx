"use client";

import { useState } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Star } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { DataTable } from "@/components/shared/data-table";
import { Button } from "@/components/ui/button";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { REVIEWS_DATA } from "@/lib/mock/generate";
import type { Review } from "@/lib/types";
import { formatDate } from "@/lib/format";
import { toast } from "sonner";

export default function ProductReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>(REVIEWS_DATA);
  const [rejectTarget, setRejectTarget] = useState<Review | null>(null);

  function setStatus(r: Review, status: Review["status"]) {
    setReviews((prev) => prev.map((x) => (x.id === r.id ? { ...x, status } : x)));
    toast.success(`Review ${status}`);
  }

  const columns: ColumnDef<Review, unknown>[] = [
    { accessorKey: "productName", header: "Product", cell: ({ row }) => <span className="max-w-[180px] truncate block">{row.original.productName}</span> },
    { accessorKey: "customerName", header: "Customer" },
    {
      accessorKey: "rating",
      header: "Rating",
      cell: ({ row }) => (
        <span className="flex items-center gap-1">
          <Star className="size-3.5 fill-amber-400 text-amber-400" />{row.original.rating}
        </span>
      ),
    },
    { accessorKey: "title", header: "Title" },
    { accessorKey: "status", header: "Status", cell: ({ row }) => <StatusBadge status={row.original.status} /> },
    { accessorKey: "createdAt", header: "Date", cell: ({ row }) => formatDate(row.original.createdAt) },
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
            {row.original.status !== "approved" && <DropdownMenuItem onClick={() => setStatus(row.original, "approved")}>Approve</DropdownMenuItem>}
            {row.original.status !== "rejected" && <DropdownMenuItem onClick={() => setRejectTarget(row.original)}>Reject</DropdownMenuItem>}
            {row.original.status !== "flagged" && <DropdownMenuItem onClick={() => setStatus(row.original, "flagged")}>Flag</DropdownMenuItem>}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Product Reviews" description={`${reviews.length} reviews across all products`} />

      <DataTable
        columns={columns}
        data={reviews}
        searchKey="productName"
        searchPlaceholder="Search reviews..."
        exportName="product-reviews"
        enableSelection
        bulkActions={(selected) => (
          <Button
            size="sm"
            onClick={() => {
              const ids = new Set(selected.map((r) => r.id));
              setReviews((prev) => prev.map((r) => (ids.has(r.id) ? { ...r, status: "approved" } : r)));
              toast.success(`${selected.length} reviews approved`);
            }}
          >
            Bulk Approve
          </Button>
        )}
      />

      <AlertDialog open={!!rejectTarget} onOpenChange={(v) => !v && setRejectTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject review?</AlertDialogTitle>
            <AlertDialogDescription>This review from &quot;{rejectTarget?.customerName}&quot; will be hidden from the storefront.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => { if (rejectTarget) setStatus(rejectTarget, "rejected"); setRejectTarget(null); }}>Reject</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
