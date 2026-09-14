"use client";

import { useMemo } from "react";
import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import { UserPlus } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { KpiCard } from "@/components/shared/kpi-card";
import { CUSTOMERS_DATA } from "@/lib/mock/generate";
import type { Customer } from "@/lib/types";
import { formatDate, formatINR, formatNumber } from "@/lib/format";

export default function NewCustomersPage() {
  const data = useMemo(
    () =>
      CUSTOMERS_DATA.filter((c) => c.segment === "new").sort(
        (a, b) => new Date(b.registeredAt).getTime() - new Date(a.registeredAt).getTime()
      ),
    []
  );

  const columns = useMemo<ColumnDef<Customer, unknown>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => (
          <Link href={`/customers/all-customers/${row.original.id}`} className="font-medium hover:underline">
            {row.original.name}
          </Link>
        ),
      },
      { accessorKey: "email", header: "Email" },
      { accessorKey: "phone", header: "Phone" },
      { accessorKey: "city", header: "City" },
      { accessorKey: "totalOrders", header: "Orders", cell: ({ row }) => formatNumber(row.original.totalOrders) },
      { accessorKey: "totalSpend", header: "Total Spend", cell: ({ row }) => formatINR(row.original.totalSpend) },
      { accessorKey: "status", header: "Status", cell: ({ row }) => <StatusBadge status={row.original.status} /> },
      { accessorKey: "registeredAt", header: "Registered", cell: ({ row }) => formatDate(row.original.registeredAt) },
    ],
    []
  );

  return (
    <div className="space-y-6">
      <PageHeader title="New Customers" description="Customers in the new segment, sorted by most recent registration" />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <KpiCard label="New Customers" value={formatNumber(data.length)} icon={UserPlus} tone="blue" />
      </div>
      <DataTable
        columns={columns}
        data={data}
        searchKey="name"
        searchPlaceholder="Search new customers..."
        exportName="new-customers"
        emptyTitle="No new customers"
      />
    </div>
  );
}
