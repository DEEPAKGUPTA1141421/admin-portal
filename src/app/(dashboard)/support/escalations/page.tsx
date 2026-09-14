"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import { AlertTriangle, UserCog, ArrowUpCircle } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { KpiCard } from "@/components/shared/kpi-card";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { TICKETS_DATA } from "@/lib/mock/generate";
import type { SupportTicket } from "@/lib/types";
import { formatDate } from "@/lib/format";
import { toast } from "sonner";

const SENIOR_AGENTS = ["Ritu Sharma", "Karan Mehta", "Sneha Iyer", "Vikas Rao", "Ayesha Khan"];
const PRIORITY_ORDER: SupportTicket["priority"][] = ["low", "medium", "high", "urgent"];

export default function EscalationsPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>(() => TICKETS_DATA.filter((t) => t.status === "escalated"));
  const [assignTarget, setAssignTarget] = useState<SupportTicket | null>(null);
  const [seniorAgent, setSeniorAgent] = useState<string>("");

  const kpis = useMemo(() => {
    const urgent = tickets.filter((t) => t.priority === "urgent").length;
    const unassigned = tickets.filter((t) => !t.assignedAgent).length;
    return { total: tickets.length, urgent, unassigned };
  }, [tickets]);

  function bumpPriority(ticket: SupportTicket) {
    const idx = PRIORITY_ORDER.indexOf(ticket.priority);
    if (idx === PRIORITY_ORDER.length - 1) {
      toast.info(`${ticket.ticketNumber} is already at the highest priority (urgent)`);
      return;
    }
    const next = PRIORITY_ORDER[idx + 1];
    setTickets((prev) => prev.map((t) => (t.id === ticket.id ? { ...t, priority: next, updatedAt: new Date().toISOString() } : t)));
    toast.success(`${ticket.ticketNumber} priority bumped to "${next}"`);
  }

  function confirmAssign() {
    if (!assignTarget || !seniorAgent) return;
    setTickets((prev) =>
      prev.map((t) => (t.id === assignTarget.id ? { ...t, assignedAgent: seniorAgent, updatedAt: new Date().toISOString() } : t))
    );
    toast.success(`${assignTarget.ticketNumber} assigned to ${seniorAgent}`);
    setAssignTarget(null);
    setSeniorAgent("");
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
      { accessorKey: "subject", header: "Subject", cell: ({ row }) => <span className="max-w-[220px] truncate block">{row.original.subject}</span> },
      { accessorKey: "requesterName", header: "Requester" },
      { accessorKey: "priority", header: "Priority", cell: ({ row }) => <StatusBadge status={row.original.priority} /> },
      { accessorKey: "status", header: "Status", cell: ({ row }) => <StatusBadge status={row.original.status} /> },
      {
        accessorKey: "assignedAgent",
        header: "Assigned Agent",
        cell: ({ row }) => row.original.assignedAgent ?? <span className="text-muted-foreground">Unassigned</span>,
      },
      { accessorKey: "createdAt", header: "Created", cell: ({ row }) => formatDate(row.original.createdAt) },
      {
        id: "actions",
        header: "",
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => {
          const t = row.original;
          return (
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => { setAssignTarget(t); setSeniorAgent(t.assignedAgent ?? ""); }}>
                <UserCog className="size-4" /> Assign Senior
              </Button>
              <Button variant="outline" size="sm" onClick={() => bumpPriority(t)}>
                <ArrowUpCircle className="size-4" /> Bump Priority
              </Button>
            </div>
          );
        },
      },
    ],
    []
  );

  return (
    <div className="space-y-6">
      <PageHeader title="Escalations" description="Tickets escalated for urgent attention" />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        <KpiCard label="Total Escalated" value={String(kpis.total)} icon={AlertTriangle} tone="red" />
        <KpiCard label="Urgent Priority" value={String(kpis.urgent)} icon={AlertTriangle} tone="orange" />
        <KpiCard label="Unassigned" value={String(kpis.unassigned)} icon={UserCog} tone="blue" />
      </div>

      <DataTable
        columns={columns}
        data={tickets}
        searchKey="subject"
        searchPlaceholder="Search escalations..."
        exportName="escalations"
        emptyTitle="No escalated tickets"
        emptyDescription="Nothing is currently escalated — great job!"
      />

      <Dialog open={!!assignTarget} onOpenChange={(o) => !o && setAssignTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Senior Agent</DialogTitle>
            <DialogDescription>
              {assignTarget && `Assign ${assignTarget.ticketNumber} to a senior support agent.`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label>Senior Agent</Label>
            <Select value={seniorAgent} onValueChange={setSeniorAgent}>
              <SelectTrigger className="w-full"><SelectValue placeholder="Select an agent" /></SelectTrigger>
              <SelectContent>
                {SENIOR_AGENTS.map((a) => (
                  <SelectItem key={a} value={a}>{a}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignTarget(null)}>Cancel</Button>
            <Button onClick={confirmAssign} disabled={!seniorAgent}>Assign</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
