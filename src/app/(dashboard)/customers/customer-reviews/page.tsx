"use client";

import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Star } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { CUSTOMER_REVIEWS, type CustomerReview } from "../_lib/mock";
import { formatDate } from "@/lib/format";

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star key={i} className={`size-3.5 ${i < rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground"}`} />
      ))}
    </div>
  );
}

export default function CustomerReviewsPage() {
  const data = CUSTOMER_REVIEWS;

  const columns = useMemo<ColumnDef<CustomerReview, unknown>[]>(
    () => [
      { accessorKey: "customerName", header: "Customer" },
      { accessorKey: "productName", header: "Product" },
      { accessorKey: "rating", header: "Rating", cell: ({ row }) => <Stars rating={row.original.rating} /> },
      {
        accessorKey: "text",
        header: "Review",
        cell: ({ row }) => <span className="line-clamp-1 max-w-xs text-muted-foreground">{row.original.text}</span>,
      },
      { accessorKey: "status", header: "Status", cell: ({ row }) => <StatusBadge status={row.original.status} /> },
      { accessorKey: "createdAt", header: "Date", cell: ({ row }) => formatDate(row.original.createdAt) },
    ],
    []
  );

  return (
    <div className="space-y-6">
      <PageHeader title="Customer Reviews" description="Reviews written by customers across the marketplace" />
      <DataTable
        columns={columns}
        data={data}
        searchKey="customerName"
        searchPlaceholder="Search by customer..."
        exportName="customer-reviews"
        emptyTitle="No reviews found"
      />
    </div>
  );
}
