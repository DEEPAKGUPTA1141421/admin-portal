"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Cell, Pie, PieChart } from "recharts";
import { Inbox, Loader2, CheckCircle2, AlertTriangle, Timer } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { KpiCard } from "@/components/shared/kpi-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { TICKETS_DATA } from "@/lib/mock/generate";
import { formatDate } from "@/lib/format";
import type { TicketStatus } from "@/lib/types";

const PIE_COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)", "#94a3b8", "#f472b6"];

const STATUS_LABELS: Record<TicketStatus, string> = {
  open: "Open",
  in_progress: "In Progress",
  waiting_customer: "Waiting Customer",
  waiting_seller: "Waiting Seller",
  escalated: "Escalated",
  resolved: "Resolved",
  closed: "Closed",
};

export default function SupportDashboardPage() {
  const kpis = useMemo(() => {
    const open = TICKETS_DATA.filter((t) => t.status === "open").length;
    const inProgress = TICKETS_DATA.filter((t) => t.status === "in_progress").length;
    const escalated = TICKETS_DATA.filter((t) => t.status === "escalated").length;
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    const resolvedToday = TICKETS_DATA.filter(
      (t) => (t.status === "resolved" || t.status === "closed") && new Date(t.updatedAt).getTime() >= oneDayAgo
    ).length;
    return { open, inProgress, escalated, resolvedToday };
  }, []);

  const distribution = useMemo(() => {
    const counts = new Map<TicketStatus, number>();
    for (const t of TICKETS_DATA) counts.set(t.status, (counts.get(t.status) ?? 0) + 1);
    return Array.from(counts.entries()).map(([status, value]) => ({ name: STATUS_LABELS[status], value }));
  }, []);

  const recentTickets = useMemo(
    () => [...TICKETS_DATA].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 10),
    []
  );

  return (
    <div className="space-y-6">
      <PageHeader title="Support Dashboard" description="Live overview of the customer & seller support queue" />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
        <KpiCard label="Open Tickets" value={String(kpis.open)} icon={Inbox} tone="blue" />
        <KpiCard label="In Progress" value={String(kpis.inProgress)} icon={Loader2} tone="orange" />
        <KpiCard label="Resolved Today" value={String(kpis.resolvedToday)} icon={CheckCircle2} tone="green" />
        <KpiCard label="Avg. Resolution Time" value="4.2 hrs" icon={Timer} />
        <KpiCard label="Escalated" value={String(kpis.escalated)} icon={AlertTriangle} tone="red" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ticket</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Requester</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentTickets.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell className="whitespace-nowrap">
                        <Link href={`/support/tickets/${t.id}`} className="font-medium hover:underline">
                          {t.ticketNumber}
                        </Link>
                      </TableCell>
                      <TableCell className="max-w-[220px] truncate">{t.subject}</TableCell>
                      <TableCell className="whitespace-nowrap">{t.requesterName}</TableCell>
                      <TableCell><StatusBadge status={t.status} /></TableCell>
                      <TableCell><StatusBadge status={t.priority} /></TableCell>
                      <TableCell className="whitespace-nowrap">{formatDate(t.createdAt)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="mx-auto aspect-square max-h-[260px]">
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                <Pie data={distribution} dataKey="value" nameKey="name" innerRadius={55} strokeWidth={4}>
                  {distribution.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
            <div className="mt-2 grid grid-cols-2 gap-1 text-xs">
              {distribution.map((d, i) => (
                <div key={d.name} className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                  <span className="text-muted-foreground">{d.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
