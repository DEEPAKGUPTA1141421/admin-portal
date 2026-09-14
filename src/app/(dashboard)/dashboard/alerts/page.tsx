"use client";

import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { AlertTriangle, ShieldAlert, Info, CircleAlert } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { KpiCard } from "@/components/shared/kpi-card";
import { DataTable } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ALERTS_DATA } from "@/lib/mock/generate";
import type { AlertItem, Severity } from "@/lib/types";
import { formatDateTime } from "@/lib/format";
import { toast } from "sonner";

export default function DashboardAlertsPage() {
  const [alerts, setAlerts] = useState<AlertItem[]>(ALERTS_DATA);
  const [severityFilter, setSeverityFilter] = useState<Severity | null>(null);

  const counts = useMemo(() => {
    const c: Record<Severity, number> = { critical: 0, high: 0, medium: 0, low: 0 };
    for (const a of alerts) c[a.severity]++;
    return c;
  }, [alerts]);

  const filtered = useMemo(
    () => (severityFilter ? alerts.filter((a) => a.severity === severityFilter) : alerts),
    [alerts, severityFilter]
  );

  function resolve(id: string) {
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, resolved: true } : a)));
    toast.success("Alert marked as resolved");
  }

  const columns: ColumnDef<AlertItem, unknown>[] = [
    { accessorKey: "title", header: "Title" },
    { accessorKey: "description", header: "Description", cell: ({ row }) => <span className="max-w-xs truncate block text-muted-foreground">{row.original.description}</span> },
    { accessorKey: "severity", header: "Severity", cell: ({ row }) => <StatusBadge status={row.original.severity} /> },
    { accessorKey: "module", header: "Module" },
    { accessorKey: "createdAt", header: "Created", cell: ({ row }) => formatDateTime(row.original.createdAt) },
    {
      accessorKey: "resolved",
      header: "Status",
      cell: ({ row }) => <Badge variant={row.original.resolved ? "outline" : "secondary"}>{row.original.resolved ? "Resolved" : "Open"}</Badge>,
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) =>
        row.original.resolved ? null : (
          <Button size="sm" variant="outline" onClick={() => resolve(row.original.id)}>
            Resolve
          </Button>
        ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="System Alerts" description="Marketplace-wide operational and risk alerts" />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <button onClick={() => setSeverityFilter(severityFilter === "critical" ? null : "critical")} className="text-left">
          <KpiCard label="Critical" value={String(counts.critical)} icon={ShieldAlert} tone="red" />
        </button>
        <button onClick={() => setSeverityFilter(severityFilter === "high" ? null : "high")} className="text-left">
          <KpiCard label="High" value={String(counts.high)} icon={AlertTriangle} tone="orange" />
        </button>
        <button onClick={() => setSeverityFilter(severityFilter === "medium" ? null : "medium")} className="text-left">
          <KpiCard label="Medium" value={String(counts.medium)} icon={CircleAlert} tone="blue" />
        </button>
        <button onClick={() => setSeverityFilter(severityFilter === "low" ? null : "low")} className="text-left">
          <KpiCard label="Low" value={String(counts.low)} icon={Info} />
        </button>
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        searchKey="title"
        searchPlaceholder="Search alerts..."
        exportName="alerts"
        emptyTitle="No alerts"
        emptyDescription="No alerts match the current filter."
      />
    </div>
  );
}
