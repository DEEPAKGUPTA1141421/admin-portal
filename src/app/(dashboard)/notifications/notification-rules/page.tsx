"use client";

import { useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable } from "@/components/shared/data-table";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface NotificationRule {
  id: string;
  event: string;
  channel: string;
  delayMinutes: number;
  active: boolean;
}

const INITIAL_RULES: NotificationRule[] = [
  { id: "RULE-1", event: "Order Delivered", channel: "email", delayMinutes: 0, active: true },
  { id: "RULE-2", event: "Order Delivered", channel: "push", delayMinutes: 60, active: true },
  { id: "RULE-3", event: "Payment Failed", channel: "sms", delayMinutes: 0, active: true },
  { id: "RULE-4", event: "Cart Abandoned", channel: "email", delayMinutes: 120, active: false },
  { id: "RULE-5", event: "Seller Suspended", channel: "email", delayMinutes: 0, active: true },
  { id: "RULE-6", event: "Return Approved", channel: "sms", delayMinutes: 15, active: true },
];

export default function NotificationRulesPage() {
  const [rules, setRules] = useState<NotificationRule[]>(INITIAL_RULES);
  const [open, setOpen] = useState(false);
  const [event, setEvent] = useState("");
  const [channel, setChannel] = useState("email");
  const [delay, setDelay] = useState("0");

  function toggle(id: string) {
    setRules((prev) => prev.map((r) => (r.id === id ? { ...r, active: !r.active } : r)));
  }

  function addRule() {
    if (!event.trim()) {
      toast.error("Event trigger is required");
      return;
    }
    setRules((prev) => [...prev, { id: `RULE-${prev.length + 1}`, event, channel, delayMinutes: Number(delay) || 0, active: true }]);
    toast.success("Automation rule created");
    setOpen(false);
    setEvent("");
    setDelay("0");
  }

  const columns: ColumnDef<NotificationRule, unknown>[] = [
    { accessorKey: "event", header: "Event Trigger" },
    { accessorKey: "channel", header: "Channel", cell: ({ row }) => <span className="capitalize">{row.original.channel}</span> },
    { accessorKey: "delayMinutes", header: "Delay", cell: ({ row }) => (row.original.delayMinutes === 0 ? "Immediate" : `${row.original.delayMinutes} min`) },
    {
      accessorKey: "active",
      header: "Active",
      cell: ({ row }) => <Switch checked={row.original.active} onCheckedChange={() => toggle(row.original.id)} />,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notification Rules"
        description="Automation rules that trigger notifications on marketplace events"
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="size-4" /> Add Rule</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>New Notification Rule</DialogTitle>
                <DialogDescription>Define an event trigger, channel and delay.</DialogDescription>
              </DialogHeader>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label>Event Trigger</Label>
                  <Input value={event} onChange={(e) => setEvent(e.target.value)} placeholder="e.g. Order Delivered" />
                </div>
                <div className="space-y-1.5">
                  <Label>Channel</Label>
                  <Select value={channel} onValueChange={setChannel}>
                    <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="sms">SMS</SelectItem>
                      <SelectItem value="push">Push</SelectItem>
                      <SelectItem value="in_app">In-App</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Delay (minutes)</Label>
                  <Input type="number" value={delay} onChange={(e) => setDelay(e.target.value)} />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={addRule}>Create Rule</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <DataTable columns={columns} data={rules} searchKey="event" searchPlaceholder="Search rules..." exportName="notification-rules" />
    </div>
  );
}
