"use client";

import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CUSTOMERS_DATA } from "@/lib/mock/generate";
import { formatDateTime } from "@/lib/format";

interface NotifLog {
  id: string;
  recipient: string;
  channel: "email" | "sms" | "push" | "in_app";
  event: string;
  status: "sent" | "failed" | "delivered" | "opened";
  sentAt: string;
}

const EVENTS = ["Order placed", "Payment successful", "Order shipped", "Order delivered", "Refund processed", "Low stock"];
const CHANNELS: NotifLog["channel"][] = ["email", "sms", "push", "in_app"];
const STATUSES: NotifLog["status"][] = ["sent", "delivered", "delivered", "opened", "failed"];

function seededLogs(): NotifLog[] {
  return Array.from({ length: 80 }, (_, i) => {
    const c = CUSTOMERS_DATA[i % CUSTOMERS_DATA.length];
    return {
      id: `LOG-${i + 1}`,
      recipient: c.email,
      channel: CHANNELS[i % CHANNELS.length],
      event: EVENTS[i % EVENTS.length],
      status: STATUSES[i % STATUSES.length],
      sentAt: new Date(Date.now() - i * 3600_000).toISOString(),
    };
  });
}

export default function NotificationLogsPage() {
  const [channelFilter, setChannelFilter] = useState<string>("all");
  const logs = useMemo(() => seededLogs(), []);
  const filtered = useMemo(() => (channelFilter === "all" ? logs : logs.filter((l) => l.channel === channelFilter)), [logs, channelFilter]);

  const columns: ColumnDef<NotifLog, unknown>[] = [
    { accessorKey: "recipient", header: "Recipient" },
    { accessorKey: "channel", header: "Channel", cell: ({ row }) => <span className="capitalize">{row.original.channel}</span> },
    { accessorKey: "event", header: "Event" },
    { accessorKey: "status", header: "Status", cell: ({ row }) => <StatusBadge status={row.original.status} /> },
    { accessorKey: "sentAt", header: "Sent At", cell: ({ row }) => formatDateTime(row.original.sentAt) },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Notification Logs" description="Delivery log across all notification channels" />

      <DataTable
        columns={columns}
        data={filtered}
        searchKey="recipient"
        searchPlaceholder="Search by recipient..."
        exportName="notification-logs"
        toolbarExtra={
          <Select value={channelFilter} onValueChange={setChannelFilter}>
            <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Channels</SelectItem>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="sms">SMS</SelectItem>
              <SelectItem value="push">Push</SelectItem>
              <SelectItem value="in_app">In-App</SelectItem>
            </SelectContent>
          </Select>
        }
      />
    </div>
  );
}
