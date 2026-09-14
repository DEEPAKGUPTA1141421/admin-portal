"use client";

import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { NOTIFICATION_TEMPLATES_DATA } from "@/lib/mock/generate";
import type { NotificationTemplate } from "@/lib/types";
import { formatDate } from "@/lib/format";
import { toast } from "sonner";

const SAMPLE_BODY = "Hi {{customer_name}}, your order {{order_id}} of {{order_amount}} is confirmed. Track: {{tracking_number}}.";

export default function SmsTemplatesPage() {
  const data = useMemo(() => NOTIFICATION_TEMPLATES_DATA.filter((t) => t.channel === "sms"), []);
  const [editing, setEditing] = useState<NotificationTemplate | null>(null);
  const [body, setBody] = useState(SAMPLE_BODY);
  const [active, setActive] = useState(true);

  function openEdit(t: NotificationTemplate) {
    setEditing(t);
    setBody(SAMPLE_BODY);
    setActive(t.status === "active");
  }

  const columns: ColumnDef<NotificationTemplate, unknown>[] = [
    { accessorKey: "name", header: "Template Name" },
    { accessorKey: "event", header: "Event" },
    { accessorKey: "status", header: "Status", cell: ({ row }) => <StatusBadge status={row.original.status} /> },
    { accessorKey: "updatedAt", header: "Updated", cell: ({ row }) => formatDate(row.original.updatedAt) },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <Button size="sm" variant="outline" onClick={() => openEdit(row.original)}>Edit Template</Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="SMS Templates" description="Manage transactional SMS templates" />

      <DataTable columns={columns} data={data} searchKey="name" searchPlaceholder="Search templates..." exportName="sms-templates" />

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing?.name}</DialogTitle>
            <DialogDescription>Edit the SMS body. Use variables like {"{{customer_name}}"}, {"{{order_id}}"}, {"{{order_amount}}"}, {"{{tracking_number}}"}, {"{{product_name}}"}.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Textarea value={body} onChange={(e) => setBody(e.target.value)} rows={4} maxLength={160} className="font-mono text-xs" />
            <p className="text-xs text-muted-foreground">{body.length}/160 characters</p>
            <div className="flex items-center justify-between rounded-md border p-3">
              <span className="text-sm">Template Active</span>
              <Switch checked={active} onCheckedChange={setActive} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => toast.success("Test SMS sent")}>Send Test</Button>
            <Button onClick={() => { toast.success("Template saved"); setEditing(null); }}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
