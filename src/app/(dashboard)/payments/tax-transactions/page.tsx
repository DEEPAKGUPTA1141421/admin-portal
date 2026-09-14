"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable } from "@/components/shared/data-table";
import { TAX_TRANSACTIONS, type TaxTransaction } from "@/lib/mock/payments-local";
import { formatDateTime, formatINR, formatPct } from "@/lib/format";

const columns: ColumnDef<TaxTransaction, unknown>[] = [
  { accessorKey: "orderNumber", header: "Order #" },
  { accessorKey: "customerName", header: "Customer" },
  { accessorKey: "taxableAmount", header: "Taxable Amount", cell: ({ row }) => formatINR(row.original.taxableAmount) },
  { accessorKey: "gstPct", header: "GST %", cell: ({ row }) => formatPct(row.original.gstPct) },
  { accessorKey: "gstAmount", header: "GST Amount", cell: ({ row }) => formatINR(row.original.gstAmount) },
  { accessorKey: "hsn", header: "HSN Code" },
  { accessorKey: "createdAt", header: "Date", cell: ({ row }) => formatDateTime(row.original.createdAt) },
];

export default function TaxTransactionsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Tax Transactions" description="GST breakdown for marketplace order transactions" />
      <DataTable
        columns={columns}
        data={TAX_TRANSACTIONS}
        searchKey="orderNumber"
        searchPlaceholder="Search by order number..."
        exportName="tax-transactions"
        emptyTitle="No tax transactions"
      />
    </div>
  );
}
