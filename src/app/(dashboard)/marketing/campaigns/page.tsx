"use client";

import { useState } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { DataTable } from "@/components/shared/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { CAMPAIGNS_DATA } from "@/lib/mock/generate";
import type { Campaign } from "@/lib/types";
import { formatDate, formatNumber, formatPct } from "@/lib/format";
import { toast } from "sonner";

function emptyForm(): Omit<Campaign, "id" | "reach" | "conversions"> {
  return {
    name: "", type: "email", status: "draft",
    startDate: new Date().toISOString(), endDate: new Date(Date.now() + 7 * 86400000).toISOString(),
  };
}

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>(CAMPAIGNS_DATA);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm());

  function createCampaign() {
    if (!form.name.trim()) {
      toast.error("Campaign name is required");
      return;
    }
    setCampaigns((prev) => [{ id: `CMP-NEW-${Date.now()}`, reach: 0, conversions: 0, ...form }, ...prev]);
    toast.success(`Campaign "${form.name}" created`);
    setForm(emptyForm());
    setOpen(false);
  }

  const columns: ColumnDef<Campaign, unknown>[] = [
    { accessorKey: "name", header: "Name" },
    { accessorKey: "type", header: "Type", cell: ({ row }) => <StatusBadge status={row.original.type} /> },
    { accessorKey: "status", header: "Status", cell: ({ row }) => <StatusBadge status={row.original.status} /> },
    { accessorKey: "startDate", header: "Start", cell: ({ row }) => formatDate(row.original.startDate) },
    { accessorKey: "endDate", header: "End", cell: ({ row }) => formatDate(row.original.endDate) },
    { accessorKey: "reach", header: "Reach", cell: ({ row }) => formatNumber(row.original.reach) },
    { accessorKey: "conversions", header: "Conversions", cell: ({ row }) => formatNumber(row.original.conversions) },
    {
      id: "conversionRate",
      header: "Conv. Rate",
      cell: ({ row }) => formatPct(row.original.reach ? (row.original.conversions / row.original.reach) * 100 : 0),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Campaigns"
        description={`${campaigns.length} marketing campaigns across all channels`}
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus /> Create Campaign</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Campaign</DialogTitle>
                <DialogDescription>Set up a new marketing campaign as a draft.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-3">
                <div className="grid gap-1.5">
                  <Label>Name</Label>
                  <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-1.5">
                    <Label>Type</Label>
                    <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as Campaign["type"] })}>
                      <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="flash_sale">Flash Sale</SelectItem>
                        <SelectItem value="deal">Deal</SelectItem>
                        <SelectItem value="banner">Banner</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="sms">SMS</SelectItem>
                        <SelectItem value="push">Push</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-1.5">
                    <Label>Status</Label>
                    <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as Campaign["status"] })}>
                      <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="scheduled">Scheduled</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-1.5">
                    <Label>Start Date</Label>
                    <Input type="date" onChange={(e) => setForm({ ...form, startDate: new Date(e.target.value).toISOString() })} />
                  </div>
                  <div className="grid gap-1.5">
                    <Label>End Date</Label>
                    <Input type="date" onChange={(e) => setForm({ ...form, endDate: new Date(e.target.value).toISOString() })} />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button onClick={createCampaign}>Create Campaign</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <DataTable
        columns={columns}
        data={campaigns}
        searchKey="name"
        searchPlaceholder="Search campaigns..."
        exportName="campaigns"
        emptyTitle="No campaigns"
        emptyDescription="Create a campaign to reach customers across channels."
      />
    </div>
  );
}
