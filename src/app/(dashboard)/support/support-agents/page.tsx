"use client";

import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Users, UserPlus, Ticket, CheckCircle2 } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { KpiCard } from "@/components/shared/kpi-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface Agent {
  id: string;
  name: string;
  email: string;
  activeTickets: number;
  resolvedThisWeek: number;
  avgResponseTime: string;
  status: "online" | "away" | "offline";
}

const INITIAL_AGENTS: Agent[] = [
  { id: "AGT-1", name: "Ritu Sharma", email: "ritu.sharma@marketplace.example", activeTickets: 8, resolvedThisWeek: 34, avgResponseTime: "12 min", status: "online" },
  { id: "AGT-2", name: "Karan Mehta", email: "karan.mehta@marketplace.example", activeTickets: 5, resolvedThisWeek: 28, avgResponseTime: "9 min", status: "online" },
  { id: "AGT-3", name: "Sneha Iyer", email: "sneha.iyer@marketplace.example", activeTickets: 11, resolvedThisWeek: 41, avgResponseTime: "15 min", status: "away" },
  { id: "AGT-4", name: "Vikas Rao", email: "vikas.rao@marketplace.example", activeTickets: 3, resolvedThisWeek: 19, avgResponseTime: "18 min", status: "offline" },
  { id: "AGT-5", name: "Ayesha Khan", email: "ayesha.khan@marketplace.example", activeTickets: 7, resolvedThisWeek: 30, avgResponseTime: "11 min", status: "online" },
];

export default function SupportAgentsPage() {
  const [agents, setAgents] = useState<Agent[]>(INITIAL_AGENTS);
  const [addOpen, setAddOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Agent["status"]>("online");

  const kpis = useMemo(() => {
    const online = agents.filter((a) => a.status === "online").length;
    const totalActive = agents.reduce((s, a) => s + a.activeTickets, 0);
    const totalResolved = agents.reduce((s, a) => s + a.resolvedThisWeek, 0);
    return { total: agents.length, online, totalActive, totalResolved };
  }, [agents]);

  function addAgent() {
    if (!name.trim() || !email.trim()) return;
    setAgents((prev) => [
      ...prev,
      {
        id: `AGT-${prev.length + 1}-${Date.now()}`,
        name: name.trim(),
        email: email.trim(),
        activeTickets: 0,
        resolvedThisWeek: 0,
        avgResponseTime: "—",
        status,
      },
    ]);
    toast.success(`${name.trim()} added to the support roster`);
    setAddOpen(false);
    setName("");
    setEmail("");
    setStatus("online");
  }

  const columns = useMemo<ColumnDef<Agent, unknown>[]>(
    () => [
      { accessorKey: "name", header: "Name" },
      { accessorKey: "email", header: "Email" },
      { accessorKey: "activeTickets", header: "Active Tickets" },
      { accessorKey: "resolvedThisWeek", header: "Resolved This Week" },
      { accessorKey: "avgResponseTime", header: "Avg. Response Time" },
      { accessorKey: "status", header: "Status", cell: ({ row }) => <StatusBadge status={row.original.status} /> },
    ],
    []
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Support Agents"
        description="Manage the customer support agent roster"
        actions={
          <Button size="sm" onClick={() => setAddOpen(true)}>
            <UserPlus className="size-4" /> Add Agent
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <KpiCard label="Total Agents" value={String(kpis.total)} icon={Users} />
        <KpiCard label="Online Now" value={String(kpis.online)} icon={CheckCircle2} tone="green" />
        <KpiCard label="Active Tickets" value={String(kpis.totalActive)} icon={Ticket} tone="blue" />
        <KpiCard label="Resolved This Week" value={String(kpis.totalResolved)} icon={CheckCircle2} tone="green" />
      </div>

      <DataTable
        columns={columns}
        data={agents}
        searchKey="name"
        searchPlaceholder="Search agents..."
        exportName="support-agents"
        emptyTitle="No agents found"
        emptyDescription="Add a support agent to get started."
      />

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Agent</DialogTitle>
            <DialogDescription>Add a new agent to the support roster.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="agent-name">Name</Label>
              <Input id="agent-name" placeholder="e.g. Priya Nambiar" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="agent-email">Email</Label>
              <Input id="agent-email" type="email" placeholder="e.g. priya.nambiar@marketplace.example" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as Agent["status"])}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="online">Online</SelectItem>
                  <SelectItem value="away">Away</SelectItem>
                  <SelectItem value="offline">Offline</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={addAgent} disabled={!name.trim() || !email.trim()}>Add Agent</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
