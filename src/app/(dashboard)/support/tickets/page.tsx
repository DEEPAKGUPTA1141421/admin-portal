"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import { Ticket, Inbox, Loader2, AlertTriangle, CheckCircle2 } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { KpiCard } from "@/components/shared/kpi-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TICKETS_DATA } from "@/lib/mock/generate";
import type { SupportTicket } from "@/lib/types";
import { formatDate } from "@/lib/format";
import { toast } from "sonner";

export default function TicketsPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>(() => [...TICKETS_DATA]);

  const kpis = useMemo(() => {
    const open = tickets.filter((t) => t.status === "open").length;
    const inProgress = tickets.filter((t) => t.status === "in_progress").length;
    const escalated = tickets.filter((t) => t.status === "escalated").length;
    const resolved = tickets.filter((t) => t.status === "resolved" || t.status === "closed").length;
    return { total: tickets.length, open, inProgress, escalated, resolved };
  }, [tickets]);

  function bulkMarkResolved(selected: SupportTicket[]) {
    const ids = new Set(selected.map((t) => t.id));
    setTickets((prev) => prev.map((t) => (ids.has(t.id) ? { ...t, status: "resolved", updatedAt: new Date().toISOString() } : t)));
    toast.success(`${selected.length} ticket(s) marked resolved`);
  }

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
      { accessorKey: "subject", header: "Subject", cell: ({ row }) => <span className="max-w-[240px] truncate block">{row.original.subject}</span> },
      { accessorKey: "requesterName", header: "Requester" },
      {
        accessorKey: "requesterType",
        header: "Type",
        cell: ({ row }) => <Badge variant="outline" className="capitalize">{row.original.requesterType}</Badge>,
      },
      { accessorKey: "category", header: "Category" },
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
      <PageHeader title="Support Tickets" description="All customer and seller support tickets" />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
        <KpiCard label="Total Tickets" value={String(kpis.total)} icon={Ticket} />
        <KpiCard label="Open" value={String(kpis.open)} icon={Inbox} tone="blue" />
        <KpiCard label="In Progress" value={String(kpis.inProgress)} icon={Loader2} tone="orange" />
        <KpiCard label="Escalated" value={String(kpis.escalated)} icon={AlertTriangle} tone="red" />
        <KpiCard label="Resolved" value={String(kpis.resolved)} icon={CheckCircle2} tone="green" />
      </div>

      <DataTable
        columns={columns}
        data={tickets}
        searchKey="subject"
        searchPlaceholder="Search tickets by subject..."
        exportName="support-tickets"
        enableSelection
        bulkActions={(selected) => (
          <Button variant="outline" size="sm" onClick={() => bulkMarkResolved(selected)}>
            Mark Resolved ({selected.length})
          </Button>
        )}
        emptyTitle="No tickets found"
        emptyDescription="Try adjusting your search."
      />
    </div>
  );
}
