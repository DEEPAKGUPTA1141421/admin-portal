"use client";

import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { LifeBuoy } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { KpiCard } from "@/components/shared/kpi-card";
import { CUSTOMER_TICKETS, type CustomerTicket } from "../_lib/mock";
import { formatDate, formatNumber } from "@/lib/format";

export default function CustomerSupportPage() {
  const data = CUSTOMER_TICKETS;
  const open = data.filter((t) => t.status === "open" || t.status === "in_progress").length;

  const columns = useMemo<ColumnDef<CustomerTicket, unknown>[]>(
    () => [
      { accessorKey: "ticketNumber", header: "Ticket #" },
      { accessorKey: "customerName", header: "Customer" },
      { accessorKey: "subject", header: "Subject" },
      { accessorKey: "category", header: "Category" },
      { accessorKey: "priority", header: "Priority", cell: ({ row }) => <StatusBadge status={row.original.priority} /> },
      { accessorKey: "status", header: "Status", cell: ({ row }) => <StatusBadge status={row.original.status} /> },
      { accessorKey: "createdAt", header: "Created", cell: ({ row }) => formatDate(row.original.createdAt) },
    ],
    []
  );

  return (
    <div className="space-y-6">
      <PageHeader title="Customer Support" description="Support tickets raised by customers" />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <KpiCard label="Total Tickets" value={formatNumber(data.length)} icon={LifeBuoy} />
        <KpiCard label="Open / In Progress" value={formatNumber(open)} icon={LifeBuoy} tone="orange" />
      </div>
      <DataTable
        columns={columns}
        data={data}
        searchKey="customerName"
        searchPlaceholder="Search by customer..."
        exportName="customer-support"
        emptyTitle="No support tickets"
      />
    </div>
  );
}
