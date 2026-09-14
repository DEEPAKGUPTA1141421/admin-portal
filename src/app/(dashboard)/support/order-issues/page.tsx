"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import { PackageX, Inbox, AlertTriangle, CheckCircle2 } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { KpiCard } from "@/components/shared/kpi-card";
import { TICKETS_DATA } from "@/lib/mock/generate";
import type { SupportTicket } from "@/lib/types";
import { formatDate } from "@/lib/format";

export default function OrderIssuesPage() {
  const [tickets] = useState<SupportTicket[]>(() => {
    const byCategory = TICKETS_DATA.filter((t) => t.category === "Order Issue");
    const withOrder = TICKETS_DATA.filter((t) => t.orderId);
    const merged = new Map<string, SupportTicket>();
    [...byCategory, ...withOrder].forEach((t) => merged.set(t.id, t));
    return Array.from(merged.values());
  });

  const kpis = useMemo(() => {
    const open = tickets.filter((t) => t.status === "open").length;
    const escalated = tickets.filter((t) => t.status === "escalated").length;
    const resolved = tickets.filter((t) => t.status === "resolved" || t.status === "closed").length;
    return { total: tickets.length, open, escalated, resolved };
  }, [tickets]);

  const columns = useMemo<ColumnDef<SupportTicket, unknown>[]>(
    () => [
      {
        accessorKey: "ticketNumber",
        header: "Ticket",
        cell: ({ row }) => (
          <Link href={`/support/tickets/${row.original.id}`} className="font-medium hover:underline">
            {row.original.ticketNumber}
          </Link>
        ),
      },
      { accessorKey: "subject", header: "Subject", cell: ({ row }) => <span className="max-w-[220px] truncate block">{row.original.subject}</span> },
      {
        accessorKey: "orderId",
        header: "Order ID",
        cell: ({ row }) => row.original.orderId ?? <span className="text-muted-foreground">—</span>,
      },
      { accessorKey: "requesterName", header: "Requester" },
      { accessorKey: "priority", header: "Priority", cell: ({ row }) => <StatusBadge status={row.original.priority} /> },
      { accessorKey: "status", header: "Status", cell: ({ row }) => <StatusBadge status={row.original.status} /> },
      {
        accessorKey: "assignedAgent",
        header: "Assigned Agent",
        cell: ({ row }) => row.original.assignedAgent ?? <span className="text-muted-foreground">Unassigned</span>,
      },
      { accessorKey: "createdAt", header: "Created", cell: ({ row }) => formatDate(row.original.createdAt) },
    ],
    []
  );

  return (
    <div className="space-y-6">
      <PageHeader title="Order Issues" description="Tickets related to order problems and order-linked complaints" />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <KpiCard label="Total" value={String(kpis.total)} icon={PackageX} />
        <KpiCard label="Open" value={String(kpis.open)} icon={Inbox} tone="blue" />
        <KpiCard label="Escalated" value={String(kpis.escalated)} icon={AlertTriangle} tone="red" />
        <KpiCard label="Resolved" value={String(kpis.resolved)} icon={CheckCircle2} tone="green" />
      </div>

      <DataTable
        columns={columns}
        data={tickets}
        searchKey="subject"
        searchPlaceholder="Search order issues..."
        exportName="order-issues"
        emptyTitle="No order issues found"
        emptyDescription="Try adjusting your search."
      />
    </div>
  );
}
