"use client";

import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Heart } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable } from "@/components/shared/data-table";
import { KpiCard } from "@/components/shared/kpi-card";
import { WISHLIST_ITEMS, type WishlistItem } from "../_lib/mock";
import { formatDate, formatINR, formatNumber } from "@/lib/format";

export default function CustomerWishlistPage() {
  const data = WISHLIST_ITEMS;

  const columns = useMemo<ColumnDef<WishlistItem, unknown>[]>(
    () => [
      { accessorKey: "customerName", header: "Customer" },
      { accessorKey: "productName", header: "Product" },
      { accessorKey: "price", header: "Price", cell: ({ row }) => formatINR(row.original.price) },
      { accessorKey: "addedAt", header: "Added On", cell: ({ row }) => formatDate(row.original.addedAt) },
    ],
    []
  );

  return (
    <div className="space-y-6">
      <PageHeader title="Customer Wishlist" description="Products saved to wishlists across all customers" />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <KpiCard label="Wishlist Items" value={formatNumber(data.length)} icon={Heart} tone="red" />
      </div>
      <DataTable
        columns={columns}
        data={data}
        searchKey="productName"
        searchPlaceholder="Search by product..."
        exportName="customer-wishlist"
        emptyTitle="No wishlist items"
      />
    </div>
  );
}
