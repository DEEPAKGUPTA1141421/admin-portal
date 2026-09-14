"use client";

import { useState } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { Truck } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { DataTable } from "@/components/shared/data-table";
import { Button } from "@/components/ui/button";
import { REPLACEMENT_ORDERS, type ReplacementOrder } from "../_lib/mock";
import { formatDate } from "@/lib/format";
import { toast } from "sonner";

export default function ReplacementOrdersPage() {
  const [replacements, setReplacements] = useState<ReplacementOrder[]>(REPLACEMENT_ORDERS);

  function shipReplacement(r: ReplacementOrder) {
    setReplacements((prev) => prev.map((x) => (x.id === r.id ? { ...x, replacementStatus: "shipped" } : x)));
    toast.success(`Replacement ${r.id} shipped`);
  }

  const columns: ColumnDef<ReplacementOrder, unknown>[] = [
    { accessorKey: "id", header: "Replacement ID" },
    { accessorKey: "originalOrderNumber", header: "Original Order" },
    { accessorKey: "product", header: "Product" },
    { accessorKey: "customerName", header: "Customer" },
    { accessorKey: "reason", header: "Reason" },
    { accessorKey: "replacementStatus", header: "Status", cell: ({ row }) => <StatusBadge status={row.original.replacementStatus} /> },
    { accessorKey: "requestedAt", header: "Requested", cell: ({ row }) => formatDate(row.original.requestedAt) },
    {
      id: "actions",
      header: "",
      enableHiding: false,
      cell: ({ row }) =>
        row.original.replacementStatus === "pending" ? (
          <Button size="sm" variant="outline" onClick={() => shipReplacement(row.original)}>
            <Truck className="size-3.5" /> Ship Replacement
          </Button>
        ) : null,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Replacement Orders" description={`${replacements.length} replacement orders in progress`} />

      <DataTable
        columns={columns}
        data={replacements}
        searchKey="originalOrderNumber"
        searchPlaceholder="Search by original order number..."
        exportName="replacement-orders"
        emptyTitle="No replacement orders"
        emptyDescription="Replacement orders raised in place of a refund will appear here."
      />
    </div>
  );
}
